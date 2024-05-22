import { NextApiRequest, NextApiResponse } from 'next'
import { Student, STUDENT_FIELDS } from 'services/types/interfaces'
import { fetchGqlAPI } from 'services/libs/fetchgql'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.body.student_id) {
        const student: Student | null = await fetchGqlAPI(`
            query GetStudent($student_id: Int!) {
                ${STUDENT_FIELDS}
                students_by_pk(id: $student_id) {
                    ...StudentFields
                }
            }
        `,
        {
            "student_id": req.body.student_id
        }).then((data: any) => {
            return data.students_by_pk as Student;
        });

        if (student) {
            res.status(200).json(student);
        } else {
            res.status(400).json({ error: 'Student not found' });
        }
    } else {
        res.status(400).json({ error: 'No student_id provided' });
    }
}

