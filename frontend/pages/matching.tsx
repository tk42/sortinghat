import { useRouter } from 'next/router'
import AppLayout from 'components/layouts/applayout';
import { TeacherContext } from 'services/libs/context';
import React, { useEffect, useState, useContext, useCallback } from 'react'
import { Class, Survey } from 'services/types/interfaces';
import { Container as Loading } from 'components/loading'
import { getSurveyByClassId, getClassByTeacherId } from 'services/libs/getter';
import { addSurvey } from 'services/libs/setter';
import type { ReactElement } from 'react'
import type { NextPageWithLayout } from './_app'


type ContainerProps = {}

const Page: NextPageWithLayout & React.FC<ContainerProps> = (props: ContainerProps) => {
    const router = useRouter()

    const teacher = useContext(TeacherContext)
    const [classes, setClasses] = useState<Class[]>()
    const [selectedClass, setSelectedClass] = useState<Class | undefined>()
    const [surveys, setSurveys] = useState<Survey[] | undefined>()
    const [survey_name, setSurveyName] = useState<string>("2022年5月")

    const fetchClass = useCallback(async (teacher_id: number) => {
        setClasses(await getClassByTeacherId(teacher_id))
    }, [])

    const fetchSurveysByClasses = useCallback(async (classes : Class[]) => {
        const surveys = await Promise.all(classes.map(async (c: Class) => {
            return await getSurveyByClassId(c.id)
        }))
        setSurveys(surveys.flat())
    }, []);

    useEffect(() => {
        if (teacher) {
            fetchClass(teacher.id)
        }
    }, [teacher]);

    useEffect(() => {
        if (classes !== undefined) {
            fetchSurveysByClasses(classes)
            setSelectedClass(classes[0])
        }
    }, [classes]);

    if (teacher === undefined || surveys === undefined || classes === undefined) {
        return <Loading />
    }

    return (
        <>
            <main className="lg:pl-72">
                <div className="xl:pl-96" style={
                    {
                        zIndex: -1
                    }
                }>
                    {
                        <div className="px-4 py-10 sm:px-6 lg:px-8 lg:py-6">
                            <p className="text-2xl font-thin leading-9 tracking-tight text-blue-900">
                                アンケート一覧を選択してください
                            </p>
                        </div>
                    }
                </div>
            </main>
            <aside className="fixed inset-y-0 left-72 hidden w-96 overflow-y-auto border-r bg-white border-gray-200 px-4 py-6 sm:px-6 lg:px-8 xl:block">
                <div className='flex justify-between items-center'>

                    <span className="text-2xl font-thin my-4 leading-9 tracking-tight text-blue-900">アンケート一覧</span>
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
                                アンケート新規作成
                            </h3>
                            <div>
                                <label className="block text-sm font-medium leading-6 text-gray-900">
                                    アンケート名称
                                </label>
                                <div className="mt-2">
                                    <input
                                    type="text"
                                    name="survey_name"
                                    id="survey_name"
                                    className="block w-lg rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                    value={survey_name}
                                    onChange={(e) => setSurveyName(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="class" className="block text-sm font-medium leading-6 text-gray-900">
                                    クラス選択
                                </label>
                                <select
                                    id="class"
                                    name="class"
                                    className="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                    value={selectedClass?.id}
                                    onChange={(e) => setSelectedClass(classes.find((c: Class) => c.id === parseInt(e.target.value)))}
                                >
                                    {classes.map((c: Class, class_index: number) => (
                                        <option key={`class-${c.id}-${class_index}`} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                            <button
                                className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded"
                                onClick={() => {
                                    addSurvey(selectedClass!.id, survey_name).then(() => {
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
                    {
                        surveys.map((s: Survey) => (
                                <>
                                    <hr key={`hr-${s.id}`} className="my-2 border-gray-200" />
                                    <button
                                        key={`survey-${s.id}`}
                                        className="text-left text-lg font-thin text-blue-900 hover:text-blue-700"
                                        onClick={() => { router.push("/matching/"+s.id) }}>
                                        {s.class.name} - {s.name}
                                    </button>
                                </>
                            )
                        )
                    }
                </div>
            </aside>
        </>
    )
}

Page.getLayout = function getLayout(page: ReactElement) {
    return <AppLayout>{page}</AppLayout>
}

export default Page
