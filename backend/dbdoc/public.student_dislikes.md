# public.student_dislikes

## Description

## Columns

| Name | Type | Default | Nullable | Children | Parents | Comment |
| ---- | ---- | ------- | -------- | -------- | ------- | ------- |
| id | bigint | nextval('student_dislikes_id_seq'::regclass) | false |  |  |  |
| student_id | bigint |  | true |  | [public.students](public.students.md) |  |
| preference_id | bigint |  | true |  | [public.student_preferences](public.student_preferences.md) |  |
| created_at | timestamp without time zone | now() | false |  |  |  |
| updated_at | timestamp without time zone | now() | false |  |  |  |

## Constraints

| Name | Type | Definition |
| ---- | ---- | ---------- |
| student_dislikes_student_id_fkey | FOREIGN KEY | FOREIGN KEY (student_id) REFERENCES students(id) |
| student_dislikes_preference_id_fkey | FOREIGN KEY | FOREIGN KEY (preference_id) REFERENCES student_preferences(id) |
| student_dislikes_pkey | PRIMARY KEY | PRIMARY KEY (id) |
| student_dislikes_student_id_preference_id_key | UNIQUE | UNIQUE (student_id, preference_id) |

## Indexes

| Name | Definition |
| ---- | ---------- |
| student_dislikes_pkey | CREATE UNIQUE INDEX student_dislikes_pkey ON public.student_dislikes USING btree (id) |
| student_dislikes_student_id_preference_id_key | CREATE UNIQUE INDEX student_dislikes_student_id_preference_id_key ON public.student_dislikes USING btree (student_id, preference_id) |

## Relations

![er](public.student_dislikes.svg)

---

> Generated by [tbls](https://github.com/k1LoW/tbls)