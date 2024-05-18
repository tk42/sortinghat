-- +goose Up
CREATE TABLE IF NOT EXISTS schools (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(256) NOT NULL,
    postal_code VARCHAR(256),
    prefecture VARCHAR(256),
    city VARCHAR(256),
    address VARCHAR(256),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS classes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS teachers (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(256) NOT NULL,
    family_name VARCHAR(256),
    given_name VARCHAR(256),
    school_id BIGINT NOT NULL,
    FOREIGN KEY (school_id) REFERENCES schools(id),
    current_class_id BIGINT,
    FOREIGN KEY (current_class_id) REFERENCES classes(id),
    email VARCHAR(256),
    status INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    expired_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS teacher_class (
    id SERIAL PRIMARY KEY,
    teacher_id BIGINT NOT NULL,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id),
    class_id BIGINT NOT NULL,
    FOREIGN KEY (class_id) REFERENCES classes(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
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
DROP TABLE IF EXISTS classes;
DROP TABLE IF EXISTS teacher_class;
DROP TABLE IF EXISTS teachers;
DROP TABLE IF EXISTS schools;
-- DROP TABLE IF EXISTS payments;
