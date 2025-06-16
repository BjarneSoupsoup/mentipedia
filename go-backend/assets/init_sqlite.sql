-- Stores some (or all) requests coming from the frontend to deliver a confirmation email for the Mentirologo signup.
CREATE TABLE IF NOT EXISTS MentirologoConfirmationMailRequests (
    id                          INTEGER             PRIMARY KEY AUTOINCREMENT,
    -- When should the confirmation signup email be sent
    deadlineTimestamp           INTEGER             NOT NULL,
    email                       VARCHAR(1024)       NOT NULL,
    mentirologoName             VARCHAR(1024)       NOT NULL,
    emailSent                   INTEGER             DEFAULT "FALSE" NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_deadlineTimestamp ON MentirologoConfirmationMailRequests(deadlineTimestamp);
