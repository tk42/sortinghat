import axios from 'axios'
import { Result } from 'services/types/interfaces';

export async function fetchAPI(query: string) {
    if (process.env.BACKEND_API == null) {
        throw new Error('BACKEND_API is not defined')
    }
    const headers = {
        'content-type': 'application/json',
    }
    const result: Result = await axios.post(process.env.BACKEND_API, query, {
        headers: headers
    }).then((res: any) => {
        return res.data as Result
    }).catch((error) => {
        console.error(error)
        throw new Error('Failed to fetch API')
    })

    return result
}
