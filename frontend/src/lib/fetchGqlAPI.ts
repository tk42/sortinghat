import axios from 'axios'

export async function fetchGqlAPI(query: string, variables: any) {
    if (process.env.BACKEND_GQL_API == null) {
        console.error('BACKEND_GQL_API is not defined');
        throw new Error('GraphQL API endpoint is not configured');
    }

    const headers = {
        'x-hasura-admin-secret': process.env.HASURA_GRAPHQL_ADMIN_SECRET!,
        'content-type': 'application/json',
    }

    try {
        const res = await axios.post(
            process.env.BACKEND_GQL_API!,
            { query: query, variables: variables },
            { 
                headers: headers,
                timeout: 5000, // 5秒でタイムアウト
            }
        );

        const json = res.data;

        if (json.errors) {
            console.error("GraphQL Error - Query:", query, "Errors:", json.errors);
            throw new Error('GraphQL query failed');
        }

        return json.data;
    } catch (error) {
        console.error("API Request Failed:", {
            endpoint: process.env.BACKEND_GQL_API,
            error: error,
        });
        throw new Error('Failed to fetch API: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
}