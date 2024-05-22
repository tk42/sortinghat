import { NextApiRequest, NextApiResponse } from 'next'
import { Result } from 'services/types/interfaces'
import { fetchAPI } from 'services/libs/fetch'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.body) {
        const result: Result = await fetchAPI(req.body)
        res.status(200).json(result)
    } else {
        res.status(400).json({ error: 'No query' })
    }
}