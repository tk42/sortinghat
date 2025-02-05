'use server'

import axios from 'axios'
import { Team } from '@/src/lib/interfaces'

const GET_TEAMS = `
  query GetTeams($teacher_uid: String!) {
    teams(
      where: {
        matching_result: {
          survey: {
            class: {
              teacher: {
                firebase_uid: { _eq: $teacher_uid }
              }
            }
          }
        }
      }
      order_by: [
        { matching_result: { created_at: desc } },
        { team_id: asc }
      ]
    ) {
      id
      team_id
      name
      matching_result {
        id
        name
        created_at
        survey {
          id
          name
          class {
            id
            name
          }
        }
      }
      student_preference {
        student {
          id
          student_no
          name
          sex
        }
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
        student_dislikes {
          student_id
        }
      }
    }
  }
`

export async function fetchTeams(teacherUid: string): Promise<Team[]> {
  if (!process.env.BACKEND_GQL_API) {
    throw new Error('BACKEND_GQL_API is not configured')
  }

  try {
    const response = await axios.post<{
      data: {
        teams: Team[]
      }
      errors?: Array<{ message: string }>
    }>(
      process.env.BACKEND_GQL_API,
      {
        query: GET_TEAMS,
        variables: {
          teacher_uid: teacherUid
        }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-hasura-admin-secret': process.env.HASURA_GRAPHQL_ADMIN_SECRET,
        }
      }
    )

    if (response.data.errors) {
      throw new Error(response.data.errors[0].message)
    }

    return response.data.data.teams

  } catch (error) {
    console.error('Error in fetchTeams:', error)
    throw error
  }
}