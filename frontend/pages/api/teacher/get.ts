import { NextApiRequest, NextApiResponse } from 'next'
import { Teacher } from 'services/types/interfaces'
import { fetchGqlAPI } from 'services/libs/fetchgql'
import { CLASS_FIELDS } from 'pages/class'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.body.email) {
        const teacher: Teacher | null = await fetchGqlAPI(`
            ${CLASS_FIELDS}
            query getTeacher($email: String!) {
                teachers(where: {email: {_eq: $email}}, limit: 1) {
                    id
                    name
                    school {
                        name
                        prefecture
                        city
                    }
                    class {
                        ...ClassFields
                    }
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