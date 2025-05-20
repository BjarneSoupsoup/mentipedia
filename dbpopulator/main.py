import argparse
import psycopg2
import json
from datetime import datetime, timezone
import seeder

def log(msg):
    print(json.dumps({
        "timestamp": datetime.now(tz = timezone.utc).isoformat(),
        "msg": msg
    }))

## MAIN ##

argparser = argparse.ArgumentParser("dbpopulator")
argparser.add_argument("--pgsql-connection-str", type = str)
argparser.add_argument("--run-seeder", action = "store_true")
args = argparser.parse_args()

with psycopg2.connect(args.pgsql_connection_str) as db_con:
    with db_con.cursor() as cursor:
        log("Running init.sql ...")
        with open("./init.sql", "r") as init_sql_file:
            cursor.execute(init_sql_file.read())
        db_con.commit()
        log("Done")
        if args.run_seeder:
            log("Running seeder ...")
            cursor.execute("""
                DELETE FROM Mentiras;
                DELETE FROM Mentirosos;
            """)
            seeder.seed_db(cursor, db_con)
            db_con.commit()
            log("Done")
