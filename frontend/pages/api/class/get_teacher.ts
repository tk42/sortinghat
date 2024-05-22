import { NextApiRequest, NextApiResponse } from 'next'
import { Class, CLASS_FIELDS } from 'services/types/interfaces'
import { fetchGqlAPI } from 'services/libs/fetchgql'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.body.teacher_id) {
        const classes: Class[] | null = await fetchGqlAPI(`
            ${CLASS_FIELDS}
            query GetClass ($teacher_id: bigint!) {
                classes(
                    where: {
                        teacher_id: {_eq: $teacher_id}
                    }
                ) {
                    ...ClassFields
                }
            }
        `,
            {
                "teacher_id": req.body.teacher_id
            }
        ).then((data: any) => {
            return data.classes as Class[]
        })
        res.status(200).json(classes)
    } else {
        res.status(400).json({ error: 'No teacher_id' })
    }
}