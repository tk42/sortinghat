import { Teacher, Class, Survey, Team, Result, StudentPreference } from 'services/types/interfaces';

export async function getTeacher(email: string): Promise<Teacher> {
    const data: Teacher = await fetch("/api/teacher/get", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            email: email,
        }),
    }).then(async (res) => {
        return await res.json() as Teacher;
    }).catch((error) => {
        console.error(error);
        return {} as Teacher;
    });
    return data;
};

// export async function getClass(teacher_id: number): Promise<Class[]> {
//     const data: Class[] = await fetch("/api/class/get", {
//         method: "POST",
//         headers: {
//             "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//             teacher_id: teacher_id,
//         }),
//     }).then(async (res) => {
//         return await res.json() as Class[];
//     }).catch((error) => {
//         console.error(error);
//         return {} as Class[];
//     });
//     return data;
// }

export async function getClassByTeacherId(teacher_id: number): Promise<Class[]> {
    const data: Class[] = await fetch("/api/class/get_teacher", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            teacher_id: teacher_id,
        }),
    }).then(async (res) => {
        return await res.json() as Class[];
    }).catch((error) => {
        console.error(error);
        return {} as Class[];
    });
    return data;
}


export async function getSurvey(survey_id: number): Promise<Survey> {
    const data: Survey = await fetch("/api/survey/get", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            survey_id: survey_id,
        }),
    }).then(async (res) => {
        return await res.json() as Survey;
    }).catch((error) => {
        console.error(error);
        return {} as Survey;
    });
    return data;
}

export async function findPreviousTeam(survey_id: number): Promise<StudentPreference[]> {
    // console.log("survey_id", survey_id)
    const data: StudentPreference[] = await fetch("/api/preference/get_survey", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            survey_id: survey_id,
        }),
    }).then(async (res) => {
        return await res.json() as StudentPreference[];
    }).catch((error) => {
        console.error(error);
        return [] as StudentPreference[];
    });
    return data
}

export async function getSurveyByClassId(class_id: number): Promise<Survey[]> {
    const data: Survey[] = await fetch("/api/survey/get_class", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            class_id: class_id,
        }),
    }).then(async (res) => {
        return await res.json() as Survey[];
    }).catch((error) => {
        console.error(error);
        return {} as Survey[];
    });
    return data;
}

export async function getSurveyByTeacherId(teacher_id: number): Promise<Survey[]> {
    const data: Survey[] = await fetch("/api/survey/get_teacher", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            teacher_id: teacher_id,
        }),
    }).then(async (res) => {
        return await res.json() as Survey[];
    }).catch((error) => {
        console.error(error);
        return {} as Survey[];
    });
    return data;
}

export async function getTeams(survey_id: number): Promise<Team[]> {
    const data: Team[] = await fetch("/api/team/get", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            survey_id: survey_id,
        }),
    }).then(async (res) => {
        return await res.json() as Team[];
    }).catch((error) => {
        console.error(error);
        return {} as Team[];
    });
    return data;
}

export async function solve(query: any): Promise<Result> {
    const data: Result = await fetch("/api/solve", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(query),
    }).then(async (res) => {
        const json = await res.json()
        if (json.error) {
            throw new Error(json.error)
        }
        return json as Result;
    })
    return data;
}