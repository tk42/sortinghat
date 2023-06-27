import AppLayout from 'components/layouts/applayout';
import { StudentGrid } from 'components/studentgrid'
import React, { useEffect, useState, useContext, useCallback } from 'react'
import { Class } from 'services/types/interfaces';
import { Container as Loading } from 'components/loading'
import { getClass } from 'services/libs/getter';
import type { ReactElement } from 'react'
import type { NextPageWithLayout } from './_app'
import { TeacherContext } from 'services/libs/context';

export const CLASS_FIELDS = `
    fragment ClassFields on classes {
        id
        name
        students {
            id
            name
            sex
            memo
        }
    }
`

type ContainerProps = {}

const Page: NextPageWithLayout & React.FC<ContainerProps> = (props: ContainerProps) => {
    const teacher = useContext(TeacherContext)
    const [classes, setClasses] = useState<Class[] | undefined>()
    const [classId, setClassId] = useState<number | undefined>()

    const fetchTeacher = useCallback(async (teacher_id: number) => {
        setClasses(await getClass(teacher_id))
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
                        <StudentGrid {...{ _class: classes.find((value: Class) => value.id == classId) }} />
                    </div>
                </div>
            </main>

            <aside className="fixed inset-y-0 left-72 hidden w-96 overflow-y-auto border-r border-gray-200 px-4 py-6 sm:px-6 lg:px-8 xl:block">
                <div className='flex justify-between items-center'>
                    <span className="text-2xl font-thin my-4 leading-9 tracking-tight text-blue-900">クラス一覧</span>
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
                            <p className="py-4">
                                工事中
                            </p>
                            <p className="py-4">
                                名称入力
                            </p>
                        </label>
                    </label>

                </div>
                <div className="flex flex-col">
                    {classes.map((c: Class, index: number) => (
                        <>
                            <hr key={`hr-${index}`} className="my-2 border-gray-200" />
                            <button
                                key={`class-${index}`}
                                className="text-left text-lg font-thin text-blue-900 hover:text-blue-700"
                                onClick={() => { setClassId(c.id) }}>
                                {c.name}
                            </button>
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
