from faker import Faker
from datetime import date, datetime
from lib import log


MENTIROSOS_BASE = [
    {
        "nombre_completo": "Pedro Sánchez",
        "alias": "Perro Sánches"
    },
    {
        "nombre_completo": "Jose Luis Ábalos",
        "alias": "Torrente"
    },
    {
        "nombre_completo": "Koldo",
        "alias": None
    },
    {
        "nombre_completo": "Yolanda Díaz",
        "alias": "Yoli Tenacillas"
    }
]
NOMBRES_MENTIROSOS_BASE = { x["nombre_completo"] for x in MENTIROSOS_BASE }


MENTIRAS_BASE = {
    "Pedro Sánchez" : [
        {
            "fecha": "01/01/1969",
            "mentira": "No podría dormir si pactara con Pablo Iglesias",
            "contexto": "Campaña electoral 2019"
        },
        {
            "fecha": "01/02/1969",
            "mentira": "No soy más guapo porque no puedo",
            "contexto": "Campaña electoral 2020"
        },
        {
            "fecha": "01/03/1969",
            "mentira": "Jamás me he fumado un porro, lo juro",
            "contexto": "Campaña electoral 2021"
        }
    ]
}

MENTIROSOS_TOTALES = 50
MENTIRAS_MIN = 1
MENTIRAS_MAX = 10

FUENTES_MENTIRA_MAX = 8

MENTIRAS_OVERRIDE_COUNT = {
    "Pedro Sánchez":  {
        "mentiras_offset": 50
    },
    "Jose Luis Ábalos":  {
        "mentiras_offset": 25
    },
    "Koldo":  {
        "mentiras_offset": 10
    }
}

# For embedded youtube videos
DUMMY_VIDEO_HASH = "UbRE9_S5yTE"
DUMMY_VIDEO_START_TIME = 80
DUMMY_VIDEO_END_TIME = 88


def insert_mentira_query(db_cursor, mentiroso_id, fecha, mentira, contexto, video_hash, video_start_time, video_end_time):
    db_cursor.execute("""
        INSERT INTO Mentiras (mentiroso_id, fecha, mentira, contexto, youtube_video_hash, youtube_video_start_time, youtube_video_end_time) 
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        RETURNING ID
    """, (mentiroso_id, fecha , mentira, contexto, video_hash, video_start_time, video_end_time))
    return db_cursor.fetchone()

def insert_mentira_fuente_query(db_cursor, mentira_id, texto, hyperlink):
    db_cursor.execute("""
        INSERT INTO FuentesMentira (mentira_id, texto, hyperlink) VALUES (%s, %s, %s)
    """, (mentira_id, texto, hyperlink))


def get_mentiroso_portrait_key(mentiroso):
    basename = mentiroso["nombre_completo"] if mentiroso["nombre_completo"] in NOMBRES_MENTIROSOS_BASE else "__placeholder__"
    return F"assets/pictures/portraits/{basename}.webp"

def populate_mentiroso(mentiroso, db_cursor, fake):
    db_cursor.execute("""
        INSERT INTO Mentirosos (nombre_completo, alias, retrato_s3_key) VALUES (%s, %s, %s)
        RETURNING ID
    """, (mentiroso["nombre_completo"], mentiroso["alias"], get_mentiroso_portrait_key(mentiroso)))
    mentiroso_id = db_cursor.fetchone()
    if mentiroso["nombre_completo"] in MENTIRAS_BASE.keys():
        for mentira in MENTIRAS_BASE[mentiroso["nombre_completo"]]:
            mentira_id = insert_mentira_query(
                db_cursor, mentiroso_id, datetime.strptime(mentira["fecha"], "%d/%m/%Y") , mentira["mentira"], mentira["contexto"],
                DUMMY_VIDEO_HASH, DUMMY_VIDEO_START_TIME, DUMMY_VIDEO_END_TIME
            )
            for _ in range(0, fake.pyint(0, FUENTES_MENTIRA_MAX)):
                insert_mentira_fuente_query(db_cursor, mentira_id, fake.sentence(8, variable_nb_words=True), "https://es.wikipedia.org/wiki/Mentira")

    number_of_additional_mentiras = fake.pyint(MENTIRAS_MIN, MENTIRAS_MAX)
    if mentiroso["nombre_completo"] in MENTIRAS_OVERRIDE_COUNT.keys():
        number_of_additional_mentiras += MENTIRAS_OVERRIDE_COUNT[mentiroso["nombre_completo"]]["mentiras_offset"]
    for _ in range(0, number_of_additional_mentiras):
        mentira_id = insert_mentira_query(
            db_cursor, mentiroso_id, fake.date_between_dates(date.fromisoformat("1969-01-01"), date.fromisoformat("2025-01-01")),
            fake.sentence(12, variable_nb_words=True), fake.paragraph(4, variable_nb_sentences=True),
            DUMMY_VIDEO_HASH, DUMMY_VIDEO_START_TIME, DUMMY_VIDEO_END_TIME
        )
        for _ in range(0, fake.pyint(0, FUENTES_MENTIRA_MAX)):
            insert_mentira_fuente_query(db_cursor, mentira_id, fake.sentence(8, variable_nb_words=True), "https://es.wikipedia.org/wiki/Mentira")



def seed_postgresdb(db_cursor, db_con):
    Faker.seed(3141592)
    fake = Faker(locale="es_ES")
    for mentiroso in MENTIROSOS_BASE:
        populate_mentiroso(mentiroso, db_cursor, fake)
    for _ in range(0, MENTIROSOS_TOTALES - len(MENTIROSOS_BASE)):
        fake_mentiroso = {
            "alias": fake.name(),
            "nombre_completo": fake.name()
        }
        populate_mentiroso(fake_mentiroso, db_cursor, fake)
    # Update the landing page materialized views
    db_cursor.execute("REFRESH MATERIALIZED VIEW TopMentirosos;")
    db_cursor.execute("REFRESH MATERIALIZED VIEW TotalMentirosos;")
    db_con.commit()


def seed_s3(s3_client):
    for mentiroso in MENTIROSOS_BASE + [{"alias": "fake", "nombre_completo": "fake"}]:
        s3_key = get_mentiroso_portrait_key(mentiroso)
        with open(F"./{s3_key}", 'rb') as portait_file:
            s3_client.put_object(Bucket = "public", Body = portait_file, Key = s3_key)
