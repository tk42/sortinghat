-- +goose Up
CREATE TABLE IF NOT EXISTS flavors (
    id SERIAL PRIMARY KEY,
    mi_a INTEGER NOT NULL,
    mi_b INTEGER NOT NULL,
    mi_c INTEGER NOT NULL,
    mi_d INTEGER NOT NULL,
    mi_e INTEGER NOT NULL,
    mi_f INTEGER NOT NULL,
    mi_g INTEGER NOT NULL,
    mi_h INTEGER NOT NULL,
    leader INTEGER NOT NULL,
    eyesight INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS students (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    sex INTEGER NOT NULL,
    class_id BIGINT NOT NULL,
    FOREIGN KEY (class_id) REFERENCES classes(id),
    memo TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS dislikes (
    id SERIAL PRIMARY KEY,
    flavor_id BIGINT NOT NULL,
    FOREIGN KEY (flavor_id) REFERENCES flavors(id),
    student_id BIGINT NOT NULL,
    FOREIGN KEY (student_id) REFERENCES students(id)
);

CREATE TABLE IF NOT EXISTS student_flavor (
    id SERIAL PRIMARY KEY,
    survey_id BIGINT,
    FOREIGN KEY (survey_id) REFERENCES surveys(id),
    student_id BIGINT NOT NULL,
    FOREIGN KEY (student_id) REFERENCES students(id),
    flavor_id BIGINT NOT NULL,
    FOREIGN KEY (flavor_id) REFERENCES flavors(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS teams_student (
    id SERIAL PRIMARY KEY,
    team_id BIGINT NOT NULL,
    FOREIGN KEY (team_id) REFERENCES teams(id),
    student_id BIGINT NOT NULL,
    FOREIGN KEY (student_id) REFERENCES students(id)
);

-- +goose Down
DROP TABLE IF EXISTS students;
DROP TABLE IF EXISTS dislikes;
DROP TABLE IF EXISTS flavors;
DROP TABLE IF EXISTS student_flavor;
DROP TABLE IF EXISTS teams_student;
