import { NextApiRequest, NextApiResponse } from 'next'
import { Student, STUDENT_FIELDS } from 'services/types/interfaces'
import { fetchGqlAPI } from 'services/libs/fetchgql'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.body.student_id) {
        const student: Student | null = await fetchGqlAPI(`
            mutation UpdateStudent (
                $student_id: Int!
                $name: String!
                $sex: Int!
                $memo: String!
                $class_id: Int!
            ) {
                ${STUDENT_FIELDS}
                update_students_by_pk(
                    pk_columns: {id: $student_id}
                    _set: {
                        name: $name
                        sex: $sex
                        memo: $memo
                        class_id: $class_id
                ) {
            } {
                ...StudentFields
            }`,
            {
                "student_id": req.body.student_id,
                "name": req.body.name,
                "class_id": req.body.class_id,
                "sex": req.body.sex,
                "memo": req.body.memo
            }
        ).then((data: any) => {
            return data as Student
        })
        res.status(200).json(student)
    } else {
        res.status(400).json({ error: 'No student id' })
    }
}