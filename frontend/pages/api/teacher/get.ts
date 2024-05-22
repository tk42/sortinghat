import { NextApiRequest, NextApiResponse } from 'next'
import { Teacher, TEACHER_FIELDS } from 'services/types/interfaces'
import { fetchGqlAPI } from 'services/libs/fetchgql'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.body.email) {
        const teacher: Teacher | null = await fetchGqlAPI(`
            ${TEACHER_FIELDS}
            query getTeacher($email: String!) {
                teachers(where: {email: {_eq: $email}}, limit: 1) {
                    ...TeacherFields
                }
            }`,
            {
                "email": req.body.email
            }
        ).then((data: any) => {
            if (data.teachers.length == 0) {
                return null
            }
            return (data.teachers as Teacher[])[0]
        })
        if (teacher === null) {
            res.status(400).json({ error: 'No data' })
        }
        res.status(200).json(teacher)
    } else {
        res.status(400).json({ error: 'No email' })
    }
}