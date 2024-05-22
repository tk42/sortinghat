import { NextApiRequest, NextApiResponse } from 'next'
import { Survey, SURVEY_FIELDS } from 'services/types/interfaces'
import { fetchGqlAPI } from 'services/libs/fetchgql'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.body.class_id) {
        const surveys: Survey[] | null = await fetchGqlAPI(`
            ${SURVEY_FIELDS}
            query GetSurvey ($class_id: bigint!) {
                surveys(where: {class_id: {_eq: $class_id}}) {
                    ...SurveyFields
                }
            }
        `,
            {
                "class_id": req.body.class_id
            }
        ).then((data: any) => {
            return data.surveys as Survey[]
        })
        res.status(200).json(surveys)
    } else {
        res.status(400).json({ error: 'No class_id' })
    }
}