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
    firebase_uid: string;
    name: string;
    email: string;
    stripe_id?: string;
    school?: School;
    created_at: string;
    updated_at: string;
}

export const TEACHER_FIELDS = `
    fragment TeacherFields on teachers {
        id
        firebase_uid
        name
        email
        stripe_id
        school {
            id
            name
            city
        }
        created_at
        updated_at
    }
`

export interface Class {
    id: number;
    name: string;
    uuid: string;
    teacher: Teacher;
    students: Student[];
    surveys: Survey[];
    created_at: string;
}

export const CLASS_FIELDS = `
    fragment ClassFields on classes {
        id
        name
        uuid
        created_at
        teacher {
            id
            name
        }
        surveys {
            id
            name
        }
        students(order_by: {student_no: asc}) {
            id
            student_no
            name
            sex
            memo
        }
    }
`

export interface Student {
    id: number;
    student_no: number;
    name: string;
    sex: number;
    memo?: string;
    class: Class;
}

export interface DashboardStudent extends Omit<Student, 'id' | 'class' | 'memo'> {
    id: string;
    class_id: string;
    created_at: string;
    updated_at: string;
    memo: string | null;
}

export const STUDENT_FIELDS = `
    fragment StudentFields on students {
        id
        student_no
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
    class_id: number;
    student_preferences?: StudentPreference[];
    created_at?: string;
    updated_at?: string;
    teams?: Team[]; // ???
}

export const SURVEY_FIELDS = `
    fragment SurveyFields on surveys {
        id
        name
        status
        class {
            id
            name
            students(order_by: {student_no: asc}) {
                id
                student_no
                name
                sex
            }
            surveys {
                id
                name
            }
        }
        student_preferences(order_by: {student: {student_no: asc}}) {
            student {
                id
                student_no
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
            student_dislikes(order_by: {id: asc}) {
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
        student_preferences(order_by: {student: {student_no: asc}}) {
            student {
                id
                student_no
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

export interface StudentDislike {
    id?: number;
    student_id: number;
    preference_id?: number;
}

export const STUDENT_DISLIKE_FIELDS = `
    fragment StudentDislikeFields on student_dislikes {
        id
        student_id
        preference_id
    }
`

export interface StudentPreference {
    id: number;
    student: Student;
    survey: Survey;
    team?: Team;
    previous_team: number;
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
    created_at: string;
    updated_at: string;
}

export const STUDENT_PREFERENCE_FIELDS = `
    fragment StudentPreferenceFields on student_preferences {
        id
        student {
            ...StudentFields
        }
        survey {
            ...SurveyFields
        }
        team {
            ...TeamFields
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
            ...StudentDislikeFields
        }
        created_at
        updated_at
    }
    ${STUDENT_FIELDS}
    ${SURVEY_FIELDS}
    ${TEAM_FIELDS}
    ${STUDENT_DISLIKE_FIELDS}
`

export const UPDATE_TEAM_STUDENT_PREFERENCE_FIELDS = `
    fragment UpdateTeamStudentPreferenceFields on student_preferences {
        id
        student(order_by: {student_no: asc}) {
            id
            student_no
        }
        team {
            id
            name
        }
    }
`

export interface Price {
    id: string;
    product: string;
    unit_amount: number;
    currency: string;
    recurring: {
        interval: string;
    };
}

export interface PaymentHistory {
    id: string;
    amount: number;
    currency: string;
    status: string;
    created: number;
}

export interface Subscription {
    id: string;
    status: string;
    current_period_end: number;
    pause_collection?: {
        behavior: 'keep_as_draft' | 'mark_uncollectible' | 'void';
    };
}

export interface Constraint {
    max_num_teams: number;
    members_per_team?: number;
    at_least_one_pair_sex: boolean;
    girl_geq_boy: boolean;
    boy_geq_girl: boolean;
    at_least_one_leader: boolean;
    unique_previous?: number;
    group_diff_coeff?: number;
}

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