import { NextApiRequest, NextApiResponse } from 'next'
import { fetchGqlAPI } from 'services/libs/fetchgql'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.body.email) {
        const deletedTeacher: {success: boolean, error?: string} = await fetchGqlAPI(`
            mutation DeleteTeacher($email: String!) {
                delete_teachers(where: {email: {_eq: $email}}) {
                    affected_rows
                }
            }`,
            {
                "email": req.body.email
            }
        ).then((data: any) => {
            if (data.delete_teachers.affected_rows === 0) {
                return { success: true, error: 'No teacher found' }
            } else {
                return { success: true }
            }
        }).catch((error: any) => {
            return { success: false, error: error.message }
        })

        if (deletedTeacher.success) {
            res.status(200).json({ message: 'Teacher deleted successfully' })
        } else {
            res.status(400).json({ error: deletedTeacher.error })
        }
    } else {
        res.status(400).json({ error: 'No email provided' })
    }
}
