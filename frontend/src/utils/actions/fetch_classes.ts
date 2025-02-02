'use server'

import axios from 'axios'

export async function fetchClasses(firebase_uid: string) {
  if (!process.env.BACKEND_GQL_API) {
    throw new Error('BACKEND_GQL_API is not configured')
  }

  const query = `
    query GetClassesByFirebaseUid($firebase_uid: String!) {
      classes(where: { teacher: { firebase_uid: { _eq: $firebase_uid } } }) {
        id
        name
        created_at
      }
    }
  `

  try {
    const response = await axios.post(
      process.env.BACKEND_GQL_API,
      {
        query,
        variables: { 
          firebase_uid: firebase_uid
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-hasura-admin-secret': process.env.HASURA_GRAPHQL_ADMIN_SECRET,
        },
      }
    )

    // console.log('GraphQL Response:', JSON.stringify(response.data, null, 2))

    if (response.data.errors) {
      throw new Error(response.data.errors[0].message)
    }

    return response.data.data?.classes || []
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Axios error:', {
        status: error.response?.status,
        data: error.response?.data,
        config: {
          url: error.config?.url,
          headers: error.config?.headers,
        }
      })
      throw new Error(`GraphQL request failed: ${error.message}`)
    }
    throw error
  }
}