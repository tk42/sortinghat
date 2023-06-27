export type MIScore = [number, number, number, number, number, number, number, number]

export interface Flavor {
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
    dislikes: { student_id: number }[];
}

export interface Student {
    id?: number;
    class_id?: number;
    name: string;
    sex: number;
    memo?: string;
    student_flavors?: StudentFlavor[];
}

export interface StudentFlavor {
    student: Student;
    flavor: Flavor;
}

export interface Class {
    id?: number;
    name: string;
    students?: Student[];
    surveys?: Survey[];
}

export interface School {
    name: string;
    prefecture: string;
    city: string;
}

export interface Team {
    teams_students: { student_id: number, student: Student }[];
}

export interface Survey {
    id: number;
    name: string;
    student_flavors?: StudentFlavor[];
    teams?: Team[];
    created_at: Date;
}

export interface Teacher {
    id: number;
    name: string;
    class: Class;
    school: School;
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
