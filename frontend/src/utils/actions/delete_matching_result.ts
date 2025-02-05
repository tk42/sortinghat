'use server'

import axios from 'axios'

const DELETE_MATCHING_RESULT = `
  mutation DeleteMatchingResult($id: bigint!) {
    # First delete the related teams
    delete_teams(where: {matching_result_id: {_eq: $id}}) {
      affected_rows
    }
    # Then delete the matching result
    delete_matching_results_by_pk(id: $id) {
      id
    }
  }
`

export async function deleteMatchingResult(id: string | number): Promise<void> {
  if (!process.env.BACKEND_GQL_API) {
    throw new Error('BACKEND_GQL_API is not configured')
  }

  try {
    const response = await axios.post(
      process.env.BACKEND_GQL_API,
      {
        query: DELETE_MATCHING_RESULT,
        variables: {
          id: typeof id === 'string' ? BigInt(id) : id
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

    return response.data.data.delete_matching_results_by_pk.id
  } catch (error) {
    console.error('Error deleting matching result:', error)
    throw error
  }
}