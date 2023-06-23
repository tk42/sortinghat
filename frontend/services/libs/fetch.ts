import axios from 'axios'

export async function fetchAPI(query: string) {
    if (process.env.BACKEND_API == null) {
        throw new Error('BACKEND_API is not defined')
    }
    const headers = {
        'content-type': 'application/json',
    }
    const res = await axios.post(process.env.BACKEND_API, {
        query: query,
    }, {
        headers: headers
    })
    const json = res.data

    if (json.errors) {
        console.error("query:", query, "errors:", json.errors)
        throw new Error('Failed to fetch API')
    }

    return json.data
}
