'use server'

import axios from 'axios'
import { cookies } from 'next/headers'
import { auth } from '@/src/utils/firebase/admin'
import { z } from 'zod'

const RESET_STUDENT_TEAMS = `
  mutation ResetStudentTeams($survey_id: bigint!) {
    update_student_preferences(
      where: {
        survey_id: { _eq: $survey_id }
      }
      _set: {
        team_id: null
      }
    ) {
      affected_rows
    }
  }
`

const DELETE_EXISTING_TEAMS = `
  mutation DeleteExistingTeams($survey_id: bigint!) {
    delete_teams(
      where: {
        survey_id: { _eq: $survey_id }
      }
    ) {
      affected_rows
    }
  }
`

const CREATE_TEAMS = `
  mutation CreateTeams($objects: [teams_insert_input!]!) {
    insert_teams(objects: $objects) {
      returning {
        id
        team_id
      }
      affected_rows
    }
  }
`

const UPDATE_STUDENT_TEAMS = `
  mutation UpdateStudentTeams($updates: [student_preferences_updates!]!) {
    update_student_preferences_many(updates: $updates) {
      affected_rows
    }
  }
`

// 型定義
interface Team {
  id: number
  team_id: number
}

interface TeamResponse {
  data: {
    insert_teams: {
      returning: Team[]
      affected_rows: number
    }
  }
  errors?: Array<{ message: string }>
}

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

    const cookieStore = cookies()
    const sessionCookie = cookieStore.get('auth-token')?.value

    if (!sessionCookie) {
      throw new Error('Not authenticated')
    }

    await auth.verifySessionCookie(sessionCookie)

    // まずstudent_preferencesのteam_idをnullに設定
    const resetResponse = await axios.post(
      process.env.BACKEND_GQL_API!,
      {
        query: RESET_STUDENT_TEAMS,
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

    if (resetResponse.data.errors) {
      throw new Error(resetResponse.data.errors[0].message)
    }

    console.log(`Reset ${resetResponse.data.data.update_student_preferences.affected_rows} student preferences`)

    // 既存のチームを削除
    const deleteResponse = await axios.post(
      process.env.BACKEND_GQL_API!,
      {
        query: DELETE_EXISTING_TEAMS,
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

    if (deleteResponse.data.errors) {
      throw new Error(deleteResponse.data.errors[0].message)
    }

    console.log(`Deleted ${deleteResponse.data.data.delete_teams.affected_rows} existing teams`)

    // チームを一括作成
    const teamObjects = Object.entries(validatedData.teams).map(([teamNo, _]) => ({
      name: `Team ${teamNo}`,
      survey_id: validatedData.surveyId,
      team_id: parseInt(teamNo)
    }))

    const createTeamsResponse = await axios.post<TeamResponse>(
      process.env.BACKEND_GQL_API!,
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

    if (createTeamsResponse.data.errors) {
      throw new Error(createTeamsResponse.data.errors[0].message)
    }

    const createdTeams = createTeamsResponse.data.data.insert_teams.returning
    const teamIdMap = new Map(createdTeams.map(team => [team.team_id, team.id]))

    // 学生のチーム割り当てを一括更新
    const updates = Object.entries(validatedData.teams).flatMap(([teamNo, studentNos]) => {
      const teamId = teamIdMap.get(parseInt(teamNo))
      return studentNos.map(studentNo => ({
        where: {
          _and: [
            { student: { student_no: { _eq: studentNo } } },
            { survey_id: { _eq: validatedData.surveyId } }
          ]
        },
        _set: {
          team_id: teamId
        }
      }))
    })

    const updateResponse = await axios.post(
      process.env.BACKEND_GQL_API!,
      {
        query: UPDATE_STUDENT_TEAMS,
        variables: {
          updates
        }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-hasura-admin-secret': process.env.HASURA_GRAPHQL_ADMIN_SECRET,
        }
      }
    )

    if (updateResponse.data.errors) {
      throw new Error(updateResponse.data.errors[0].message)
    }

    console.log(`Updated ${updateResponse.data.data.update_student_preferences_many.affected_rows} student preferences`)

    return {
      success: true,
      teams: Object.entries(validatedData.teams).map(([teamNo, studentNos]) => ({
        teamNo,
        teamId: teamIdMap.get(parseInt(teamNo)),
        studentNos
      }))
    }

  } catch (error) {
    console.error('Error updating student teams:', error)
    throw error
  }
}