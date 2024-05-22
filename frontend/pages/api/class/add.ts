import { NextApiRequest, NextApiResponse } from 'next'
import { Class, CLASS_FIELDS } from 'services/types/interfaces'
import { fetchGqlAPI } from 'services/libs/fetchgql'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.body.teacher_id && req.body.name) {
        const classes: Class[] | null = await fetchGqlAPI(`
            ${CLASS_FIELDS}
            mutation AddClass (
                $teacher_id: bigint!
                $name: String!
            ) {
                insert_classes_one(object: {
                    teacher_id: $teacher_id
                    name: $name
                }) {
                    ...ClassFields
                }
            }
        `,
            {
                "teacher_id": req.body.teacher_id,
                "name": req.body.name
            }
        ).then((data: any) => {
            return data.classes as Class[]
        })
        res.status(200).json(classes)
    } else {
        res.status(400).json({ error: 'No teacher_id' })
    }
}