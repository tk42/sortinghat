import AppLayout from 'components/layouts/applayout';
import type { ReactElement } from 'react'
import type { NextPageWithLayout } from './_app'
import { Container as Result } from 'components/result'
import { TeacherContext } from 'services/libs/context';
import React, { useEffect, useState, useContext, useCallback } from 'react'
import { Survey } from 'services/types/interfaces';
import { Container as Loading } from 'components/loading'
import { getSurveyByTeacherId } from 'services/libs/getter';

type ContainerProps = {}

const Page: NextPageWithLayout & React.FC<ContainerProps> = (props) => {
    const teacher = useContext(TeacherContext)
    const [surveys, setSurveys] = useState<Survey[] | undefined>()
    const [displaySurvey, setDisplaySurvey] = useState<Survey | undefined>()

    const fetchTeacher = useCallback(async (teacher_id: number) => {
        setSurveys(await getSurveyByTeacherId(teacher_id))
    }, []);

    useEffect(() => {
        if (teacher) {
            fetchTeacher(teacher.id)
        }
    }, [teacher]);

    if (teacher === undefined || surveys === undefined) {
        return <Loading />
    }

    return (
        <>
            <main className="lg:pl-72">
                <div className="xl:pl-96">
                    <div className="px-4 py-10 sm:px-6 lg:px-8 lg:py-6">
                        <span className="text-2xl font-thin my-4 leading-9 tracking-tight text-blue-900">計算結果</span>
                        <Result survey={displaySurvey} />
                    </div>
                </div>
            </main>

            <aside className="fixed inset-y-0 left-72 hidden w-96 overflow-y-auto border-r border-gray-200 px-4 py-6 sm:px-6 lg:px-8 xl:block">
                <span className="text-2xl font-thin my-4 leading-9 tracking-tight text-blue-900">レポート一覧</span>
                <div className="flex flex-col">
                    {
                        surveys.map((s: Survey, survey_index: number) => (
                            <>
                                <hr key={`hr-${survey_index}`} className="my-2 border-gray-200" />
                                <button
                                    key={`survey-${survey_index}`}
                                    className="flex justify-between items-center text-left text-lg font-thin text-blue-900 hover:text-blue-700"
                                    onClick={() => { setDisplaySurvey(s) }}>
                                    <>
                                        {s.class.name} - {s.name}
                                    </>
                                    {/* <span className='text-sm text-gray-400'>
                                        {s.created_at.toString().slice(0, 16).replace(/T/g, ' ').replace(/-/g, '/')}
                                    </span> */}
                                </button>
                            </>
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
