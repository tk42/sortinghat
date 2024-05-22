import AppLayout from 'components/layouts/applayout';
import { StudentGrid } from 'components/studentgrid'
import React, { useEffect, useState, useContext, useCallback } from 'react'
import { Class } from 'services/types/interfaces';
import { Container as Loading } from 'components/loading'
import { getClassByTeacherId } from 'services/libs/getter';
import { addClass, deleteClass } from 'services/libs/setter';
import type { ReactElement } from 'react'
import type { NextPageWithLayout } from './_app'
import { TeacherContext } from 'services/libs/context';


type ContainerProps = {}

const Page: NextPageWithLayout & React.FC<ContainerProps> = (props: ContainerProps) => {
    const teacher = useContext(TeacherContext)
    const [classes, setClasses] = useState<Class[] | undefined>()
    const [class_name, setClassName] = useState<string>("")  
    const [_class, setClass] = useState<Class | undefined>()

    const fetchTeacher = useCallback(async (teacher_id: number) => {
        setClasses(await getClassByTeacherId(teacher_id))
    }, []);

    useEffect(() => {
        if (teacher) {
            fetchTeacher(teacher.id)
        }
    }, [teacher]);


    if (teacher === undefined || classes === undefined) {
        return <Loading />
    }

    return (
        <>
            <main className="lg:pl-72">
                <div className="xl:pl-96">
                    <div className="px-4 py-10 sm:px-6 lg:px-8 lg:py-6">
                        <span className="text-2xl font-thin my-4 leading-9 tracking-tight text-blue-900">生徒一覧</span>
                        <StudentGrid {...{_class: _class}} />
                    </div>
                </div>
            </main>

            <aside className="fixed inset-y-0 left-72 hidden w-96 overflow-y-auto border-r border-gray-200 px-4 py-6 sm:px-6 lg:px-8 xl:block">
                <div className='flex justify-between items-center'>
                    <span className="text-2xl font-thin my-4 leading-9 tracking-tight text-blue-900">担任クラスの選択</span>
                    <label
                        htmlFor="my-modal-2"
                        className="rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    >
                        新規作成
                    </label>

                    <input type="checkbox" id="my-modal-2" className="modal-toggle" />
                    <label htmlFor="my-modal-2" className="cursor-pointer modal">
                        <label className="relative modal-box" htmlFor="">
                            <h3 className="text-lg font-bold">
                                クラス新規作成
                            </h3>
                            <div>
                                <label className="block text-sm font-medium leading-6 text-gray-900">
                                    クラス名
                                </label>
                                <div className="mt-2">
                                    <input
                                    type="text"
                                    name="class_name"
                                    id="class_name"
                                    className="block w-lg rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                    placeholder="2024年度1年A組"
                                    onChange={(e) => {setClassName(e.target.value)}}
                                    />
                                </div>
                            </div>
                            <button
                                className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded"
                                onClick={() => {
                                    addClass(teacher.id, class_name ).then(() => {
                                        document.getElementById('my-modal-2')?.click()
                                        document.location.reload()
                                    })
                                }}
                            >
                                作成
                            </button>
                        </label>
                    </label>

                </div>
                <div className="flex flex-col">
                    {classes.map((c: Class, index: number) => (
                        <>
                            <hr key={`hr-${index}`} className="my-2 border-gray-200" />
                            <div>
                                <button
                                    key={`class-${index}`}
                                    className="text-left text-lg font-thin text-blue-900 hover:text-blue-700"
                                    onClick={() => { setClass(c) }}>
                                    {c.name}
                                </button>
                                {/* <button
                                    className="text-right text-md font-thin text-blue-900 hover:text-blue-700"
                                    onClick={() => {
                                        deleteClass(c.id).then(() => {
                                            document.location.reload()
                                        })
                                    }}
                                >
                                    削除
                                </button> */}
                            </div>
                        </>
                    ))}
                </div>
            </aside >
        </>
    )
}

Page.getLayout = function getLayout(page: ReactElement) {
    return <AppLayout>{page}</AppLayout>
}

export default Page
