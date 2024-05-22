import { NextApiRequest, NextApiResponse } from 'next'
import { Teacher, TEACHER_FIELDS } from 'services/types/interfaces'
import { fetchGqlAPI } from 'services/libs/fetchgql'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.body.email && req.body.school_id && req.body.name && req.body.family_name && req.body.given_name) {
        const teacher: Teacher | null = await fetchGqlAPI(`
            ${TEACHER_FIELDS}
            mutation AddTeacher(
                $school_id: bigint!
                $name: String!
                $family_name: String!
                $given_name: String!
                $email: String!
            ) {
                insert_teachers_one(object: {
                    school_id: $school_id
                    email: $email
                    name: $name
                    family_name: $family_name
                    given_name: $given_name
                }) {
                    ...TeacherFields
                }
            }`,
            {
                "school_id": req.body.school_id,
                "name": req.body.name,
                "family_name": req.body.family_name,
                "given_name": req.body.given_name,
                "email": req.body.email,
            }
        ).then((data: any) => {
            return data as Teacher
        })
        if (teacher === null) {
            res.status(400).json({ error: 'No data' })
        }
        res.status(200).json(teacher)
    } else {
        res.status(400).json({ error: 'Insufficient data' })
    }
}