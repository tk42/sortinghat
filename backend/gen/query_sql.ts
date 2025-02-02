import { Sql } from "postgres";

export const getTeacherQuery = `-- name: GetTeacher :one
SELECT id, name, stripe_id, school_id, email, created_at, updated_at FROM teachers
WHERE id = $1`;

export interface GetTeacherArgs {
    id: string;
}

export interface GetTeacherRow {
    id: string;
    name: string | null;
    stripeId: string | null;
    schoolId: string | null;
    email: string;
    createdAt: Date;
    updatedAt: Date;
}

export async function getTeacher(sql: Sql, args: GetTeacherArgs): Promise<GetTeacherRow | null> {
    const rows = await sql.unsafe(getTeacherQuery, [args.id]).values();
    if (rows.length !== 1) {
        return null;
    }
    const row = rows[0];
    return {
        id: row[0],
        name: row[1],
        stripeId: row[2],
        schoolId: row[3],
        email: row[4],
        createdAt: row[5],
        updatedAt: row[6]
    };
}

export const listTeachersQuery = `-- name: ListTeachers :many
SELECT id, name, stripe_id, school_id, email, created_at, updated_at FROM teachers
ORDER BY name`;

export interface ListTeachersRow {
    id: string;
    name: string | null;
    stripeId: string | null;
    schoolId: string | null;
    email: string;
    createdAt: Date;
    updatedAt: Date;
}

export async function listTeachers(sql: Sql): Promise<ListTeachersRow[]> {
    return (await sql.unsafe(listTeachersQuery, []).values()).map(row => ({
        id: row[0],
        name: row[1],
        stripeId: row[2],
        schoolId: row[3],
        email: row[4],
        createdAt: row[5],
        updatedAt: row[6]
    }));
}

export const createTeacherQuery = `-- name: CreateTeacher :one
INSERT INTO teachers (email, stripe_id)
VALUES ($1, $2)
RETURNING id, name, stripe_id, school_id, email, created_at, updated_at`;

export interface CreateTeacherArgs {
    email: string;
    stripeId: string | null;
}

export interface CreateTeacherRow {
    id: string;
    name: string | null;
    stripeId: string | null;
    schoolId: string | null;
    email: string;
    createdAt: Date;
    updatedAt: Date;
}

export async function createTeacher(sql: Sql, args: CreateTeacherArgs): Promise<CreateTeacherRow | null> {
    const rows = await sql.unsafe(createTeacherQuery, [args.email, args.stripeId]).values();
    if (rows.length !== 1) {
        return null;
    }
    const row = rows[0];
    return {
        id: row[0],
        name: row[1],
        stripeId: row[2],
        schoolId: row[3],
        email: row[4],
        createdAt: row[5],
        updatedAt: row[6]
    };
}

export const deleteTeacherQuery = `-- name: DeleteTeacher :one
DELETE FROM teachers
WHERE id = $1
RETURNING id, name, stripe_id, school_id, email, created_at, updated_at`;

export interface DeleteTeacherArgs {
    id: string;
}

export interface DeleteTeacherRow {
    id: string;
    name: string | null;
    stripeId: string | null;
    schoolId: string | null;
    email: string;
    createdAt: Date;
    updatedAt: Date;
}

export async function deleteTeacher(sql: Sql, args: DeleteTeacherArgs): Promise<DeleteTeacherRow | null> {
    const rows = await sql.unsafe(deleteTeacherQuery, [args.id]).values();
    if (rows.length !== 1) {
        return null;
    }
    const row = rows[0];
    return {
        id: row[0],
        name: row[1],
        stripeId: row[2],
        schoolId: row[3],
        email: row[4],
        createdAt: row[5],
        updatedAt: row[6]
    };
}

