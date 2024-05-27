import { NextApiRequest, NextApiResponse } from 'next'
import { StudentPreference, STUDENT_PREFERENCE_FIELDS, StudentDislike, STUDENT_DISLIKE_FIELDS } from 'services/types/interfaces'
import { fetchGqlAPI } from 'services/libs/fetchgql'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.body.student_preferences !== undefined ) {
        const objects = req.body.student_preferences.map((preference: StudentPreference) => {
            return {
                student_id: preference.student.id,
                survey_id: preference.survey.id,
                mi_a: preference.mi_a,
                mi_b: preference.mi_b,
                mi_c: preference.mi_c,
                mi_d: preference.mi_d,
                mi_e: preference.mi_e,
                mi_f: preference.mi_f,
                mi_g: preference.mi_g,
                mi_h: preference.mi_h,
                leader: preference.leader,
                eyesight: preference.eyesight,
            }
        })

        const preferences: StudentPreference[] = await fetchGqlAPI(`
            ${STUDENT_PREFERENCE_FIELDS}
            mutation AddStudentPreference (
                $objects: [student_preferences_insert_input!]!
            ) {
                insert_student_preferences(
                    objects: $objects,
                    on_conflict: {
                        constraint: unique_student_preference, 
                        update_columns: [
                            student_id,
                            survey_id,
                            mi_a,
                            mi_b,
                            mi_c,
                            mi_d,
                            mi_e,
                            mi_f,
                            mi_g,
                            mi_h,
                            leader, 
                            eyesight,
                        ]
                    }
                ) {
                    returning {
                        ...StudentPreferenceFields
                    }
                }
            }
            `,
            {
                "objects": objects
            }
        ).then((data: any) => {
            return data.insert_student_preferences.returning as StudentPreference[]
        }).catch((error: any) => {
            console.error(error)
            return []
        })

        if (preferences.length === 0) {
            res.status(400).json({ error: 'Failed to add preference' })
            return
        }

        // console.log(preferences)
        // console.log(req.body.student_preferences)

        const objects_dislikes = req.body.student_preferences.map((pref: StudentPreference, index: number) => 
            (pref.student_dislikes as StudentDislike[]).map((student_dislike: StudentDislike) => {
                return {
                    preference_id: preferences[index].id,
                    student_id: student_dislike.student_id
                } as StudentDislike
            })
        ).flat()

        // console.log(objects_dislikes)

        const dislikes: StudentDislike[] = await fetchGqlAPI(`
            ${STUDENT_DISLIKE_FIELDS}
            mutation AddStudentDislikes (
                $objects: [student_dislikes_insert_input!]!
            ) {
                insert_student_dislikes(
                    objects: $objects,
                    on_conflict: {
                        constraint: unique_student_dislikes, 
                        update_columns: [
                            preference_id,
                            student_id,
                        ]
                    }
                ) {
                    returning {
                        ...StudentDislikeFields
                    }
                }
            }
            `,
            {
                "objects": objects_dislikes
            }
        ).then((data: any) => {
            return data.insert_student_dislikes.returning as StudentDislike[]
        }).catch((error: any) => {
            console.error(error)
            return []
        })

        const zipped = preferences.map(function(e, i) {
            return [e, dislikes[i]];
        });

        res.status(200).json(zipped)
    } else {
        res.status(400).json({ error: 'Insufficient fields' })
    }
}