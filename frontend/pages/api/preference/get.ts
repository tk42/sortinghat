import { NextApiRequest, NextApiResponse } from 'next'
import { fetchGqlAPI } from 'services/libs/fetchgql'
import { StudentPreference, STUDENT_PREFERENCE_FIELDS } from 'services/types/interfaces'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (!req.query.class_id) {
        res.status(400).json({ error: 'No class_id' })
        return
    }
    const preferences: StudentPreference[] = await fetchGqlAPI(`
        ${STUDENT_PREFERENCE_FIELDS}
        query GetStudentPreferences($class_id: bigint!) {
            student_preferences(where: {class_id: {_eq: $class_id}}) {
                ...StudentPreferenceFields
            }
        }
    `, {
        "class_id": req.query.class_id
    }).then((data: any) => {
        return data.student_preferences as StudentPreference[]
    }).catch((error: any) => {
        return []
    })

    res.status(200).json(preferences)
}


