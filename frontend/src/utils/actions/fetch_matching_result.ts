'use server'

import axios from 'axios'
import { MatchingResult, Team } from '@/src/lib/interfaces'

const GET_MATCHING_RESULTS = `
  query GetMatchingResults($teacher_uid: String!) {
    matching_results(
      where: {
        survey: {
          class: {
            teacher: {
              firebase_uid: { _eq: $teacher_uid }
            }
          }
        }
      }
      order_by: { created_at: desc }
    ) {
      id
      name
      status
      created_at
      updated_at
      survey {
        id
        name
        class {
          id
          name
        }
      }
      teams(order_by: { team_id: asc }) {
        id
        team_id
        name
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
        }
      }
    }
  }
`

interface MatchingResultWithTeams extends MatchingResult {
  survey: {
    id: number
    name: string
    class: {
      id: number
      name: string
    }
  }
  teams: Array<Team & {
    student_preference: {
      student: {
        id: number
        student_no: number
        name: string
        sex: number
      }
      mi_a: number
      mi_b: number
      mi_c: number
      mi_d: number
      mi_e: number
      mi_f: number
      mi_g: number
      mi_h: number
      leader: number
      eyesight: number
    }
  }>
}

interface MatchingResultResponse {
  data: {
    matching_results: MatchingResultWithTeams[]
  }
  errors?: Array<{ message: string }>
}

export async function fetchMatchingResult(teacherUid: string): Promise<MatchingResultWithTeams[]> {
  if (!process.env.BACKEND_GQL_API) {
    throw new Error('BACKEND_GQL_API is not configured')
  }

  try {
    const response = await axios.post<MatchingResultResponse>(
      process.env.BACKEND_GQL_API,
      {
        query: GET_MATCHING_RESULTS,
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

    return response.data.data.matching_results

  } catch (error) {
    console.error('Error in fetchMatchingResult:', error)
    throw error
  }
}