-- Connection setup. Crucial for dealing with dangling connections

ALTER DATABASE mentipedia SET idle_in_transaction_session_timeout = '1min';
ALTER DATABASE mentipedia SET idle_session_timeout = '1min';

-- SCHEMA DEFINITIONS

CREATE TABLE IF NOT EXISTS Mentirosos (
    id                      SERIAL          PRIMARY KEY,
    nombre_completo         VARCHAR(200)    UNIQUE NOT NULL,
    alias                   VARCHAR(200)    UNIQUE,
    slug                    VARCHAR(200)    UNIQUE NOT NULL,
    retrato_s3_key          VARCHAR(500)    NOT NULL
);
CREATE INDEX IF NOT EXISTS mentiroso_id_udx ON Mentirosos USING HASH(id);
CREATE INDEX IF NOT EXISTS mentiroso_slug_idx ON Mentirosos USING HASH(slug);


CREATE TABLE IF NOT EXISTS Mentiras (
    id                      SERIAL          PRIMARY KEY,
    mentiroso_id            SERIAL          REFERENCES Mentirosos(id) NOT NULL,
    slug                    VARCHAR(200)    UNIQUE NOT NULL,
    fecha                   TIMESTAMPTZ     NOT NULL,
    mentira                 VARCHAR(10000)  NOT NULL UNIQUE,
    contexto                VARCHAR(10000)  NOT NULL,
    search_bag_of_words_vec TSVECTOR        NOT NULL
);


CREATE INDEX IF NOT EXISTS mentira_id_idx ON Mentiras USING HASH(id);
CREATE INDEX IF NOT EXISTS mentira_mentiroso_id_idx ON Mentiras USING HASH(mentiroso_id);
CREATE INDEX IF NOT EXISTS mentira_slug_idx ON Mentiras USING HASH(slug);
CREATE INDEX IF NOT EXISTS mentira_fecha_idx ON Mentiras USING BTREE(fecha);
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


-- Slugify function for easier management of permalinks

CREATE EXTENSION IF NOT EXISTS unaccent;
CREATE OR REPLACE FUNCTION slugify(v TEXT) RETURNS TEXT LANGUAGE plpgsql STRICT IMMUTABLE AS $function$
    BEGIN
    -- 1. trim trailing and leading whitespaces from text
    -- 2. remove accents (diacritic signs) from a given text
    -- 3. lowercase unaccented text
    -- 4. replace non-alphanumeric (excluding hyphen, underscore) with a hyphen
    -- 5. trim leading and trailing hyphens
    RETURN trim(BOTH '-' FROM regexp_replace(lower(unaccent(trim(v))), '[^a-z0-9\\-_]+', '-', 'gi'));
    END;
$function$;

CREATE OR REPLACE FUNCTION make_slug_on_mentiroso() RETURNS trigger AS $make_slug_on_mentiroso$
    BEGIN
        NEW.slug := slugify(NEW.nombre_completo);

        RETURN NEW;
    END;
$make_slug_on_mentiroso$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER make_slug_on_mentiroso_trigger BEFORE INSERT OR UPDATE ON Mentirosos
    FOR EACH ROW EXECUTE FUNCTION make_slug_on_mentiroso();


CREATE OR REPLACE FUNCTION make_slug_on_mentira() RETURNS trigger AS $make_slug_on_mentira$
    DECLARE
        mentira_words           TEXT[];
        no_words_to_consider    SMALLINT;
    BEGIN
        mentira_words := regexp_split_to_array(trim(NEW.mentira), '\s+');
        no_words_to_consider := LEAST(array_length(mentira_words, 1), 10);
        NEW.slug := slugify(array_to_string(mentira_words[1:no_words_to_consider], ' '));

        RETURN NEW;
    END;
$make_slug_on_mentira$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER make_slug_on_mentira_trigger BEFORE INSERT OR UPDATE ON Mentiras
    FOR EACH ROW EXECUTE FUNCTION make_slug_on_mentira();



-- Materialized view for faster retrieval of information for the landing page

CREATE MATERIALIZED VIEW IF NOT EXISTS TopMentirosos AS
    SELECT mo.id, mo.slug, nombre_completo, alias, retrato_s3_key, COUNT(ma.id) AS num_of_mentiras
    FROM Mentirosos mo
    JOIN Mentiras ma ON mo.id = ma.mentiroso_id
    GROUP BY (mo.id, mo.slug, nombre_completo, alias, retrato_s3_key)
    ORDER BY num_of_mentiras DESC
    LIMIT 10;
