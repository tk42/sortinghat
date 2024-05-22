import { NextApiRequest, NextApiResponse } from 'next'
import { fetchGqlAPI } from 'services/libs/fetchgql'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.body.team_id) {
        const deletedTeam: boolean = await fetchGqlAPI(`
            mutation DeleteTeam($team_id: bigint!) {
                delete_teams_by_pk(id: $team_id) {
                    id
                }
            }
        `,
            {
                "team_id": req.body.team_id
            }
        ).then(() => {
            return true
        }).catch((error: any) => {
            return false
        })
        res.status(200).json(deletedTeam)
    } else {
        res.status(400).json({ error: 'No team_id provided' })
    }
}
