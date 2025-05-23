import { Client as PgsqlClient } from "pg"
import memoize from "memoize"

async function __get_pgsql_db_con() {
    const client = new PgsqlClient()
    client.connect()
    return client
}
export const get_pgsql_db_con = memoize(__get_pgsql_db_con)