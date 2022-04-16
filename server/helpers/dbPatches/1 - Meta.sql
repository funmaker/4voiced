
CREATE TABLE meta (
  id INTEGER NOT NULL PRIMARY KEY DEFAULT 39,
  version INTEGER,
  lastsync TIMESTAMP,

  CONSTRAINT only_one_row CHECK (id = 39)
);

INSERT INTO meta(version) VALUES(1);
