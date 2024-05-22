import { NextApiRequest, NextApiResponse } from 'next'
import { fetchGqlAPI } from 'services/libs/fetchgql'
import { StudentPreference, STUDENT_PREFERENCE_FIELDS, StudentDislike, STUDENT_DISLIKE_FIELDS } from 'services/types/interfaces'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const preference: StudentPreference | null = await fetchGqlAPI(`
        ${STUDENT_PREFERENCE_FIELDS}
        query GetStudentPreference (
            $student_id: Int!
            $survey_id: Int!
        ) {
            student_preferences(where: {student_id: {_eq: $student_id}, survey_id: {_eq: $survey_id}}) {
                ...StudentPreferenceFields
            }
        }
        `,
        {
            "student_id": req.body.student_id,
            "survey_id": req.body.survey_id
        }
    ).then((data: any) => {
        return data.student_preferences[0] as StudentPreference
    }).catch((error: any) => {
        return null
    })

    if (preference == null) {
        res.status(400).json({ error: 'Failed to add preference' })
        return
    }

    await fetchGqlAPI(`
        ${STUDENT_PREFERENCE_FIELDS}
        mutation UpdateStudentPreference (
            $mi_a: Int!;
            $mi_b: Int!;
            $mi_c: Int!;
            $mi_d: Int!;
            $mi_e: Int!;
            $mi_f: Int!;
            $mi_g: Int!;
            $mi_h: Int!;
            $leader: Int!;
            $eyesight: Int!;
        ) {
            update_student_preferences_by_pk(
                pk_columns: {id: $preference_id},
                mi_a: $mi_a
                mi_b: $mi_b
                mi_c: $mi_c
                mi_d: $mi_d
                mi_e: $mi_e
                mi_f: $mi_f
                mi_g: $mi_g
                mi_h: $mi_h
                leader: $leader
                eyesight: $eyesight
            }) {
                ...StudentPreferenceFields
            }
        }
        `,
        {
            "preference_id": preference?.id,
            "mi_a": req.body.mi_a,
            "mi_b": req.body.mi_b,
            "mi_c": req.body.mi_c,
            "mi_d": req.body.mi_d,
            "mi_e": req.body.mi_e,
            "mi_f": req.body.mi_f,
            "mi_g": req.body.mi_g,
            "mi_h": req.body.mi_h,
            "leader": req.body.leader,
            "eyesight": req.body.eyesight,
        }
    ).then((data: any) => {
        return data as StudentPreference
    }).catch((error: any) => {
        return null
    })

    const dislikes: StudentDislike[] = await fetchGqlAPI(`
        ${STUDENT_DISLIKE_FIELDS}
        mutation AddStudentDislike (
            $objects: [student_dislikes_insert_input!]!
        ) {
            insert_student_dislikes(objects: $objects) {
                ...StudentDislikeFields
            }
        }
    `, {
        "objects": req.body.dislikes.map((dislike: number) => {
            return {
                preference_id: preference.id.toString(),
                student_id: dislike.toString()
            } // as StudentDislike
        })
    }).then((data: any) => {
        return data.student_dislikes as StudentDislike[]
    }).catch((error: any) => {
        return []
    })

    preference.student_dislikes = dislikes

    res.status(200).json(preference)
}

