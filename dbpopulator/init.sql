CREATE TABLE IF NOT EXISTS Mentirosos (
    id                      SERIAL          PRIMARY KEY,
    nombre_completo         VARCHAR(200)    UNIQUE NOT NULL,
    alias                   VARCHAR(200)    UNIQUE
);
CREATE INDEX IF NOT EXISTS mentiroso_id ON Mentirosos USING HASH(id);


CREATE TABLE IF NOT EXISTS Mentiras (
    id                      SERIAL          PRIMARY KEY,
    mentiroso_id            SERIAL          REFERENCES Mentirosos(id) NOT NULL,
    fecha                   TIMESTAMPTZ     NOT NULL,
    mentira                 VARCHAR(10000)  NOT NULL UNIQUE,
    contexto                VARCHAR(10000)  NOT NULL,
    search_bag_of_words_vec TSVECTOR        NOT NULL
);


CREATE INDEX IF NOT EXISTS mentira_id ON Mentiras USING HASH(id);
CREATE INDEX IF NOT EXISTS mentira_search_vector ON Mentiras USING GIN(search_bag_of_words_vec);

-- TRIGGERS FOR FULL TEXT SEARCH VECTORS AUTOGENERATION

-- Populate the search vector (bag of words) on each insert/update
CREATE OR REPLACE FUNCTION make_mentira_search_vector_on_mentira_update() RETURNS trigger AS $make_mentira_search_vector_on_mentira_update$
    DECLARE
        v_nombre_completo   VARCHAR(200);
        v_alias             VARCHAR(200);
    BEGIN
        SELECT nombre_completo, alias
        INTO v_nombre_completo, v_alias
        FROM Mentirosos
        WHERE id = NEW.mentiroso_id;

        NEW.search_bag_of_words_vec :=
            setweight(to_tsvector('spanish', coalesce(v_nombre_completo, '')), 'A') ||
            setweight(to_tsvector('spanish', coalesce(NEW.mentira, '')), 'A') ||
            setweight(to_tsvector('spanish', coalesce(v_alias, '')), 'B') ||
            setweight(to_tsvector('spanish', coalesce(NEW.contexto, '')), 'B');

        RETURN NEW;
    END;
$make_mentira_search_vector_on_mentira_update$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER make_mentira_search_vector_on_mentira_update_trigger BEFORE INSERT OR UPDATE ON Mentiras
    FOR EACH ROW EXECUTE FUNCTION make_mentira_search_vector_on_mentira_update();

-- Applies to both tables
CREATE OR REPLACE FUNCTION make_mentira_search_vector_on_mentiroso_update() RETURNS trigger AS $make_mentira_search_vector_on_mentiroso_update$
    BEGIN
        UPDATE Mentiras SET search_bag_of_words_vec = (
            setweight(to_tsvector('spanish',coalesce(nombre_completo, '')), 'A') ||
            setweight(to_tsvector('spanish',coalesce(Mentiras.mentira, '')), 'A') ||
            setweight(to_tsvector('spanish',coalesce(alias, '')), 'B') ||
            setweight(to_tsvector('spanish',coalesce(Mentiras.contexto, '')), 'B')
        )
        WHERE Mentiras.mentiroso_id = NEW.id;

        RETURN NEW;
    END;
$make_mentira_search_vector_on_mentiroso_update$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER make_mentira_search_vector_on_mentiroso_update_trigger AFTER UPDATE ON Mentirosos
    FOR EACH ROW EXECUTE FUNCTION make_mentira_search_vector_on_mentiroso_update();
