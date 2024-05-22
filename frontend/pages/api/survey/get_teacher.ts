import { NextApiRequest, NextApiResponse } from 'next'
import { Survey, TEAM_FIELDS } from 'services/types/interfaces'
import { fetchGqlAPI } from 'services/libs/fetchgql'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.body.teacher_id) {
        const surveys: Survey[] | null = await fetchGqlAPI(`
            ${TEAM_FIELDS}
            query GetSurvey ($teacher_id: bigint!) {
                surveys(where: {class: {teacher_id: {_eq: $teacher_id}}}) {
                    id
                    name
                    class {
                        name
                    }
                    teams {
                        ...TeamFields
                    }
                }
            }
        `,
            {
                "teacher_id": req.body.teacher_id
            }
        ).then((data: any) => {
            return data.surveys as Survey[]
        })
        res.status(200).json(surveys)
    } else {
        res.status(400).json({ error: 'No teacher_id' })
    }
}