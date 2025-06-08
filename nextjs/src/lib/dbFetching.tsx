'use server'

import { Pool, QueryResultRow, DatabaseError } from "pg"
import { MentirosoDAO } from "./mentiroso"
import { MentiraSummaryDAO } from "./mentiras"
import { PageDAO } from "./ui/infiScroll"
import { isDevMode } from "./system"

const MAX_MENTIRA_RESULTS_WEBSEARCH_PER_QUERY = 10
const MAX_MENTIROSOS_LANDING_PAGE_PER_QUERY = 10
const MAX_NUM_INITIAL_MENTIRAS_MENTIROSO_PAGE = 20
const MAX_NUM_MENTIRAS_PER_PAGE_MENTIROSO_PAGE = 10


// Beware that the pool is never gracefully shut-down. This is because the application is designed
// to (potentially) run on a serverless architecture. Hence, to avoid dangling connections, timeouts
// will be (aggressively) handled on the database server side.
const PGSQL_CONNECTION_POOL = new Pool({
    connectionTimeoutMillis: 30000,
    idleTimeoutMillis: 60000,
    max: 2,
    allowExitOnIdle: true
})

const PGSQL_IDLE_DISCONNECT_FROM_SERVER_ERR_CODE = "57P05"

PGSQL_CONNECTION_POOL.on('error', (err) => {
    if (err instanceof DatabaseError && err.code && err.code == PGSQL_IDLE_DISCONNECT_FROM_SERVER_ERR_CODE) {
        // We can safely ignore server-disconnect errors, a new connection will be created.
        // TODO: we should log this to fine-tune a good DB connection idle timeout.
        return
    }
    throw err
})

async function submitQuery<T extends QueryResultRow>(query: string, parameters?: any[]) {
    if (isDevMode()) {
        // Introduce some lag, to simulate network latency
        await new Promise(r => setTimeout(r, 500))
    }
    if (parameters) {
        return (await PGSQL_CONNECTION_POOL.query<T>(query, parameters)).rows
    } else {
        return (await PGSQL_CONNECTION_POOL.query<T>(query)).rows
    }
}

// Materialized queries are really fast, as they're pre-computed whenever Mentirosos or Mentiras are updated
export async function getTopMentirososView() {
    return submitQuery("SELECT * FROM TopMentirosos LIMIT 10;")
}

export async function getTotalNumberOfMentirosos(): Promise<number> {
    const x = await submitQuery("SELECT total_mentirosos FROM TotalMentirosos;")
    if (!x) {
        return 0
    }
    return x[0].total_mentirosos
}

// IMPORTANT: this function ignores the very first TOP Mentirosos, because those are already included in the materialized view.
// Hence, offsetRows = 0 really means offsetRows = topMentirososViewRows
export async function pagedTopMentirososSearch(offsetRows: number): Promise<PageDAO> {
    // TODO: A new method for breaking ties can be implemented. Maybe the Mentiroso with the most recent lie.
    const x = await submitQuery(`
        SELECT mo.id, mo.slug, nombre_completo, alias, retrato_s3_key, COUNT(ma.id) AS num_of_mentiras
        FROM Mentirosos mo
        JOIN Mentiras ma ON mo.id = ma.mentiroso_id
        GROUP BY (mo.id, mo.slug, nombre_completo, alias, retrato_s3_key)
        ORDER BY num_of_mentiras DESC, nombre_completo ASC, mo.id ASC
        LIMIT $1
        OFFSET $2 + (SELECT COUNT(*) FROM TopMentirosos);
    `, [MAX_MENTIROSOS_LANDING_PAGE_PER_QUERY.toString(), offsetRows.toString()])
    let items = x
    if (!items) {
        items = []
    }
    return {
        pageItems: items,
        isLastPage: items.length < MAX_MENTIROSOS_LANDING_PAGE_PER_QUERY
    }
}

// For the mentiroso landing page
export async function pagedMentirosoMentirasFetch(mentirosoId: number, offsetRows: number): Promise<PageDAO> {
    const x = await submitQuery(`
        SELECT ma.id, ma.slug, fecha, mentira FROM Mentiras ma
        WHERE ma.mentiroso_id = $1
        ORDER BY fecha DESC, mentira ASC, ma.id ASC
        LIMIT $2
        OFFSET $3::integer + $4::integer;
    `, [mentirosoId, MAX_NUM_MENTIRAS_PER_PAGE_MENTIROSO_PAGE.toString(), MAX_NUM_INITIAL_MENTIRAS_MENTIROSO_PAGE, offsetRows])
    let items = x
    if (!items) {
        items = []
    }
    return {
        pageItems: items,
        isLastPage: items.length < MAX_NUM_MENTIRAS_PER_PAGE_MENTIROSO_PAGE
    }
}

