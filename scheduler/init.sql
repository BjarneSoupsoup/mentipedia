CREATE TABLE IF NOT EXISTS ScheduledTasks (
    id                  INTEGER         PRIMARY KEY AUTOINCREMENT,
    enqueueTime         TEXT            NOT NULL,
    deadline            TEXT            NOT NULL,
    endpoint            TEXT            NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_enqueueTime ON ScheduledTasks(enqueueTime);