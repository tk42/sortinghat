import md5 from 'md5';
import type { NextPageWithLayout } from '../_app';
import { useSession } from "next-auth/react";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { SchoolGrid } from 'components/schoolgrid';
import { TeacherGrid } from 'components/teachergrid';

type ContainerProps = {}

const md5adminEmail = "1179726377c7f154db8aff676537779c"

const Page: NextPageWithLayout & React.FC<ContainerProps> = (props) => {
    const router = useRouter()
    const { data: session, status } = useSession()
    const [schoolId, setSchoolId] = useState(0)

    if (status === 'loading') return (
        <div className="flex h-screen">
            <div className="m-auto text-center">
                <div className="animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent" />
            </div>
        </div>
    )

    if (!session) {
        router.replace('/signin')
        return
    }

    if (session && session.user && md5(session.user.email) == md5adminEmail) {
        return (
            <>
                <main className="pl-4">
                    <span className="text-2xl font-thin my-4 leading-9 tracking-tight text-blue-900">
                        管理者ページ
                    </span>
                    <div className="flex flex-row">
                        <div className="px-4 py-6 sm:px-6 lg:px-8 xl:block">
                            <span className="text-2xl font-thin my-4 leading-9 tracking-tight text-blue-900">学校一覧</span>
                            <SchoolGrid setSchoolId={setSchoolId} />
                        </div>
                        <div className="px-4 py-6 sm:px-6 lg:px-8 xl:block">
                            <span className="text-2xl font-thin my-4 leading-9 tracking-tight text-blue-900">担任一覧</span>
                            <TeacherGrid schoolId={schoolId} />
                        </div>
                    </div>
                </main>

            </>
        )
    }
    useEffect(() => {
        router.push('/')
    }, [])
    return <></>
}

export default Page
