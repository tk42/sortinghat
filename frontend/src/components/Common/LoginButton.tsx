"use client"

import Link from 'next/link';
import { useAuthContext } from '@/src/utils/firebase/authprovider';

type Props = {
  initialAuthState?: boolean;
}

export const LoginButton: React.FC<Props> = ({ initialAuthState }) => {
    const { state } = useAuthContext()
    
    // SSRで渡された初期状態を優先して使用し、ハイドレーション後はstate.userを使用
    const isAuthenticated = state.user !== undefined ? !!state.user : !!initialAuthState;
    const link = isAuthenticated ? '/dashboard' : '/login'

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