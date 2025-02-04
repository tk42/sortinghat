'use server'

import axios from 'axios'

import { Constraint, StudentPreference, StudentDislike } from '@/src/lib/interfaces'

interface StudentPreferenceWithId{
    id: number
    student_no: number 
}


export async function matchStudentPreferences(constraint: Constraint, preferences: StudentPreference[]) {
  if (!process.env.BACKEND_API_URL) {
    throw new Error('BACKEND_API_URL is not configured')
  }

  try {
    // Convert preferences to the format expected by the backend
    const convertedPreferences = preferences.map(p => ({
      student_no: p.student.student_no,
      sex: p.student.sex,
      previous: p.previous_team,
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
      dislikes: p.student_dislikes.map(d => d.student_id)
    }))

    // Convert constraint to match the backend's expected format
    const backendConstraint = {
      max_num_teams: constraint.max_num_teams,
      members_per_team: constraint.members_per_team,
      at_least_one_pair_sex: constraint.at_least_one_pair_sex,
      girl_geq_boy: constraint.girl_geq_boy,
      boy_geq_girl: constraint.boy_geq_girl,
      at_least_one_leader: constraint.at_least_one_leader,
      unique_previous: constraint.unique_previous,
      group_diff_coeff: constraint.group_diff_coeff
    }

    // Send data as JSON instead of FormData
    const backendResponse = await axios.post(
      `${process.env.BACKEND_API_URL}/match`,
      {
        constraint: backendConstraint,
        student_constraints: convertedPreferences
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )

    if (backendResponse.data.error) {
      throw new Error(backendResponse.data.error)
    }

    const teams = backendResponse.data.teams

    return teams
  } catch (error) {
    console.error('Error finding matchings:', error)
    throw error
  }
}
