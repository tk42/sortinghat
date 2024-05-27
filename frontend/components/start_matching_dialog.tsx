import { NextRouter } from 'next/router';
import React, {useEffect, useState} from 'react';
import Select from 'react-select';
import { Survey, Result, Team, StudentPreference, StudentDislike, Student } from 'services/types/interfaces';
import { findPreviousTeam, solve } from 'services/libs/getter';
import {addResult} from 'services/libs/setter';


interface Option {
    readonly key: number;
    readonly label: string;
}


interface ContainerProps {
    router: NextRouter
    survey: Survey
}

export function StartMatchingDialog(props: ContainerProps) {
    const [previous_survey_id, setPreviousSurveyId] = useState<number>(props.survey.id)
    const [previous_preferences_team, setPreviousPreferencesTeam] = useState<StudentPreference[]>([])

    const [girl_geq_boy, setGirlGeqBoy] = useState<boolean>(true)
    const [boy_geq_girl, setBoyGeqGirl] = useState<boolean>(false)
    const [max_team_num, setMaxTeamNum] = useState<number>(4)
    const [max_leader, setMaxLeader] = useState<number | undefined>(undefined)
    const [min_member, setMinMember] = useState<number | undefined>(undefined)
    const [team_num_n, setTeamNumN] = useState<number | undefined>(undefined) // undefined means auto-calculated
    const [previous_overlap_mode, setPreviousOverlapMode] = useState<number | undefined>(undefined)
    const [timeout, setTimeout] = useState<number>(10)

    const previousSurveyOption: Option[] = props.survey.class.surveys.map((c: Survey) => {
        return {
            key: c.id,
            label: c.name
        };
    }).filter((option: Option) => option.key !== props.survey.id); // Remove survey.class.id from the current class id;
    const findOption = (value: number) => previousSurveyOption.find((option: Option) => option.key === value);

    useEffect(() => {
        if (previous_survey_id === undefined) {
            return
        }
        // console.log(previous_survey_id)
        findPreviousTeam(previous_survey_id)
        .then((student_preferences: StudentPreference[]) => {
            setPreviousPreferencesTeam(student_preferences)
        })
    }, [previous_survey_id])

    return (
        <label className="relative modal-box text-center " htmlFor="">
        <h3 className="text-lg font-bold">
            マッチングの探索を始めますか？
        </h3>
        <p className="py-4">
            以下の設定を確認してください。
        </p>
        <label className="block text-sm font-medium leading-6 text-gray-900">
            前回のアンケート結果を指定（前回と同じを回避）
            <Select 
                value={findOption(previous_survey_id)}
                options={previousSurveyOption}
                name={"leader"}
                className={"border-gray-300 min-w-full"}
                onChange={(option: any) => {
                    setPreviousSurveyId(option.key)
                }}
                styles={{control: (base: any) => ({
                    height: 32,
                })}}
                components={{ DropdownIndicator:() => null, IndicatorSeparator:() => null }}
            />
        </label>
        <label className="block text-sm font-medium leading-6 text-gray-900">
            前回の重複(None: previous 判定を無効にする, 0: 誰とも互いに被らない, N: N人被ってもOK)
            <input
                type="number"
                name="previous_overlap_mode"
                id="previous_overlap_mode"
                className="block w-lg rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                value={previous_overlap_mode}
                onChange={(e) => setPreviousOverlapMode(parseInt(e.target.value))}
            />
        </label>
        <label className="block text-sm font-medium leading-6 text-gray-900">
            チーム数N
            <input
                type="number"
                name="team_num_n"
                id="team_num_n"
                className="block w-lg rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                value={team_num_n}
                onChange={(e) => setTeamNumN(parseInt(e.target.value))}
            />
        </label>
        <label className="block text-sm font-medium leading-6 text-gray-900">
            1チームあたりの最大メンバー数
            <input
                type="number"
                name="max_team_num"
                id="max_team_num"
                className="block w-lg rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                value={max_team_num}
                onChange={(e) => setMaxTeamNum(parseInt(e.target.value))}
            />
        </label>
        <label className="block text-sm font-medium leading-6 text-gray-900">
            最小メンバー数
            <input
                type="number"
                name="min_member"
                id="min_member"
                className="block w-lg rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                value={min_member}
                onChange={(e) => setMinMember(parseInt(e.target.value))}
            />
        </label>
        <label className="block text-sm font-medium leading-6 text-gray-900">
            最大リーダー数
            <input
                type="number"
                name="max_leader"
                id="max_leader"
                className="block w-lg rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                value={max_leader}
                onChange={(e) => setMaxLeader(parseInt(e.target.value))}
            />
        </label>
        <label className="block text-sm font-medium leading-6 text-gray-900">
            女子数 &gt;= 男子数
            <input
                type="checkbox"
                name="girl_geq_boy"
                id="girl_geq_boy"
                className="block w-lg rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                checked={girl_geq_boy}
                onChange={(e) => setGirlGeqBoy(e.target.checked)}
            />
        </label>
        <label className="block text-sm font-medium leading-6 text-gray-900">
            男子数 &gt;= 女子数
            <input
                type="checkbox"
                name="boy_geq_girl"
                id="boy_geq_girl"
                className="block w-lg rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                checked={boy_geq_girl}
                onChange={(e) => setBoyGeqGirl(e.target.checked)}
            />
        </label>
        <label className="block text-sm font-medium leading-6 text-gray-900">
            タイムアウト
            <input
                type="number"
                name="timeout"
                id="timeout"
                className="block w-lg rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                value={timeout}
                onChange={(e) => setTimeout(parseInt(e.target.value))}
            />秒
        </label>

        <p className="py-4">
            マッチングの探索の完了までには{timeout}秒ほどかかります。
        </p>
        <button onClick={() => {
            // const sps: StudentPreference[] =  // (previous_preferences_team ? previous_preferences_team : props.survey.student_preferences)
            // console.log(previous_preferences_team) // previous -> undefinied
            const flavors = previous_preferences_team.map((sp: StudentPreference, index: number) => {
                const s = props.survey.student_preferences[index]
                return {
                    student: s.student.student_no,
                    previous: (typeof previous_survey_id == 'number' && sp.team) ? sp.team.id : null,
                    sex: sp.student.sex,
                    mi_a: s.mi_a,
                    mi_b: s.mi_b,
                    mi_c: s.mi_c,
                    mi_d: s.mi_d,
                    mi_e: s.mi_e,
                    mi_f: s.mi_f,
                    mi_g: s.mi_g,
                    mi_h: s.mi_h,
                    leader: s.leader,
                    eyesight: s.eyesight,
                    dislikes: s.student_dislikes.map((d: StudentDislike) => props.survey.class.students.find((s: Student)=>s.id == d.student_id)!.student_no)
                }
            })
            .sort((a, b) => a.student - b.student)
            .map(({ student, ...rest }) => rest);
            // console.log(flavors)

            // const flavors = [
            //     {
            //         sex: 1,
            //         previous: 4, 
            //         mi_a: 3, 
            //         mi_b: 7, 
            //         mi_c: 9, 
            //         mi_d: 3, 
            //         mi_e: 5, 
            //         mi_f: 4, 
            //         mi_g: 7, 
            //         mi_h: 8, 
            //         leader: 3, 
            //         eyesight: 3, 
            //         dislikes: []
            //     },
            //     {
            //         sex: 1,
            //         previous: 3, mi_a: 7, mi_b: 6, mi_c: 6, mi_d: 5, mi_e: 5, mi_f: 7, mi_g: 6, mi_h: 9, leader: 8, eyesight: 1, dislikes: []
            //     },
            //     {
            //         sex: 0,
            //         previous: 3, mi_a: 9, mi_b: 6, mi_c: 5, mi_d: 4, mi_e: 8, mi_f: 8, mi_g: 6, mi_h: 1, leader: 8, eyesight: 1, dislikes: []
            //     },
            //     {
            //         sex: 0,
            //         previous: 2, mi_a: 5, mi_b: 8, mi_c: 9, mi_d: 9, mi_e: 9, mi_f: 8, mi_g: 7, mi_h: 9, leader: 8, eyesight: 1, dislikes: []
            //     },
            //     {
            //         sex: 0,
            //         previous: 6, mi_a: 7, mi_b: 8, mi_c: 6, mi_d: 5, mi_e: 8, mi_f: 8, mi_g: 6, mi_h: 9, leader: 8, eyesight: 1, dislikes: [22, 5]
            //     },
            //     {
            //         sex: 0,
            //         previous: 1, mi_a: 7, mi_b: 7, mi_c: 8, mi_d: 9, mi_e: 8, mi_f: 8, mi_g: 7, mi_h: 9, leader: 1, eyesight: 1, dislikes: []
            //     },
            //     {
            //         sex: 1,
            //         previous: 3, mi_a: 3, mi_b: 3, mi_c: 5, mi_d: 3, mi_e: 3, mi_f: 2, mi_g: 6, mi_h: 8, leader: 1, eyesight: 1, dislikes: []
            //     },
            //     {
            //         sex: 0,
            //         previous: 5, mi_a: 9, mi_b: 6, mi_c: 8, mi_d: 6, mi_e: 8, mi_f: 7, mi_g: 8, mi_h: 7, leader: 3, eyesight: 1, dislikes: []
            //     },
            //     {
            //         sex: 1,
            //         previous: 0, mi_a: 5, mi_b: 7, mi_c: 4, mi_d: 4, mi_e: 6, mi_f: 5, mi_g: 5, mi_h: 8, leader: 1, eyesight: 1, dislikes: []
            //     },
            //     {
            //         sex: 1,
            //         previous: 7, mi_a: 5, mi_b: 5, mi_c: 3, mi_d: 5, mi_e: 9, mi_f: 9, mi_g: 7, mi_h: 8, leader: 8, eyesight: 1, dislikes: [23, 1, 25]
            //     },
            //     {
            //         sex: 1,
            //         previous: 3, mi_a: 8, mi_b: 7, mi_c: 5, mi_d: 7, mi_e: 7, mi_f: 7, mi_g: 3, mi_h: 7, leader: 1, eyesight: 1, dislikes: []
            //     },
            //     {
            //         sex: 1,
            //         previous: 5, mi_a: 5, mi_b: 6, mi_c: 5, mi_d: 5, mi_e: 7, mi_f: 4, mi_g: 8, mi_h: 3, leader: 8, eyesight: 3, dislikes: []
            //     },
            //     {
            //         sex: 1,
            //         previous: 2, mi_a: 5, mi_b: 6, mi_c: 7, mi_d: 4, mi_e: 8, mi_f: 6, mi_g: 5, mi_h: 7, leader: 8, eyesight: 8, dislikes: []
            //     },
            //     {
            //         sex: 0,
            //         previous: 5, mi_a: 5, mi_b: 7, mi_c: 7, mi_d: 6, mi_e: 7, mi_f: 7, mi_g: 3, mi_h: 8, leader: 3, eyesight: 1, dislikes: []
            //     },
            //     {
            //         sex: 0,
            //         previous: 3, mi_a: 6, mi_b: 5, mi_c: 6, mi_d: 1, mi_e: 3, mi_f: 2, mi_g: 3, mi_h: 2, leader: 1, eyesight: 1, dislikes: [17, 22]
            //     },
            //     {
            //         sex: 1,
            //         previous: 4, mi_a: 5, mi_b: 8, mi_c: 5, mi_d: 3, mi_e: 7, mi_f: 5, mi_g: 7, mi_h: 9, leader: 8, eyesight: 3, dislikes: []
            //     },
            //     {
            //         sex: 1,
            //         previous: 0, mi_a: 6, mi_b: 9, mi_c: 9, mi_d: 7, mi_e: 9, mi_f: 8, mi_g: 9, mi_h: 8, leader: 1, eyesight: 1, dislikes: []
            //     },
            //     {
            //         sex: 1,
            //         previous: 6, mi_a: 4, mi_b: 6, mi_c: 9, mi_d: 7, mi_e: 8, mi_f: 5, mi_g: 9, mi_h: 7, leader: 3, eyesight: 1, dislikes: [2, 4, 22]
            //     },
            //     {
            //         sex: 0,
            //         previous: 4, mi_a: 4, mi_b: 5, mi_c: 1, mi_d: 9, mi_e: 6, mi_f: 6, mi_g: 4, mi_h: 6, leader: 3, eyesight: 1, dislikes: []
            //     },
            //     {
            //         sex: 1,
            //         previous: 7, mi_a: 6, mi_b: 8, mi_c: 4, mi_d: 3, mi_e: 7, mi_f: 6, mi_g: 5, mi_h: 3, leader: 3, eyesight: 1, dislikes: [4, 2, 13, 22]
            //     },
            //     {
            //         sex: 0,
            //         previous: 0, mi_a: 4, mi_b: 7, mi_c: 6, mi_d: 4, mi_e: 6, mi_f: 6, mi_g: 6, mi_h: 8, leader: 1, eyesight: 1, dislikes: []
            //     },
            //     {
            //         sex: 0,
            //         previous: 6, mi_a: 2, mi_b: 1, mi_c: 2, mi_d: 1, mi_e: 1, mi_f: 2, mi_g: 2, mi_h: 2, leader: 1, eyesight: 1, dislikes: []
            //     },
            //     {
            //         sex: 1,
            //         previous: 6, mi_a: 5, mi_b: 8, mi_c: 6, mi_d: 7, mi_e: 6, mi_f: 6, mi_g: 8, mi_h: 7, leader: 3, eyesight: 1, dislikes: []
            //     },
            //     {
            //         sex: 0,
            //         previous: 7, mi_a: 4, mi_b: 5, mi_c: 6, mi_d: 7, mi_e: 5, mi_f: 4, mi_g: 3, mi_h: 9, leader: 8, eyesight: 3, dislikes: []
            //     },
            //     {
            //         sex: 1,
            //         previous: 0, mi_a: 2, mi_b: 8, mi_c: 7, mi_d: 6, mi_e: 8, mi_f: 5, mi_g: 8, mi_h: 7, leader: 8, eyesight: 1, dislikes: [1]
            //     },
            //     {
            //         sex: 1,
            //         previous: 4, mi_a: 8, mi_b: 8, mi_c: 8, mi_d: 7, mi_e: 8, mi_f: 7, mi_g: 9, mi_h: 9, leader: 8, eyesight: 8, dislikes: []
            //     },
            //     {
            //         sex: 1,
            //         previous: 1, mi_a: 1, mi_b: 1, mi_c: 1, mi_d: 1, mi_e: 1, mi_f: 1, mi_g: 1, mi_h: 1, leader: 1, eyesight: 1, dislikes: []
            //     }
            // ]

            const req = {
                class_id: previous_survey_id,
                max_team_num: max_team_num,
                team_num_n: team_num_n ?? null,
                previous_overlap: previous_overlap_mode ?? null,
                max_leader: max_leader ?? null,
                min_member: min_member ?? null,
                girl_geq_boy: girl_geq_boy,
                boy_geq_girl: boy_geq_girl,
                timeout: timeout,
                flavors: flavors
            }

            // console.log(req)

            solve(req).then((result: Result) => {
                // console.log(JSON.stringify(result))
                return addResult(result, props.survey.id)
            }).then(() => {
                alert('計算終了！')
                props.router.push('/reports')
            }).catch((error: any) => {
                alert('計算エラーが発生しました。' + error)
            })
        }} className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded">
            開始
        </button>
    </label>
    )
}