// Better to get as much data as possible in one go
export async function getMentirosoLandingPageData(mentiroso_slug: string): Promise<{mentirosoData: MentirosoDAO, numMentiras: number, mentiras: MentiraSummaryDAO[]}> {
    const x = await submitQuery(`
        WITH t1 AS (
            SELECT * FROM Mentirosos WHERE slug = $1
        ),
        t2 AS (
            SELECT ma.id, ma.slug, fecha, mentira FROM Mentiras ma
            INNER JOIN t1 ON t1.id = ma.mentiroso_id
        ),
        t3 AS (
            SELECT * FROM t2
            ORDER BY t2.fecha DESC, t2.mentira ASC, t2.id ASC
            LIMIT $2
        ),
        t4 AS (
            SELECT COUNT(*) as total_mentiras FROM t2
        )
        SELECT json_build_object(
            'mentirosoData' , (SELECT to_json(t1) FROM t1),
            'numMentiras'   , (SELECT total_mentiras FROM t4),
            'mentiras'      , (SELECT json_agg(to_json(t3)) FROM t3)
        ) AS json_obj;
    `, [mentiroso_slug, MAX_NUM_INITIAL_MENTIRAS_MENTIROSO_PAGE.toString()])
    return x[0].json_obj
}

export async function getMentiraData(mentiraSlug: string) {
    const x = await submitQuery(`
        WITH t1 AS (
            SELECT id, mentiroso_id, fecha, mentira, contexto, youtube_video_hash, youtube_video_start_time, youtube_video_end_time
            FROM Mentiras WHERE slug = $1
        ),
        t2 AS (
            SELECT mo.id, nombre_completo, retrato_s3_key, alias FROM Mentirosos mo
            INNER JOIN t1 ON t1.mentiroso_id = mo.id
        ),
        t3 AS (
            SELECT fm.id, fm.texto, fm.hyperlink FROM FuentesMentira fm
            INNER JOIN t1 ON t1.id = fm.mentira_id
        )
        SELECT json_build_object(
            'mentira'   , (SELECT to_json(t1) FROM t1),
            'mentiroso' , (SELECT to_json(t2) FROM t2),
            'fuentes'   , (SELECT json_agg(to_json(t3)) FROM t3)
        ) AS json_obj;
    `, [mentiraSlug])
    const jsonResponse = x[0].json_obj
    if (!jsonResponse.fuentes) {
        jsonResponse.fuentes = []
    }
    return jsonResponse
}

// Performs full-text search.
// Returns the mentira slug, for redirection.
// minRank is used for fetching results in a paginated fashion
export async function webSearchMentira(mentiraQuery: string, minRank = 0): Promise<PageDAO> {
    const x = await submitQuery(`
        WITH t1 AS (
            SELECT websearch_to_tsquery('spanish', $1) AS query
        ),
        t2 AS (
            SELECT
                ma.id as id,
                ma.mentira,
                mo.nombre_completo AS mentiroso,
                mo.retrato_s3_key,
                ma.fecha,
                ma.slug,
                TS_RANK(ma.search_bag_of_words_vec, t1.query) AS searchRank
            FROM Mentiras ma
            INNER JOIN Mentirosos mo ON mo.id = ma.mentiroso_id, t1
            WHERE ma.search_bag_of_words_vec @@ t1.query
            ORDER BY searchRank DESC, fecha DESC, id ASC
            LIMIT $2
            OFFSET $3
        )
        SELECT id, mentira, mentiroso, retrato_s3_key, fecha, slug FROM t2
    `, [mentiraQuery, MAX_MENTIRA_RESULTS_WEBSEARCH_PER_QUERY.toString(), minRank.toString()])
    let items = x
    if (!items) {
        items = []
    }
    return {
        pageItems: items,
        isLastPage: items.length < MAX_MENTIRA_RESULTS_WEBSEARCH_PER_QUERY
    }
}