DROP TABLE logs CASCADE; 

CREATE TABLE logs (
    "id" serial NOT NULL,
    "redis_timestamp" varchar NOT NULL,
    "req_method" varchar NOT NULL,
    "req_host" varchar NOT NULL,
    "req_path" varchar NOT NULL,
    "req_url" varchar NOT NULL,
    "res_status_code" varchar NOT NULL,
    "res_message" varchar NOT NULL,
    "cycle_duration" varchar NOT NULL,
    PRIMARY KEY ("id")
) WITH (
    OIDS=FALSE
);
