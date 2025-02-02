"use client"

import Link from 'next/link';
import { useAuthContext } from '@/src/utils/firebase/authprovider';

type Props = {
}


export const LoginComponent: React.FC<Props> = () => {
    const { state } = useAuthContext()
    const link = state.user ? '/dashboard' : '/login'

    return (
        <div className='text-center sm:mx-auto sm:w-full sm:max-w-sm'>
            <Link href={link}>
                <button
                    type="button"
                    className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                    始める！
                </button>
            </Link>
        </div>
    )
}