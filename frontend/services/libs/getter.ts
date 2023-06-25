import { Teacher, Class } from 'services/types/interfaces';

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

export async function getClass(teacher_id: number): Promise<Class[]> {
    const data: Class[] = await fetch("/api/class/get", {
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


export async function getMatching(teacher_id: number): Promise<Class[]> {
    const data: Class[] = await fetch("/api/matching/get", {
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