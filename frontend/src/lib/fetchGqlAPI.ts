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
            // ここではエラーを投げず、呼び出し元に GraphQL の errors を返します
        }

        // data プロパティを保持したままトップレベルに展開し、errors も付与する
        // これにより以下の両方の呼び出しコードに互換:
        //   1. result.data.conversations[0]
        //   2. result.insert_conversations_one
        // GraphQL の errors が存在する場合でも throw せずに返却
        const merged: any = { data: json.data };
        if (json.data && typeof json.data === 'object') {
            Object.assign(merged, json.data);
        }
        if (json.errors) {
            merged.errors = json.errors;
        }
        return merged;
    } catch (error) {
        console.error("API Request Failed:", {
            endpoint: process.env.BACKEND_GQL_API,
            error: error,
        });
        throw new Error('Failed to fetch API: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
}