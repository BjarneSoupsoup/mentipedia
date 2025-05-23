import argparse
import psycopg2
import seeder
import multiprocessing as mp
import boto3
import json
from lib import log

def init_postgresdb(pgsql_connection_str, run_seeder: bool):
    with psycopg2.connect(pgsql_connection_str) as db_con:
        with db_con.cursor() as cursor:
            log("Running init.sql ...")
            with open("./init.sql", "r") as init_sql_file:
                cursor.execute(init_sql_file.read())
            db_con.commit()
            log("Finished running init.sql")
            if run_seeder:
                log("Running seeder ...")
                cursor.execute("""
                    DELETE FROM Mentiras;
                    DELETE FROM Mentirosos;
                """)
                seeder.seed_postgresdb(cursor, db_con)
                db_con.commit()
                log("Done")


def init_s3(host, access_key, secret_key, run_seeder):
    s3_client =  boto3.client(
        's3',
        endpoint_url = F"http://{host}:9000",
        aws_access_key_id = access_key,
        aws_secret_access_key = secret_key
    )
    if run_seeder:
        try:
            s3_client.delete_bucket(Bucket = "public")
        except:
            pass
    try:
        s3_client.head_bucket(Bucket = "public")
    except:
        log("Public S3 bucket did not exist, creating ...")
        # Make the bucket public for browsers to directly access
        s3_client.create_bucket(Bucket = 'public', ACL = 'public-read')
        bucket_policy = {
            'Version': '2012-10-17',
            'Statement': [{
                'Sid': 'AddPerm',
                'Effect': 'Allow',
                'Principal': '*',
                'Action': ['s3:GetObject'],
                'Resource': f'arn:aws:s3:::public/*'
            }]
        }
        bucket_policy = json.dumps(bucket_policy)
        s3_client.put_bucket_policy(Bucket="public", Policy=bucket_policy)
    if run_seeder:
        seeder.seed_s3(s3_client)
    s3_client.close()


## MAIN ##

argparser = argparse.ArgumentParser("dbpopulator")
argparser.add_argument("--pgsql-connection-str", type = str)
argparser.add_argument("--minio-host", type = str)
argparser.add_argument("--minio-access-key", type = str)
argparser.add_argument("--minio-secret-key", type = str)
argparser.add_argument("--run-seeder", action = "store_true")
args = argparser.parse_args()

tasks = [
    lambda : init_postgresdb(args.pgsql_connection_str, args.run_seeder),
    lambda : init_s3(args.minio_host, args.minio_access_key, args.minio_secret_key, args.run_seeder)
]

tasks = [ mp.Process(target = x, args = ()) for x in tasks ]

for task in tasks:
    task.start()

for task in tasks:
    task.join()