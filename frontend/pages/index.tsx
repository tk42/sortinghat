import type { ReactElement } from 'react'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import AppLayout from 'components/layouts/applayout';
import { useSession } from "next-auth/react";
import { Teacher } from 'services/types/interfaces';
import { Container as Loading } from 'components/loading'
import type { NextPageWithLayout } from './_app'
import { getTeacher } from 'services/libs/getter';



type ContainerProps = {}

const Page: NextPageWithLayout & React.FC<ContainerProps> = (props) => {
    const router = useRouter()
    const { data: session, status } = useSession()
    const [teacher, setTeacher] = useState<Teacher | undefined>()

    if (status === 'loading') return (
        <Loading />
    )

    if (session?.user?.email === undefined) {
        router.replace('/signin')
    }

    useEffect(() => {
        const fetchTeacher = async () => {
            setTeacher(await getTeacher(session!.user!.email!))
        }
        fetchTeacher()
    }, []);

    if (teacher === undefined) {
        return <Loading />
    }

    return (
        <>
            <main className="py-10 lg:pl-72">
                <div className="px-4 sm:px-6 lg:px-8">
                    <span className="text-2xl font-thin my-4 leading-9 tracking-tight text-blue-900">
                        ようこそ！
                    </span>
                    <h2 className="text-xl font-thin my-4 leading-9 tracking-tight text-blue-900">
                        {teacher.school.prefecture} {teacher.school.city} {teacher.school.name} {teacher.class.name}
                    </h2>
                    <h2 className="text-xl font-thin my-4 leading-9 tracking-tight text-blue-900">
                        {teacher.name} 様
                    </h2>
                    <h3 className='text-xl font-thin my-4 leading-9 tracking-tight text-blue-900'>
                        MI理論に基づくアンケートの実施方法
                    </h3>
                </div>
            </main >
        </>
    )
}

Page.getLayout = function getLayout(page: ReactElement) {
    return (
        <AppLayout>{page}</AppLayout>
    )
}

export default Page
