

export type MIScore = [number, number, number, number, number, number, number, number]

export interface School {
    id: number;
    name: string;
    postal_code: string;
    prefecture: string;
    city: string;
    address: string;
}

export const SCHOOL_FIELDS = `
    fragment SchoolFields on schools {
        id
        name
        postal_code
        prefecture
        city
        address
    }
`

export interface Teacher {
    id: number;
    name: string;
    family_name: string;
    given_name: string;
    email: string;
    status: number;
    school: School;
}

export const TEACHER_FIELDS = `
    fragment TeacherFields on teachers {
        id
        name
        family_name
        given_name
        email
        status
        school {
            id
            name
            city
        }
    }
`

export interface Class {
    id: number;
    name: string;
    teacher: Teacher;
    students: Student[];
    surveys: Survey[];
}

export const CLASS_FIELDS = `
    fragment ClassFields on classes {
        id
        name
        teacher {
            id
            name
        }
        surveys {
            id
            name
        }
        students {
            id
            name
            sex
            memo
        }
    }
`

export interface Student {
    id: number;
    name: string;
    sex: number;
    memo?: string;
    class: Class;
}

export const STUDENT_FIELDS = `
    fragment StudentFields on students {
        id
        name
        sex
        memo
        class {
            id
            name
        }
    }
`

export interface Survey {
    id: number;
    name: string;
    status: number;
    class: Class;
    student_preferences: StudentPreference[];
}

export const SURVEY_FIELDS = `
    fragment SurveyFields on surveys {
        id
        name
        status
        class {
            id
            name
            students {
                id
                name
                sex
            }
            surveys {
                id
                name
            }
        }
        student_preferences {
            student {
                id
                sex
            }
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
            student_dislikes {
                student_id
            }
        }
    }
`

export interface Team {
    id?: number; // unique id for all teams
    team_id: number; // id for each survey
    name: string; // Team 1, Team 2, ...
    survey?: Survey;
    student_preferences?: StudentPreference[];
}

export const TEAM_FIELDS = `
    fragment TeamFields on teams {
        id
        team_id
        name
        student_preferences {
            student {
                id
                name
                sex
            }
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
        }
    }
`

export interface StudentPreference {
    id: number;
    student: Student;
    survey: Survey;
    team?: Team;
    mi_a: number;
    mi_b: number;
    mi_c: number;
    mi_d: number;
    mi_e: number;
    mi_f: number;
    mi_g: number;
    mi_h: number;
    leader: number;
    eyesight: number;
    student_dislikes: StudentDislike[];
}

export const STUDENT_PREFERENCE_FIELDS = `
    fragment StudentPreferenceFields on student_preferences {
        id
        student {
            id
            name
            sex
        }
        survey {
            id
            name
        }
        team {
            id
            name
        }
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
        student_dislikes {
            student_id
        }
    }
`

export const UPDATE_TEAM_STUDENT_PREFERENCE_FIELDS = `
    fragment UpdateTeamStudentPreferenceFields on student_preferences {
        id
        student {
            id
        }
        team {
            id
            name
        }
    }
`

export interface StudentDislike {
    id?: number;
    preference_id?: number;
    student_id: number;
}

export const STUDENT_DISLIKE_FIELDS = `
    fragment StudentDislikeFields on student_dislikes {
        id
        preference_id
        student_id
    }
`

export interface Score {
    A: number;
    B: number;
    C: number;
    D: number;
    E: number;
    F: number;
    G: number;
    H: number;
    L: number;
    ES: number;
    S: number;
}

export interface Result {
    score_by_member: Map<string, Score[]>;
    teams_by_member: Map<string, number>;
    member_by_team: Map<string, number[]>;
}
