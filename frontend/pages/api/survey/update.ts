import { NextApiRequest, NextApiResponse } from 'next'
import { Survey, SURVEY_FIELDS } from 'services/types/interfaces'
import { fetchGqlAPI } from 'services/libs/fetchgql'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.body.survey_id && req.body.name && req.body.status) {
        const updatedSurvey: Survey | null = await fetchGqlAPI(`
            ${SURVEY_FIELDS}
            mutation UpdateSurvey (
                $survey_id: bigint!
                $name: String!
                $status: Int!
            ) {
                update_surveys_by_pk(pk_columns: {id: $survey_id}, _set: {name: $name, status: $status}) {
                    ...SurveyFields
                }
            }
        `,
            {
                "survey_id": req.body.survey_id,
                "name": req.body.name,
                "status": req.body.status
            }
        ).then((data: any) => {
            return data.update_surveys_by_pk as Survey
        })
        res.status(200).json(updatedSurvey)
    } else {
        res.status(400).json({ error: 'Insufficient fields' })
    }
}
