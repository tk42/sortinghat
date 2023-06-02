-- +goose Up
CREATE TABLE IF NOT EXISTS teachers (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(256) NOT NULL,
    family_name VARCHAR(256),
    given_name VARCHAR(256),
    email VARCHAR(256) NOT NULL,
    status INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    expired_at TIMESTAMP
);

-- CREATE TABLE IF NOT EXISTS payments (
--     id BIGSERIAL PRIMARY KEY,
--     teacher_id BIGINT NOT NULL,
--     FOREIGN KEY (teacher_id) REFERENCES teachers(id),
--     payment_id BIGINT NOT NULL,
--     FOREIGN KEY (payment_id) REFERENCES payments(id)
--     created_at TIMESTAMP NOT NULL DEFAULT NOW(),
--     updated_at TIMESTAMP NOT NULL DEFAULT NOW()
-- );

-- +goose Down
DROP TABLE IF EXISTS teachers;
-- DROP TABLE IF EXISTS payments;