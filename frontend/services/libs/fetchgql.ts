import axios from 'axios'

export async function fetchGqlAPI(query: string, variables: any) {
    if (process.env.BACKEND_GQL_API == null) {
        throw new Error('BACKEND_API is not defined')
    }
    const headers = {
        'x-hasura-admin-secret': process.env.HASURA_GRAPHQL_ADMIN_SECRET!,
        'content-type': 'application/json',
    }
    const res = await axios.post(process.env.BACKEND_GQL_API!,
        { query: query, variables: variables },
        { headers: headers }
    )
    const json = await res.data

    if (json.errors) {
        console.error("query:", query, "errors:", json.errors)
        throw new Error('Failed to fetch API')
    }

    return json.data
}
