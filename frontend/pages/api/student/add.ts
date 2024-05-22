import { NextApiRequest, NextApiResponse } from 'next'
import { Student, STUDENT_FIELDS } from 'services/types/interfaces'
import { fetchGqlAPI } from 'services/libs/fetchgql'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.body.name !== undefined && req.body.class_id !== undefined && req.body.sex !== undefined) {
        const student: Student | null = await fetchGqlAPI(`
            ${STUDENT_FIELDS}
            mutation AddStudent (
                $name: String!
                $sex: Int!
                $memo: String
                $class_id: bigint!
            ) {
                insert_students_one(object: {
                    name: $name
                    sex: $sex
                    memo: $memo
                    class_id: $class_id
                }) {
                    ...StudentFields
                }
            }`,
            {
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
        res.status(400).json({ error: 'Insufficient arguments' })
    }
}