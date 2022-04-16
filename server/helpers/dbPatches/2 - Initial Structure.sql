
CREATE TABLE "session" (
  "sid" varchar NOT NULL COLLATE "default",
	"sess" json NOT NULL,
	"expire" timestamp(6) NOT NULL
)
WITH (OIDS=FALSE);
ALTER TABLE "session" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;

CREATE OR REPLACE FUNCTION from_timestamp_ms(t TIMESTAMPTZ) RETURNS FLOAT AS $$
  BEGIN
    RETURN EXTRACT(EPOCH FROM t) * 1000.0;
  END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION to_timestamp_ms(t FLOAT) RETURNS TIMESTAMPTZ AS $$
  BEGIN
    RETURN to_timestamp(t / 1000.0);
  END;
$$ LANGUAGE plpgsql;

