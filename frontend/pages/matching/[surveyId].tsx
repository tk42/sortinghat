import AppLayout from 'components/layouts/applayout';
import { useRouter, NextRouter } from 'next/router';
import React, { useEffect, useState, useCallback } from 'react'
import { Student, StudentDislike, StudentPreference, Survey } from 'services/types/interfaces';
import { upsertStudentPreference } from 'services/libs/setter';
import { Container as Loading } from 'components/loading'
import { getSurvey } from 'services/libs/getter';
import type { ReactElement } from 'react'
import type { NextPageWithLayout } from '../_app'
import { StartMatchingDialog } from 'components/start_matching_dialog'
import Table from 'components/grid'


type ContainerProps = {}

const SurveyContainer = (props: {router: NextRouter, survey: Survey}) => {
    const [data, setData] = useState(new Array(props.survey.class.students.length).fill([]).map((values: string[], index: number)=>[
        props.survey.class.students[index].name,
        props.survey.class.students[index].sex.toString(), 
        (props.survey.student_preferences[index] ?? {mi_a: ''}).mi_a.toString(),
        (props.survey.student_preferences[index] ?? {mi_b: ''}).mi_b.toString(),
        (props.survey.student_preferences[index] ?? {mi_c: ''}).mi_c.toString(),
        (props.survey.student_preferences[index] ?? {mi_d: ''}).mi_d.toString(),
        (props.survey.student_preferences[index] ?? {mi_e: ''}).mi_e.toString(),
        (props.survey.student_preferences[index] ?? {mi_f: ''}).mi_f.toString(),
        (props.survey.student_preferences[index] ?? {mi_g: ''}).mi_g.toString(),
        (props.survey.student_preferences[index] ?? {mi_h: ''}).mi_h.toString(),
        (props.survey.student_preferences[index] ?? {leader: ''}).leader.toString(),
        (props.survey.student_preferences[index] ?? {eyesight: ''}).eyesight.toString(),
        (props.survey.student_preferences[index] ?? {student_dislikes: []}).student_dislikes.map((dislike: StudentDislike) => { return (props.survey.class.students.find((s: Student)=>s.id == dislike.student_id)!.student_no-1).toString() }).join(',')
    ]));

    return (
        <>
            <main className="">
                <div className="xl:pl-96" style={
                    {
                        zIndex: -1
                    }
                }>
                    {
                        (
                            <div className="px-4 py-10 sm:px-6 lg:px-8 lg:py-6">
                                <p className="text-2xl font-thin leading-9 tracking-tight text-blue-900">
                                    {props.survey.class.name} - {props.survey.name} アンケート結果入力
                                </p>
                                <div className='flex justify-between items-center'>
                                    <span className="text-base font-light my-4 leading-9 tracking-tight text-blue-900">
                                        生徒たちに実施したアンケート結果を記入してください (A~H, リーダー，視力は貼り付け可能)
                                    </span>
                                    <div className='flex'>
                                        <label
                                            htmlFor="my-modal-3"
                                            className="rounded-md bg-red-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
                                            >
                                            保存
                                        </label>
                                        <label
                                            htmlFor="my-modal-4"
                                            className="rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                                        >
                                            マッチング開始
                                        </label>
                                    </div>

                                    <input type="checkbox" id="my-modal-3" className="modal-toggle" onClick={
                                        () => {
                                            upsertStudentPreference(data.map((values: string[], index: number) => {
                                                return {
                                                    student: props.survey.class.students[index] as Student,
                                                    survey: props.survey as Survey,
                                                    mi_a: parseInt(values[2]),
                                                    mi_b: parseInt(values[3]),
                                                    mi_c: parseInt(values[4]),
                                                    mi_d: parseInt(values[5]),
                                                    mi_e: parseInt(values[6]),
                                                    mi_f: parseInt(values[7]),
                                                    mi_g: parseInt(values[8]),
                                                    mi_h: parseInt(values[9]),
                                                    leader: parseInt(values[10]),
                                                    eyesight: parseInt(values[11]),
                                                    student_dislikes: values[12].split(',').filter((val: string)=>{
                                                        return val !== ''
                                                    }).map((dislike_student_row_index: string)=>{ // Table の仕様で row_index が入る. 0-indexed
                                                        // console.log(JSON.stringify(props.survey.class.students[parseInt(dislike_student_row_index)]))
                                                        return {
                                                            student_id: props.survey.class.students[parseInt(dislike_student_row_index)].id
                                                        } as StudentDislike
                                                    })
                                                } as unknown as StudentPreference
                                            })).then(() => {
                                                alert('保存しました')
                                            })
                                        }
                                    }/>

                                    <input type="checkbox" id="my-modal-4" className="modal-toggle" />
                                    <label htmlFor="my-modal-4" className="cursor-pointer modal">
                                        <StartMatchingDialog {...{...props}} />
                                    </label>
                                </div>
                                <div className='mt-2'>
                                    <Table {...{data: data, setData: setData}} />
                                </div>
                            </div>
                        )
                    }
                </div>
            </main>
            {/* <aside className="fixed inset-y-0 left-72 hidden w-96 overflow-y-auto border-r bg-white border-gray-200 px-4 py-6 sm:px-6 lg:px-8 xl:block">
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
                                        onClick={() => { router.push("/matching/"+s.id) }}>
                                        {c.name} - {s.name}
                                    </button>
                                </>
                            )
                            )
                        ))
                    }
                </div>
            </aside> */}
        </>
    )
}

const Page: NextPageWithLayout & React.FC<ContainerProps> = (props: ContainerProps) => {
    const router: NextRouter = useRouter()
    const { surveyId } = router.query;

    if (typeof surveyId === 'number' || Array.isArray(surveyId) || surveyId === undefined) {
        return <Loading />
    }

    // const teacher = useContext(TeacherContext)
    const [survey, setSurvey] = useState<Survey | undefined>()
    const fetchSurvey = useCallback(async (survey_id: number) => {
        const result: Survey = await getSurvey(survey_id)
        setSurvey(result)
    }, []);

    useEffect(() => {
        fetchSurvey(parseInt(surveyId))
    }, [surveyId]);

    if (survey === undefined) {
        return <Loading />
    }

    return (
        <SurveyContainer {...{router: router, survey: survey}}/>
    )
}

Page.getLayout = function getLayout(page: ReactElement) {
    return <AppLayout>{page}</AppLayout>
}

export default Page
