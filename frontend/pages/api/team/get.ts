import { NextApiRequest, NextApiResponse } from 'next'
import { fetchGqlAPI } from 'services/libs/fetchgql'
import { Team, TEAM_FIELDS } from 'services/types/interfaces'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.body.survey_id) {
        const teams: Team[] | null = await fetchGqlAPI(`
            ${TEAM_FIELDS}
            query GetTeams ($survey_id: bigint!) {
                teams(where: {survey_id: {_eq: $survey_id}}) {
                    ...TeamsFields
                }
            }
        `,
            {
                "survey_id": req.body.survey_id
            }
        ).then((data: any) => {
            return data.teams as Team[]
        })
        res.status(200).json(teams)
    } else {
        res.status(400).json({ error: 'No survey_id' })
    }
}