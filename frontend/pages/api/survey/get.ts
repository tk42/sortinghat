import { NextApiRequest, NextApiResponse } from 'next'
import { Survey, SURVEY_FIELDS } from 'services/types/interfaces'
import { fetchGqlAPI } from 'services/libs/fetchgql'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.body.survey_id) {
        const survey: Survey | null = await fetchGqlAPI(`
            ${SURVEY_FIELDS}
            query GetSurvey ($survey_id: bigint!) {
                surveys_by_pk(id: $survey_id) {
                    ...SurveyFields
                }
            }
        `,
            {
                "survey_id": req.body.survey_id
            }
        ).then((data: any) => {
            return data.surveys_by_pk as Survey
        })
        res.status(200).json(survey)
    } else {
        res.status(400).json({ error: 'No class_id' })
    }
}