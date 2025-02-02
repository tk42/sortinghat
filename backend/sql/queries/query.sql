-- name: GetTeacher :one
SELECT * FROM teachers
WHERE id = $1;

-- name: ListTeachers :many
SELECT * FROM teachers
ORDER BY name;

-- name: CreateTeacher :one
INSERT INTO teachers (email, stripe_id)
VALUES ($1, $2)
RETURNING *;

-- name: DeleteTeacher :one
DELETE FROM teachers
WHERE id = $1
RETURNING *;
