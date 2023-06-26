import AppLayout from 'components/layouts/applayout';
import { TeacherContext } from 'services/libs/context';
import React, { useEffect, useState, useContext, useCallback } from 'react'
import { Class, Survey } from 'services/types/interfaces';
import { Container as Loading } from 'components/loading'
import { getMatching } from 'services/libs/getter';
import dynamic from 'next/dynamic'
import { TableProps } from 'components/handsontable'
import type { ReactElement } from 'react'
import type { NextPageWithLayout } from './_app'

export const Table = (props: TableProps) => {
    const DynamicTable = dynamic(
        () => import('components/handsontable').then((mod) => mod.HandsonTable),
        { ssr: false }  // This line is important. It disables server-side rendering for this component.
    )
    return props.survey ? <DynamicTable {...{ survey: props.survey }} /> : <></>
}


export const SURVEYS_FIELDS = `
    fragment SurveysFields on classes {
        name
        surveys {
            id
            name
            student_flavors {
                student {
                    name
                    sex
                }
                flavor {
                    mi_a
                    mi_b
                    mi_c
                    mi_d
                    mi_e
                    mi_f
                    mi_g
                    mi_h
                    leader
                    eyesight
                    dislikes {
                        student_id
                    }
                }
            }
        }
    }
`


type ContainerProps = {}

const Page: NextPageWithLayout & React.FC<ContainerProps> = (props) => {
    const teacher = useContext(TeacherContext)
    const [classes, setClasses] = useState<Class[] | undefined>()
    const [surveyId, setSurveyId] = useState<number | undefined>()

    const fetchTeacher = useCallback(async (teacher_id: number) => {
        setClasses(await getMatching(teacher_id))
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
                        <p className="text-2xl font-thin leading-9 tracking-tight text-blue-900">
                            アンケート結果入力
                        </p>
                        <span className="text-base font-light my-4 leading-9 tracking-tight text-blue-900">
                            生徒たちに実施したアンケート結果を記入してください(コピペ可能)
                        </span>
                        <div className="flex justify-end sm:ml-16 sm:mt-0 sm:flex-none">
                            <label
                                htmlFor="my-modal-4"
                                className="rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                            >
                                マッチング開始
                            </label>

                            <input type="checkbox" id="my-modal-4" className="modal-toggle" />
                            <label htmlFor="my-modal-4" className="cursor-pointer modal">
                                <label className="relative modal-box" htmlFor="">
                                    <h3 className="text-lg font-bold">
                                        マッチングの探索を始めますか？
                                    </h3>
                                    <p className="py-4">
                                        工事中
                                    </p>
                                </label>
                            </label>
                        </div>
                        <div className='mt-4'>
                            <Table {...{ survey: classes.map((c) => c.surveys!).flat().find((survey: Survey) => survey.id == surveyId) }} />
                        </div>
                    </div>
                </div>
            </main>
            <aside className="fixed inset-y-0 left-72 hidden w-96 overflow-y-auto border-r border-gray-200 px-4 py-6 sm:px-6 lg:px-8 xl:block">
                <span className="text-2xl font-thin my-4 leading-9 tracking-tight text-blue-900">アンケート一覧</span>
                <div className="flex justify-end sm:ml-16 sm:mt-0 sm:flex-none">
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
                            <p className="py-4">
                                工事中
                            </p>
                            <p className="py-4">
                                クラス選択・アンケート名入力・前回の班分け選択（あれば）
                            </p>
                        </label>
                    </label>
                </div>

                <div className="flex flex-col">
                    {
                        classes.map((c: Class, class_index: number) => (
                            c.surveys!.map((s: Survey, survey_index: number) => (
                                <>
                                    <hr key={`hr-${class_index}-${survey_index}`} className="my-2 border-gray-200" />
                                    <button
                                        key={`survey-${class_index}-${survey_index}`}
                                        className="text-left text-lg font-thin text-blue-900 hover:text-blue-700"
                                        onClick={() => { setSurveyId(s.id) }}>
                                        {c.name} - {s.name}
                                    </button>
                                </>
                            )
                            )
                        ))
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
