'use server'

import { Pool, QueryResultRow } from "pg"
import { MentirosoDAO } from "./mentiroso"
import { MentiraSummaryDAO } from "./mentiras"

// Beware that the pool is never gracefully shut-down. This is because the application is designed
// to (potentially) run on a serverless architecture. Hence, to avoid dangling connections, timeouts
// will be (aggressively) handled on the database server side.
const PGSQL_CONNECTION_POOL = new Pool({
    connectionTimeoutMillis: 30000,
    idleTimeoutMillis: 60000,
    max: 2,
    allowExitOnIdle: true
})

async function submitQuery<T extends QueryResultRow>(query: string, parameters?: string[]) {
    if (parameters) {
        return (await PGSQL_CONNECTION_POOL.query<T>(query, parameters)).rows
    } else {
        return (await PGSQL_CONNECTION_POOL.query<T>(query)).rows
    }
}

export async function getTopMentirososView() {
    return submitQuery("SELECT * FROM TopMentirosos LIMIT 10;")
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
            ORDER BY t2.fecha DESC
            LIMIT 5
        ),
        t4 AS (
            SELECT COUNT(*) as total_mentiras FROM t2
        )
        SELECT json_build_object(
            'mentirosoData' , (SELECT to_json(t1) FROM t1),
            'numMentiras'   , (SELECT total_mentiras FROM t4),
            'mentiras'      , (SELECT json_agg(to_json(t3)) FROM t3)
        ) AS json_obj;
    `, [mentiroso_slug])
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
    return x[0].json_obj
}

// Performs full-text search.
// Returns the mentira slug, for redirection
export async function webSearchMentira(mentiraQuery: string) {
    return [
        {
            "mentira": "Nunca dije que me hubiera fumado un porro",
            "slug": "amet-quis-libero-impedit-molestiae-aliquid-voluptates-omnis",
            "mentiroso": "Pedro Sánchez"
        }
    ]
}
