import { Teacher } from 'services/types/interfaces';

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