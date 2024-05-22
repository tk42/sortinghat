import { NextApiRequest, NextApiResponse } from 'next'
import { fetchGqlAPI } from 'services/libs/fetchgql'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.body.survey_id) {
        const deletedSurvey: boolean = await fetchGqlAPI(`
            mutation DeleteSurvey($survey_id: bigint!) {
                delete_surveys_by_pk(id: $survey_id) {
                    id
                }
            }
        `,
            {
                "survey_id": req.body.survey_id
            }
        ).then(() => {
            return true
        }).catch((error: any) => {
            return false
        })
        res.status(200).json(deletedSurvey)
    } else {
        res.status(400).json({ error: 'No survey_id provided' })
    }
}
