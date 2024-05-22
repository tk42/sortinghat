import { NextApiRequest, NextApiResponse } from 'next'
import { School, SCHOOL_FIELDS } from 'services/types/interfaces'
import { fetchGqlAPI } from 'services/libs/fetchgql'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.body.id) {
        const school: School | null = await fetchGqlAPI(`
            query getSchool($id: number!) {
                ${SCHOOL_FIELDS}
                schools(where: {id: {_eq: $id}}, limit: 1) {
                    ...SchoolFields
                }
            }`,
            {
                "id": req.body.id
            }
        ).then((data: any) => {
            if (data.schools.length == 0) {
                return null
            }
            return (data.schools as School[])[0]
        })
        if (school === null) {
            res.status(400).json({ error: 'No data' })
        }
        res.status(200).json(school)
    } else {
        res.status(400).json({ error: 'No id' })
    }
}