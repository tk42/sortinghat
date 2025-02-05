'use server'

import axios from 'axios'
import { z } from 'zod'
import { TeamResponse } from '@/src/lib/interfaces'
import { createMatchingResult } from './create_matching_result'

const CREATE_TEAMS = `
  mutation CreateTeams($objects: [teams_insert_input!]!) {
    insert_teams(objects: $objects) {
      returning {
        id
        team_id
        matching_result_id
        student_preference_id
      }
      affected_rows
    }
  }
`

const GET_STUDENT_PREFERENCES = `
  query GetStudentPreferences($survey_id: bigint!) {
    student_preferences(where: { survey_id: { _eq: $survey_id } }) {
      id
      student {
        id
        student_no
      }
    }
  }
`

// バリデーションスキーマ
const UpdateStudentTeamSchema = z.object({
  teams: z.record(z.string(), z.array(z.number())),
  surveyId: z.number(),
})

export async function updateStudentTeams(teams: Record<string, number[]>, surveyId: number) {
  if (!process.env.BACKEND_GQL_API) {
    throw new Error('BACKEND_GQL_API is not configured')
  }

  try {
    console.log('Received teams:', JSON.stringify(teams, null, 2))

    const validatedData = UpdateStudentTeamSchema.parse({
      teams,
      surveyId,
    })

    // Get all student preferences for this survey
    const preferencesResponse = await axios.post<{
      data: {
        student_preferences: {
          id: number
          student: {
            id: number
            student_no: number
          }
        }[]
      }
      errors?: Array<{ message: string }>
    }>(
      process.env.BACKEND_GQL_API,
      {
        query: GET_STUDENT_PREFERENCES,
        variables: {
          survey_id: validatedData.surveyId
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
      throw new Error(preferencesResponse.data.errors[0].message)
    }

    const studentPreferences = preferencesResponse.data.data.student_preferences
    // Map student_no to preference_id
    const studentNoToPreferenceId = new Map(
      studentPreferences.map(pref => [pref.student.student_no, pref.id])
    )

    // Create new matching result
    const matchingResultId = await createMatchingResult(validatedData.surveyId)

    // Create team objects with references to both matching_result and student_preferences
    const teamObjects = Object.entries(validatedData.teams).flatMap(([teamId, studentNos]) =>
      studentNos.map(studentNo => {
        const preferenceId = studentNoToPreferenceId.get(studentNo)
        if (!preferenceId) {
          throw new Error(`No preference found for student number ${studentNo}`)
        }
        
        return {
          team_id: parseInt(teamId),
          name: `Team ${teamId}`,
          matching_result_id: matchingResultId,
          student_preference_id: preferenceId
        }
      })
    )

    // Create new teams for this matching result
    const teamResponse = await axios.post<TeamResponse>(
      process.env.BACKEND_GQL_API,
      {
        query: CREATE_TEAMS,
        variables: {
          objects: teamObjects
        }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-hasura-admin-secret': process.env.HASURA_GRAPHQL_ADMIN_SECRET,
        }
      }
    )

    if (teamResponse.data.errors) {
      throw new Error(teamResponse.data.errors[0].message)
    }

    return { success: true }

  } catch (error) {
    console.error('Error in updateStudentTeams:', error)
    throw error
  }
}