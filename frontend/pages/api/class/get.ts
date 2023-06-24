import { NextApiRequest, NextApiResponse } from 'next'
import { Class } from 'services/types/interfaces'
import { fetchGqlAPI } from 'services/libs/fetchgql'
import { CLASS_FIELDS } from 'pages/class'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.body.teacher_id) {
        const classes: Class[] | null = await fetchGqlAPI(`
            ${CLASS_FIELDS}
            query GetClass ($id: bigint!) {
                teachers_by_pk(id: $id) {
                    teacher_classes {
                        class {
                            ...ClassFields
                        }
                    }
                }
            }
        `,
            {
                "id": req.body.teacher_id
            }
        ).then((data: any) => {
            return data.teachers_by_pk.teacher_classes.map((d: { class: Class }) => d.class) as Class[]
        })
        res.status(200).json(classes)
    } else {
        res.status(400).json({ error: 'No teacher_id' })
    }
}