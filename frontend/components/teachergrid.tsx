import axios from 'axios'
import { useQuery, gql } from 'react-query'

export const TEACHER_FIELDS = gql(`
    fragment TeacherFields on Teacher {
        id
        name
        family_name
        given_name
        email
        status
        created_at
    }
`)

export type TeacherGridProps = {
    schoolId: number
}


export function TeacherGrid(props: TeacherGridProps) {
    // const people = axios.post('/api/teachers/add', {
    //     school_id: 0,
    //     name: '奥埜のぞみ',
    //     family_name: '奥埜',
    //     given_name: 'のぞみ',
    //     email: 'hoge@outlook.com',
    //     status: 'basic'
    // })
    const people = [{
        id: 0,
        name: '奥埜のぞみ',
        family_name: '奥埜',
        given_name: 'のぞみ',
        email: '',
        status: 'basic'
    }]

    return (
        <div className="px-4 sm:px-6 lg:px-8">
            <div className="sm:flex sm:items-center">
                <div className="sm:flex-auto">
                    <p className="mt-2 text-base font-light text-blue-900">
                        教員の基本情報（名前，メールアドレス，プラン）を記入してください
                    </p>
                </div>
                <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
                    <button
                        type="button"
                        className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    >
                        担任を追加
                    </button>
                </div>
            </div>
            <div className="mt-8 flow-root">
                <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                        <table className="min-w-full divide-y divide-gray-300">
                            <thead>
                                <tr className="divide-x divide-gray-200">
                                    <th scope="col" className="py-3.5 pl-4 pr-4 text-left text-sm font-semibold text-gray-900 sm:pl-0">
                                        担任教員名
                                    </th>
                                    <th scope="col" className="px-4 py-3.5 text-left text-sm font-semibold text-gray-900">
                                        名字
                                    </th>
                                    <th scope="col" className="px-4 py-3.5 text-left text-sm font-semibold text-gray-900">
                                        名前
                                    </th>
                                    <th scope="col" className="px-4 py-3.5 text-left text-sm font-semibold text-gray-900">
                                        メールアドレス
                                    </th>
                                    <th scope="col" className="px-4 py-3.5 text-left text-sm font-semibold text-gray-900">
                                        プラン
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {people.map((person) => (
                                    <tr key={person.id} className="divide-x divide-gray-200">
                                        <td className="whitespace-nowrap py-4 pl-4 pr-4 text-sm font-medium text-gray-900 sm:pl-0">
                                            {person.name}
                                        </td>
                                        <td className="whitespace-nowrap p-4 text-sm text-gray-500">{person.family_name}</td>
                                        <td className="whitespace-nowrap p-4 text-sm text-gray-500">{person.given_name}</td>
                                        <td className="whitespace-nowrap p-4 text-sm text-gray-500">{person.email}</td>
                                        <td className="whitespace-nowrap p-4 text-sm text-gray-500">{person.status}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}
