-- name: GetTeacher :one
SELECT * FROM teachers
WHERE id = $1;

-- name: ListTeachers :many
SELECT * FROM teachers
ORDER BY name;

-- name: CreateTeacher :one
INSERT INTO teachers (name, family_name, given_name, email, status, expired_at)
VALUES ($1, $2, $3, $4, $5, $6)
RETURNING *;

-- name: DeleteTeacher :one
DELETE FROM teachers
WHERE id = $1
RETURNING *;
