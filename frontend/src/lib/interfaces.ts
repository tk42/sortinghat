export type MIScore = [number, number, number, number, number, number, number, number]

export interface School {
    id: number;
    name: string;
    postal_code: string;
    prefecture: string;
    city: string;
    address: string;
}

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

export interface Class {
    id: number;
    name: string;
    uuid: string;
    teacher?: Teacher;
    students?: Student[];
    surveys?: Survey[];
    created_at: string;
}

export interface Student {
    id: number;
    student_no: number;
    name: string;
    sex: number;
    memo?: string;
    class: Class;
}

export interface DashboardStudent extends Omit<Student, 'class'> {
    class_id: string;
    created_at: string;
    updated_at: string;
}

export interface Survey {
    id: number;
    name: string;
    status: number;
    class: Class;
    class_id: number;
    student_preferences?: StudentPreference[];
    created_at?: string;
    updated_at?: string;
    teams?: Team[];
}

export interface Team {
    id?: number;
    team_id: number;
    name: string;
    survey?: Survey;
    student_preferences?: StudentPreference[];
}

export interface StudentDislike {
    id?: number;
    student_id: number;
    preference_id?: number;
}

export interface StudentPreference {
    id: number;
    student: Student;
    survey: Survey;
    team?: Team;  // 未使用？
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
    max_num_teams?: number;
    members_per_team?: number;
    at_least_one_pair_sex: boolean;
    girl_geq_boy: boolean;
    boy_geq_girl: boolean;
    at_least_one_leader: boolean;
    unique_previous?: number;
    group_diff_coeff?: number;
}

export interface MatchingResult {
    id: number;
    survey_id: number;
    survey: Survey;
    name: string;
    status: number;
    teams: Team[];
    created_at: string;
    updated_at: string;
}

export interface MatchingResultWithTeams extends MatchingResult {
    survey: {
        id: number;
        name: string;
        status: number;
        class: {
            id: number;
            name: string;
            uuid: string;
            teacher: Teacher;
            students: Student[];
            surveys: Survey[];
            created_at: string;
        };
        class_id: number;
        student_preferences?: StudentPreference[];
        created_at?: string;
        updated_at?: string;
        teams?: Team[];
    };
    teams: Array<Team & {
        student_preference: {
            student: {
                id: number;
                student_no: number;
                name: string;
                sex: number;
            };
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
    }>;
}

// GraphQL Response Interfaces
export interface TeamResponse {
    data: {
        insert_teams: {
            returning: Team[]
            affected_rows: number
        }
    }
    errors?: Array<{ message: string }>
}

export interface MatchingResultResponse {
    data: {
        insert_matching_results_one: {
            id: number
        }
    }
    errors?: Array<{ message: string }>
}

export interface StudentPreferencesResponse {
    data: {
        student_preferences: {
            id: number
            student_id: number
        }[]
    }
    errors?: Array<{ message: string }>
}