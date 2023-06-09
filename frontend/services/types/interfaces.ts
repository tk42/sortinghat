export interface StudentFlavor {
    id: number;
    name: string;
    sex: number;
    previous: number;
    scoreA: number;
    scoreB: number;
    scoreC: number;
    scoreD: number;
    scoreE: number;
    scoreF: number;
    scoreG: number;
    scoreH: number;
    leader: number;
    eyesight: number;
    dislikes: number[];
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
