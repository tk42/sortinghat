import axios from 'axios'
import { useQuery, gql } from 'react-query'
import { TEACHER_FIELDS } from './teachergrid'

const SCHOOL_FIELDS = gql(`
    fragment SchoolFields on School {
        id
        name
        postal_code
        prefecture
        city
        address
        created_at
    }
`)

export type SchoolGridProps = {
    setSchoolId: (id: number) => void
}

export function SchoolGrid(props: SchoolGridProps) {
    // const schools = axios.post('/api/schools/list')

    const query = gql(`
        ${SCHOOL_FIELDS}
        ${TEACHER_FIELDS}
        query schoolQuery {
            schools {
                ...SchoolFields
                teachers {
                    ...TeacherFields
                }
            }
        }
    `);

    const people = [{
        id: 0,
        name: '修学院小学校',
        postal_code: '6068021',
        prefecture: '京都府',
        city: '京都市左京区',
        address: '沖殿町1'
    }]

    return (
        <div className="px-4 sm:px-6 lg:px-8">
            <div className="sm:flex sm:items-center">
                <div className="sm:flex-auto">
                    <p className="mt-2 text-base font-light text-blue-900">
                        学校の基本情報（名称，住所，紐づく教員）を記入してください
                    </p>
                </div>
                <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
                    {/* <button
                        type="button"
                        className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                        onClick={() => window.my_modal_2.showModal()}
                    >
                        学校を追加
                    </button> */}
                    <label
                        htmlFor="my_modal_4"
                        className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    >
                        学校を追加
                    </label>
                    <dialog id="my_modal_2" className="modal">
                        <form method="dialog" className="modal-box">
                            <h3 className="font-bold text-lg">Hello!</h3>
                            <p className="py-4">Press ESC key or click outside to close</p>
                        </form>
                        <form method="dialog" className="modal-backdrop">
                            <button>close</button>
                        </form>
                    </dialog>
                </div>
            </div>
            <div className="mt-8 flow-root">
                <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                        <table className="min-w-full divide-y divide-gray-300">
                            <thead>
                                <tr className="divide-x divide-gray-200">
                                    <th scope="col" className="py-3.5 pl-4 pr-4 text-left text-sm font-semibold text-gray-900 sm:pl-0">
                                        名称
                                    </th>
                                    <th scope="col" className="px-4 py-3.5 text-left text-sm font-semibold text-gray-900">
                                        住所
                                    </th>
                                    <th scope="col" className="px-4 py-3.5 text-left text-sm font-semibold text-gray-900">
                                        都道府県
                                    </th>
                                    <th scope="col" className="px-4 py-3.5 text-left text-sm font-semibold text-gray-900">
                                        市区町村
                                    </th>
                                    <th scope="col" className="px-4 py-3.5 text-left text-sm font-semibold text-gray-900">
                                        その他住所
                                    </th>
                                    {/* <th scope="col" className="px-4 py-3.5 text-left text-sm font-semibold text-gray-900">
                                        教員
                                    </th> */}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {people.map((person) => (
                                    <tr key={person.id} className="divide-x divide-gray-200"
                                        onClick={() => props.setSchoolId(person.id)}
                                    >
                                        <td className="whitespace-nowrap py-4 pl-4 pr-4 text-sm font-medium text-gray-900 sm:pl-0">
                                            {person.name}
                                        </td>
                                        <td className="whitespace-nowrap p-4 text-sm text-gray-500">{person.postal_code}</td>
                                        <td className="whitespace-nowrap p-4 text-sm text-gray-500">{person.prefecture}</td>
                                        <td className="whitespace-nowrap p-4 text-sm text-gray-500">{person.city}</td>
                                        <td className="whitespace-nowrap p-4 text-sm text-gray-500">{person.address}</td>
                                        {/* <td className="whitespace-nowrap p-4 text-sm text-gray-500">{person.teachers}</td> */}
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
