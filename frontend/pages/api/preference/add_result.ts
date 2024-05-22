import { NextApiRequest, NextApiResponse } from 'next'
import { StudentPreference, UPDATE_TEAM_STUDENT_PREFERENCE_FIELDS } from 'services/types/interfaces'
import { fetchGqlAPI } from 'services/libs/fetchgql'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.body.request !== undefined) {
        const objects = (req.body.request as StudentPreference[]).map(({ survey, student, student_dislikes, ...rest }) => rest);
        // console.log(JSON.stringify(objects))

        const affected_rows: number = await fetchGqlAPI(`
            ${UPDATE_TEAM_STUDENT_PREFERENCE_FIELDS}
            mutation UpdateTeamStudentPreference (
                $objects: [student_preferences_insert_input!]!
            ) {
                insert_student_preferences(
                    objects: $objects,
                    on_conflict: {
                        constraint: student_preferences_pkey, 
                        update_columns: [
                            team_id
                        ]
                    }
                ) {
                    affected_rows
                }
            }
            `,
            {
                "objects": objects
            }
        ).then((data: any) => {
            return data.insert_student_preferences.affected_rows as number
        }).catch((error: any) => {
            console.error(error)
            return 0
        })

        if (affected_rows === 0) {
            res.status(400).json({ error: 'Failed to add preference' })
            return
        }

        // console.log(JSON.stringify(affected_rows))

        res.status(200).json(affected_rows)
    } else {
        res.status(400).json({ error: 'Insufficient fields' })
    }
}