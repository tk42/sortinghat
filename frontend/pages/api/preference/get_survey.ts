import { NextApiRequest, NextApiResponse } from 'next'
import { fetchGqlAPI } from 'services/libs/fetchgql'
import { StudentPreference, STUDENT_PREFERENCE_FIELDS } from 'services/types/interfaces'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.body.survey_id === undefined) {
        res.status(400).json({ error: 'No survey_id' })
        return
    }
    const preferences: StudentPreference[] = await fetchGqlAPI(`
        ${STUDENT_PREFERENCE_FIELDS}
        query FindStudentPreferences($survey_id: bigint!) {
            student_preferences(where: {survey_id: {_eq: $survey_id}}) {
                ...StudentPreferenceFields
            }
        }
    `, {
        "survey_id": req.body.survey_id
    }).then((data: any) => {
        return data.student_preferences as StudentPreference[]
    }).catch((error: any) => {
        return []
    })

    res.status(200).json(preferences)
}


