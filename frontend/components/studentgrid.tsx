import {useState} from 'react'
import { Class, Student } from 'services/types/interfaces'
import { addStudent, deleteStudent } from 'services/libs/setter';


type ContainerProps = {
    _class?: Class
}

export function StudentGrid(props: ContainerProps) {
    const [student_name, setStudentName] = useState('坂本金八')
    const [student_sex, setStudentSex] = useState(0)
    const [student_memo, setStudentMemo] = useState('8月8日生まれ')

    return (
        <div className="px-4 sm:px-6 lg:px-8">
            <div className='flex justify-between items-center'>
                <div className="sm:flex-auto">
                    <p className="mt-2 text-base font-light text-blue-900">
                        生徒の基本情報（名前，性別）を記入してください
                    </p>
                </div>
                <div className="mt-2 sm:ml-16 sm:mt-0 sm:flex-none">
                    <label
                        htmlFor="my-modal-4"
                        className="rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    >
                        生徒を追加
                    </label>

                    <input type="checkbox" id="my-modal-4" className="modal-toggle" />
                    <label htmlFor="my-modal-4" className="cursor-pointer modal">
                        <label className="relative modal-box" htmlFor="">
                            <h3 className="text-lg font-bold">
                                生徒を追加
                            </h3>
                            <div className="mt-2">
                                <label className="block text-sm font-medium leading-6 text-gray-900">
                                    名前
                                </label>
                                <input
                                    type="text"
                                    name="student_name"
                                    id="student_name"
                                    className="block w-lg rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                    value={student_name}
                                    onChange={(e) => setStudentName(e.target.value)}
                                />
                                <label className="block text-sm font-medium leading-6 text-gray-900">
                                    性別
                                </label>
                                <select
                                    id="sex"
                                    name="sex"
                                    className="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                    defaultValue="男"
                                    onChange={(e) => setStudentSex(e.target.value === '男' ? 0 : 1)}
                                >
                                    <option>男</option>
                                    <option>女</option>
                                </select>
                                <label className="block text-sm font-medium leading-6 text-gray-900">
                                    メモ
                                </label>
                                <input
                                    type="text"
                                    name="memo"
                                    id="memo"
                                    className="block w-lg rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                    value={student_memo}
                                    onChange={(e) => setStudentMemo(e.target.value)}
                                />
                            </div>
                            <button
                                className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded"
                                onClick={() => {
                                    addStudent(props._class!.id, student_name, student_sex, student_memo).then(() => {
                                        document.getElementById('my-modal-4')?.click()
                                        // document.location.reload()
                                    })
                                }}
                                
                            >
                                作成
                            </button>
                        </label>
                    </label>
                </div>
            </div>
            <div className="mt-8 flow-root">
                <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                        <table className="divide-gray-300 table-auto text-left">
                            <thead>
                                <tr className="divide-x divide-gray-200">
                                    <th scope="col" className="w-48 py-2 pl-4 font-semibold text-gray-900 sm:pl-0">
                                        名前
                                    </th>
                                    <th scope="col" className="w-12 py-2 font-semibold text-gray-900">
                                        性別
                                    </th>
                                    <th scope="col" className="w-96 py-2 font-semibold text-gray-900">
                                        メモ
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {
                                    props._class ? (
                                        props._class!.students!.sort((a: Student, b: Student) => a.id - b.id).map((student: Student, index: number) => (
                                            <tr key={`student-${index}`} className="divide-x divide-gray-200">
                                                <td
                                                    className="whitespace-nowrap font-medium text-gray-900 sm:pl-0"
                                                    contentEditable={true}
                                                >
                                                    {student.name}
                                                </td>
                                                <td 
                                                    className="whitespace-nowrap text-gray-500">
                                                        <select className="text-gray-500" value={student.sex}>
                                                            <option value="0">男</option>
                                                            <option value="1">女</option>
                                                        </select>
                                                </td>
                                                <td
                                                    className="whitespace-nowrap text-gray-500"
                                                    contentEditable={true}
                                                >
                                                    {student.memo}
                                                </td>
                                                <td className="whitespace-nowrap text-right text-sm font-medium">
                                                    <button
                                                        className="text-red-500"
                                                        onClick={() => {
                                                            deleteStudent(student.id).then(() => {
                                                                document.location.reload()
                                                            })
                                                        }}
                                                    >
                                                        削除
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : <></>
                                }
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}
