'use server'

import axios from 'axios'

import { Constraint, StudentPreference, StudentDislike } from '@/src/lib/interfaces'


export async function matchStudentPreferences(constraint: Constraint, preferences: StudentPreference[]) {
  if (!process.env.BACKEND_API_URL) {
    throw new Error('BACKEND_API_URL is not configured')
  }

  try {
    // Convert preferences to the format expected by the backend
    const convertedPreferences = preferences.map(p => ({
      student_no: p.student.student_no - 1,  // Adjust for 0-indexing
      sex: p.student.sex - 1, // Adjust for 0-indexing
      previous: p.previous_team - 1,  // Adjust for 0-indexing
      mi_a: p.mi_a,
      mi_b: p.mi_b,
      mi_c: p.mi_c,
      mi_d: p.mi_d,
      mi_e: p.mi_e,
      mi_f: p.mi_f,
      mi_g: p.mi_g,
      mi_h: p.mi_h,
      leader: p.leader,
      eyesight: p.eyesight,
      dislikes: p.student_dislikes.map(d => preferences.find(p => p.student.id === d.student_id)!.student.student_no - 1) // Adjust for 0-indexing
    }))

    const backendResponse = await axios.post(
      `${process.env.BACKEND_API_URL}/match`,
      {
        constraint: {
          max_num_teams: constraint.max_num_teams,
          members_per_team: constraint.members_per_team,
          at_least_one_pair_sex: constraint.at_least_one_pair_sex,
          girl_geq_boy: constraint.girl_geq_boy,
          boy_geq_girl: constraint.boy_geq_girl,
          at_least_one_leader: constraint.at_least_one_leader,
          unique_previous: constraint.unique_previous,
          group_diff_coeff: constraint.group_diff_coeff
        },
        student_constraints: convertedPreferences
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )

    return {
      data: backendResponse.data.teams,
      error: null
    }

  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx

        switch (error.response.data.error) {
          case "No Solution Found":
            return {
              data: null,
              error: 'マッチングを見つけられませんでした'
            }
          case "No Solution Exists":
            return {
              data: null,
              error: 'マッチングが存在しません'
            }
          case "Solution is Unbounded":
            return {
              data: null,
              error: '解は無限大です'
            }
          case "Status is Undefined":
            return {
              data: null,
              error: 'ステータスは未定義です'
            }
          default:
            console.error('Error finding matchings:', error)
            return {
              data: null,
              error: error.response.data.error || 'マッチングを見つけられませんでした'
            }
        }
      } else if (error.request) {
        // The request was made but no response was received
        console.error('Error finding matchings:', error)
        return {
          data: null,
          error: 'サーバーからの応答がありませんでした'
        }
      }
    }
    // For any other type of error
    return {
      data: null,
      error: error instanceof Error ? error.message : 'マッチング処理中にエラーが発生しました'
    }
  }
}
