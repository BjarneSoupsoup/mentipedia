from faker import Faker
from datetime import date, datetime

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

def seed_db(db_cursor, db_con):
    Faker.seed(3141592)
    fake = Faker(locale="es_ES")
    for mentiroso in MENTIROSOS_BASE:
        db_cursor.execute("""
            INSERT INTO Mentirosos (nombre_completo, alias) VALUES (%s, %s)
        """, (mentiroso["nombre_completo"], mentiroso["alias"]))
        db_con.commit()
        db_cursor.execute("SELECT id from Mentirosos WHERE nombre_completo = %s", (mentiroso["nombre_completo"], ))
        mentiroso_id = db_cursor.fetchone()
        if mentiroso["nombre_completo"] in MENTIRAS_BASE.keys():
            for mentira in MENTIRAS_BASE[mentiroso["nombre_completo"]]:
                db_cursor.execute("""
                    INSERT INTO Mentiras (mentiroso_id, fecha, mentira, contexto) VALUES (%s, %s, %s, %s)
                """, (mentiroso_id, datetime.strptime(mentira["fecha"], "%d/%m/%Y") , mentira["mentira"], mentira["contexto"]))
        number_of_additional_mentiras = fake.pyint(MENTIRAS_MIN, MENTIRAS_MAX)
        if mentiroso["nombre_completo"] in MENTIRAS_OVERRIDE_COUNT.keys():
            number_of_additional_mentiras += MENTIRAS_OVERRIDE_COUNT[mentiroso["nombre_completo"]]["mentiras_offset"]
        print(F"Mentiroso: {mentiroso["nombre_completo"]} mentiroso_id = {mentiroso_id}")
        for _ in range(0, number_of_additional_mentiras):
            db_cursor.execute("""
                INSERT INTO Mentiras (mentiroso_id, fecha, mentira, contexto) VALUES (%s, %s, %s, %s)
            """, (
                mentiroso_id, fake.date_between_dates(date.fromisoformat("1969-01-01"), date.fromisoformat("2025-01-01")),
                fake.sentence(12, variable_nb_words=True), fake.paragraph(4, variable_nb_sentences=True)
            ))
        db_con.commit()



