import { NextApiRequest, NextApiResponse } from 'next'
import { Team, TEAM_FIELDS } from 'services/types/interfaces'
import { fetchGqlAPI } from 'services/libs/fetchgql'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.body.team_id && req.body.name) {
        const updatedTeam: Team | null = await fetchGqlAPI(`
            ${TEAM_FIELDS}
            mutation UpdateTeam (
                $team_id: bigint!
                $name: String!
            ) {
                update_teams_by_pk(pk_columns: {id: $team_id}, _set: {name: $name}) {
                    ...TeamFields
                }
            }
        `,
            {
                "team_id": req.body.team_id,
                "name": req.body.name,
            }
        ).then((data: any) => {
            return data as Team
        })
        res.status(200).json(updatedTeam)
    } else {
        res.status(400).json({ error: 'Insufficient data' })
    }
}
