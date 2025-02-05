'use server'

import axios from 'axios'
import { MatchingResultResponse } from '@/src/lib/interfaces'

const GET_SURVEY_CLASS = `
  query GetSurveyClass($survey_id: bigint!) {
    surveys_by_pk(id: $survey_id) {
      id
      name
      class {
        id
        name
      }
    }
  }
`

const CREATE_MATCHING_RESULT = `
  mutation CreateMatchingResult($survey_id: bigint!, $name: String!) {
    insert_matching_results_one(
      object: {
        survey_id: $survey_id,
        name: $name,
        status: 0
      }
    ) {
      id
    }
  }
`

export async function createMatchingResult(surveyId: number): Promise<number> {
  if (!process.env.BACKEND_GQL_API) {
    throw new Error('BACKEND_GQL_API is not configured')
  }

  try {
    // First get the class name
    const classResponse = await axios.post<{
      data: {
        surveys_by_pk: {
          id: number
          name: string
          class: {
            id: number
            name: string
          }
        } | null
      }
      errors?: Array<{ message: string }>
    }>(
      process.env.BACKEND_GQL_API,
      {
        query: GET_SURVEY_CLASS,
        variables: {
          survey_id: surveyId
        }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-hasura-admin-secret': process.env.HASURA_GRAPHQL_ADMIN_SECRET,
        }
      }
    )

    if (classResponse.data.errors) {
      throw new Error(classResponse.data.errors[0].message)
    }

    const surveyData = classResponse.data.data.surveys_by_pk
    if (!surveyData) {
      throw new Error(`Survey with ID ${surveyId} not found`)
    }

    const className = surveyData.class.name
    const timestamp = new Date().toISOString()
    const matchingName = `${className}_${timestamp}`

    // Then create the matching result with the formatted name
    const response = await axios.post<MatchingResultResponse>(
      process.env.BACKEND_GQL_API,
      {
        query: CREATE_MATCHING_RESULT,
        variables: {
          survey_id: surveyId,
          name: matchingName
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

    return response.data.data.insert_matching_results_one.id

  } catch (error) {
    console.error('Error in createMatchingResult:', error)
    throw error
  }
}