import { NextApiRequest, NextApiResponse } from 'next'
import { fetchGqlAPI } from 'services/libs/fetchgql'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.body.class_id) {
        const deletedClass: {success: boolean, error?: string} = await fetchGqlAPI(`
            mutation DeleteClass($class_id: bigint!) {
                delete_classes_by_pk(class_id: $class_id) {
                    class_id
                }
            }`,
            {
                "class_id": req.body.class_id
            }
        ).then((data: any) => {
            if (data.delete_classes_by_pk === null) {
                return { success: false, error: 'Class not found' }
            } else {
                return { success: true }
            }
        }).catch((error: any) => {
            return { success: false, error: error.message }
        })

        if (deletedClass.success) {
            res.status(200).json({ message: 'Class deleted successfully' })
        } else {
            res.status(400).json({ error: deletedClass.error })
        }
    } else {
        res.status(400).json({ error: 'No class_id provided' })
    }
}

