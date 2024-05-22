import { NextApiRequest, NextApiResponse } from 'next'
import { Team, TEAM_FIELDS } from 'services/types/interfaces'
import { fetchGqlAPI } from 'services/libs/fetchgql'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.body.teams) {
        const objects: Team[] = req.body.teams
        const teams: Team[] | null = await fetchGqlAPI(`
            ${TEAM_FIELDS}
            mutation AddTeam (
                $objects: [teams_insert_input!]!
            ) {
                insert_teams(
                    objects: $objects,
                    on_conflict: {
                        constraint: unique_survey_team,
                        update_columns: [
                            survey_id,
                            team_id,
                            name
                        ]
                    }
                ) {
                    returning {
                        ...TeamFields
                    }
                }
            }
        `,
            {
                "objects": objects
            }
        ).then((data: any) => {
            return data.insert_teams.returning as Team[]
        })
        res.status(200).json(teams)
    } else {
        res.status(400).json({ error: 'Insufficient data' })
    }
}