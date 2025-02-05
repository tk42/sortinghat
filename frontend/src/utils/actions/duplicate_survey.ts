'use server'

import axios from 'axios'
import { createHash } from 'crypto'
import { cookies } from 'next/headers'
import { auth } from '@/src/utils/firebase/admin'

const GET_SURVEY_DETAILS = `
  query GetSurveyDetails($id: bigint!) {
    surveys_by_pk(id: $id) {
      id
      name
      class_id
      class {
        id
        name
        teacher {
          firebase_uid
        }
      }
      student_preferences {
        id
        student_id
        mi_a
        mi_b
        mi_c
        mi_d
        mi_e
        mi_f
        mi_g
        mi_h
        leader
        eyesight
        previous_team
        student_dislikes {
          student_id
        }
      }
    }
  }
`

const CREATE_DUPLICATE_SURVEY = `
  mutation CreateDuplicateSurvey($name: String!, $classId: bigint!, $uuid: bpchar!) {
    insert_surveys_one(object: {
      name: $name,
      status: 0,
      class_id: $classId,
      uuid: $uuid
    }) {
      id
      name
    }
  }
`

const CREATE_DUPLICATE_PREFERENCES = `
  mutation CreateDuplicatePreferences($objects: [student_preferences_insert_input!]!) {
    insert_student_preferences(objects: $objects) {
      affected_rows
      returning {
        id
      }
    }
  }
`

const CREATE_DUPLICATE_DISLIKES = `
  mutation CreateDuplicateDislikes($objects: [student_dislikes_insert_input!]!) {
    insert_student_dislikes(objects: $objects) {
      affected_rows
    }
  }
`

// Generate UUID for the new survey
function generateUUID(classId: number): string {
  const currentTimestamp = new Date().toISOString()
  const data = `${classId}-${currentTimestamp}`
  const hash = createHash('sha256')
  hash.update(data)
  return hash.digest('hex').slice(0, 32)
}

export async function duplicateSurvey(surveyId: string): Promise<void> {
    if (!process.env.BACKEND_GQL_API) {
        throw new Error('BACKEND_GQL_API is not configured')
    }

    // Get and verify authentication
    const cookieStore = cookies()
    const sessionCookie = cookieStore.get('auth-token')?.value

    if (!sessionCookie) {
        throw new Error('Not authenticated')
    }

    // Verify session cookie
    const decodedToken = await auth.verifySessionCookie(sessionCookie)

    try {
        // 1. Fetch original survey details
        const detailsResponse = await axios.post(
            process.env.BACKEND_GQL_API,
            {
                query: GET_SURVEY_DETAILS,
                variables: {
                    id: surveyId
                }
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'x-hasura-admin-secret': process.env.HASURA_GRAPHQL_ADMIN_SECRET,
                }
            }
        )

        // Check for GraphQL errors
        if (detailsResponse.data.errors) {
            console.error('GraphQL errors:', detailsResponse.data.errors)
            throw new Error(detailsResponse.data.errors[0].message)
        }

        const originalSurvey = detailsResponse.data.data?.surveys_by_pk
        if (!originalSurvey) {
            throw new Error('Survey not found')
        }

        // Verify that the user has permission to access this survey
        if (originalSurvey.class.teacher.firebase_uid !== decodedToken.uid) {
            throw new Error('Unauthorized access')
        }

        // 2. Create new survey with modified name
        const newName = `${originalSurvey.name} (コピー)`
        const uuid = generateUUID(originalSurvey.class_id)

        const newSurveyResponse = await axios.post(
            process.env.BACKEND_GQL_API,
            {
                query: CREATE_DUPLICATE_SURVEY,
                variables: {
                    name: newName,
                    classId: originalSurvey.class_id,
                    uuid: uuid
                }
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'x-hasura-admin-secret': process.env.HASURA_GRAPHQL_ADMIN_SECRET,
                }
            }
        )

        if (newSurveyResponse.data.errors) {
            console.error('GraphQL errors:', newSurveyResponse.data.errors)
            throw new Error(newSurveyResponse.data.errors[0].message)
        }

        const newSurveyId = newSurveyResponse.data.data?.insert_surveys_one?.id
        if (!newSurveyId) {
            throw new Error('Failed to create new survey')
        }

        // 3. Copy student preferences if they exist
        if (originalSurvey.student_preferences && originalSurvey.student_preferences.length > 0) {
            const preferenceObjects = originalSurvey.student_preferences.map((pref: any) => ({
                survey_id: newSurveyId,
                student_id: pref.student_id,
                mi_a: pref.mi_a,
                mi_b: pref.mi_b,
                mi_c: pref.mi_c,
                mi_d: pref.mi_d,
                mi_e: pref.mi_e,
                mi_f: pref.mi_f,
                mi_g: pref.mi_g,
                mi_h: pref.mi_h,
                leader: pref.leader,
                eyesight: pref.eyesight,
                previous_team: pref.previous_team
            }))

            const preferencesResponse = await axios.post(
                process.env.BACKEND_GQL_API,
                {
                    query: CREATE_DUPLICATE_PREFERENCES,
                    variables: {
                        objects: preferenceObjects
                    }
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'x-hasura-admin-secret': process.env.HASURA_GRAPHQL_ADMIN_SECRET,
                    }
                }
            )

            if (preferencesResponse.data.errors) {
                console.error('GraphQL errors:', preferencesResponse.data.errors)
                throw new Error(preferencesResponse.data.errors[0].message)
            }

            // 4. Copy student dislikes if they exist
            const newPreferenceIds = preferencesResponse.data.data.insert_student_preferences.returning
            const dislikeObjects: any[] = []

            originalSurvey.student_preferences.forEach((pref: any, index: number) => {
                if (pref.student_dislikes && pref.student_dislikes.length > 0) {
                    pref.student_dislikes.forEach((dislike: any) => {
                        dislikeObjects.push({
                            preference_id: newPreferenceIds[index].id,
                            student_id: dislike.student_id
                        })
                    })
                }
            })

            if (dislikeObjects.length > 0) {
                const dislikesResponse = await axios.post(
                    process.env.BACKEND_GQL_API,
                    {
                        query: CREATE_DUPLICATE_DISLIKES,
                        variables: {
                            objects: dislikeObjects
                        }
                    },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            'x-hasura-admin-secret': process.env.HASURA_GRAPHQL_ADMIN_SECRET,
                        }
                    }
                )

                if (dislikesResponse.data.errors) {
                    console.error('GraphQL errors:', dislikesResponse.data.errors)
                    throw new Error(dislikesResponse.data.errors[0].message)
                }
            }
        }

    } catch (error) {
        console.error('Failed to duplicate survey:', error)
        throw error
    }
}