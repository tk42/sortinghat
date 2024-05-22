import { NextApiRequest, NextApiResponse } from 'next'
import { Survey, SURVEY_FIELDS } from 'services/types/interfaces'
import { fetchGqlAPI } from 'services/libs/fetchgql'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.body.class_id && req.body.name) {
        const survey: Survey | null = await fetchGqlAPI(`
            ${SURVEY_FIELDS}
            mutation AddSurvey (
                $class_id: bigint!
                $name: String!
            ) {
                insert_surveys_one(object: {
                    class_id: $class_id
                    name: $name
                }) {
                    ...SurveyFields
                }
            }
        `,
            {
                "class_id": req.body.class_id,
                "name": req.body.name
            }
        ).then((data: any) => {
            return data.surveys as Survey
        })
        res.status(200).json(survey)
    } else {
        res.status(400).json({ error: 'Insufficient fields' })
    }
}