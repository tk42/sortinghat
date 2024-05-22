import { NextApiRequest, NextApiResponse } from 'next'
import { School, SCHOOL_FIELDS } from 'services/types/interfaces'
import { fetchGqlAPI } from 'services/libs/fetchgql'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const school: School | null = await fetchGqlAPI(`
        mutation AddSchool (
            $name: String!
            $postal_code: String!
            $prefecture: String!
            $city: String!
            $address: String!
        ) {
            insert_schools_one(object: {
                name: $name
                postal_code: $postal_code
                prefecture: $prefecture
                city: $city
                address: $address
            }) {
                id
                name
                postal_code
                prefecture
                city
                address
            }
        }`,
        {
            "name": req.body.name,
            "postal_code": req.body.postal_code,
            "prefecture": req.body.prefecture,
            "city": req.body.city,
            "address": req.body.address
        }
    ).then((data: any) => {
        return data as School
    }).catch((error: any) => {
        return null
    })
    if (school === null) {
        res.status(400).json({ error: 'No data' })
    }
    res.status(200).json(school)
}