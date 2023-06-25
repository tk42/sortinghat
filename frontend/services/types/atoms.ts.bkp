import { atom } from 'recoil';
import { StudentFlavor, Result } from './interfaces';

export enum RecoilAtomKeys {
    STUDENTS_STATE = 'studentState',
    RESULTS_STATE = 'resultsState',
}

const data: StudentFlavor[] = [...Array(30)].map((_, index) => {
    const name = `student_${index + 1}`;
    return {
        id: index,
        name: name,
        sex: (index % 2) + 1,
        previous: 1,
        scoreA: 0,
        scoreB: 0,
        scoreC: 0,
        scoreD: 0,
        scoreE: 0,
        scoreF: 0,
        scoreG: 0,
        scoreH: 0,
        leader: 1,
        eyesight: 1,
        dislikes: [],
    };
});

export const studentsState = atom<Partial<StudentFlavor>[] | undefined>({
    key: RecoilAtomKeys.STUDENTS_STATE,
    default: data,
});

export const resultsState = atom<Result | undefined>({
    key: RecoilAtomKeys.RESULTS_STATE,
    default: undefined,
});
