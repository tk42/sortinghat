import { NextApiRequest, NextApiResponse } from 'next'
import { Class, CLASS_FIELDS } from 'services/types/interfaces'
import { fetchGqlAPI } from 'services/libs/fetchgql'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.body.class_id && req.body.name) {
        const _class: Class | null = await fetchGqlAPI(`
            ${CLASS_FIELDS}
            mutation UpdateClass($class_id: bigint!, $name: String!) {
                update_classes_by_pk(pk_columns: {class_id: $class_id}, _set: {name: $name}) {
                    ...ClassFields
                }
            }`,
            {
                "class_id": req.body.class_id,
                "name": req.body.name
            }
        ).then((data: any) => {
            return data as Class
        }).catch((error: any) => {
            return null
        })

        if (_class === null) {
            res.status(400).json({ error: 'No data'})
        } else {
            res.status(200).json(_class)
        }
    } else {
        res.status(400).json({ error: 'Insufficient data' })
    }
}
