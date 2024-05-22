import { Class, Student, StudentPreference, Survey, Result, Team} from 'services/types/interfaces';


export async function addClass(teacher_id: number, name: string): Promise<Class> {
    const data: Class = await fetch("/api/class/add", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            name: name,
            teacher_id: teacher_id,
        }),
    }).then(async (res) => {
        return await res.json() as Class;
    }).catch((error) => {
        console.error(error);
        return {} as Class;
    });
    return data;
}


export async function deleteClass(class_id: number): Promise<boolean> {
    const data: boolean = await fetch("/api/class/delete", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            class_id: class_id,
        }),
    }).then(async (res) => {
        return await res.json() as boolean;
    }
    ).catch((error) => {
        console.error(error);
        return false;
    });
    return data;
}

export async function addStudent (class_id: number, name: string, sex?: number, memo?: string): Promise<Student> {
    const data: Student = await fetch("/api/student/add", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            class_id: class_id,
            name: name,
            sex: sex,
            memo: memo,
        }),
    }).then(async (res) => {
        return await res.json() as Student;
    }).catch((error) => {
        console.error(error);
        return {} as Student;
    });
    return data;
}

export async function deleteStudent(student_id: number): Promise<boolean> {
    const data: boolean = await fetch("/api/student/delete", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            student_id: student_id,
        }),
    }).then(async (res) => {
        return await res.json() as boolean;
    }).catch((error) => {
        console.error(error);
        return false;
    });
    return data;
}


export async function addSurvey(class_id: number, name: string): Promise<Survey> {
    const data: Survey = await fetch("/api/survey/add", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            name: name,
            class_id: class_id,
        }),
    }).then(async (res) => {
        return await res.json() as Survey;
    }).catch((error) => {
        console.error(error);
        return {} as Survey;
    });
    return data;
}


export async function upsertStudentPreference(
        student_preferences: StudentPreference[]
    ): Promise<boolean> {
    // console.log(student_preferences)
    const result: boolean = await fetch("/api/preference/add", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            student_preferences: student_preferences
        }),
    }).then(async (res) => {
        return true
    }).catch((error)=>{
        console.error(error);
        return false
        // update
        // fetch("/api/student_preference/update", {
        //     method: "POST",
        //     headers: {
        //         "Content-Type": "application/json",
        //     },
        //     body: JSON.stringify({
        //         survey_id: survey_id,
        //         student_id: student_id,
        //         mi_a: mi_a,
        //         mi_b: mi_b,
        //         mi_c: mi_c,
        //         mi_d: mi_d,
        //         mi_e: mi_e,
        //         mi_f: mi_f,
        //         mi_g: mi_g,
        //         mi_h: mi_h,
        //         leader: leader,
        //         eyesight: eyesight,
        //         dislikes: dislikes,
        //     }),
        // }).then(async (res) => {
        //     return true
        // }).catch((error) => {
        //     console.error(error);
        //     return false;
        // })
        // return false
    });
    return result;
}

interface TeamByMember {
    team: number, 
    member: number
}

export async function addResult(result: Result, survey_id: number) {
    // get student_preference by survey_id
    const data_sp: StudentPreference[] = await fetch("/api/preference/get_survey", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            survey_id: survey_id
        }),
    }).then(async (res) => {
        return await res.json() as StudentPreference[];
    }).catch((error) => {
        console.error(error);
        return [] as StudentPreference[];
    });

    const team_student_id: TeamByMember[] = Object.entries((result as Result).teams_by_member).map(([member, team]: [string, number]) => {
        return {
            team: team,
            member: parseInt(member)
        } as TeamByMember
    })

    // console.log(JSON.stringify(team_student_id))

    const req_teams: Team[] = team_student_id.map((tbm: TeamByMember) => {
        return {
            team_id: tbm.team,
            name: `Team `+tbm.team.toString(),
            survey_id: survey_id
        } as Team
    }).filter((team: Team, index: number, self: Team[]) =>
        index === self.findIndex((t: Team) => (
            t.team_id === team.team_id
        ))
    )

    // console.log(JSON.stringify(req_teams))

    // upsert teams and then returned with its id
    const resp_teams: Team[] = await fetch("/api/team/add", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            teams: req_teams
        }),
    }).then(async (res) => {
        return await res.json() as Team[];
    })

    console.log(JSON.stringify(resp_teams))

    const request: StudentPreference[] = data_sp.map((sp: StudentPreference, student_index: number) => {
        // console.log(`Team `+team_student_id.find((tbm: TeamByMember) => tbm.member == student_index)!.team.toString())
        const team_id: number = team_student_id.find((tbm: TeamByMember) => tbm.member == student_index)!.team
        return {
            ...sp,
            team_id: resp_teams.find((team: Team) => team.team_id == team_id)!.id,
        } as StudentPreference
    })

    // console.log(JSON.stringify(request))

    // set result.teams_by_member to student_preference
    const resp = await fetch("/api/preference/add_result", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            request: request
        }),
    }).then(async (res) => {
        return await res.json() as Result;
    }).catch((error) => {
        console.error(error);
        return {} as Result;
    });
    return resp;
}