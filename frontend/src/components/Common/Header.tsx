"use client"

import React from 'react'
import { useRouter } from 'next/navigation'
import { HomeIcon, ArrowRightStartOnRectangleIcon } from '@heroicons/react/20/solid'
import { Container as Logo } from '@/src/components/Common/Logo'

type ContainerProps = {
    params: {
        cid?: string
        sid?: string
    }
    surveys?: boolean
}

const Breadcrumb = () => {
    return (
        <svg
            fill="currentColor"
            viewBox="0 0 24 44"
            preserveAspectRatio="none"
            aria-hidden="true"
            className="h-full w-6 flex-shrink-0 text-gray-200"
        >
            <path d="M.293 0l22 22-22 22h1.414l22-22-22-22H.293z" />
        </svg>
    )
}

export const Container = (props: ContainerProps) => {
    const router = useRouter()

    // console.log("props.params", props.params)

    return (
        <nav aria-label="Breadcrumb" className="flex border-b border-gray-200 bg-white">
            <ol role="list" className="mx-auto flex w-full max-w-screen-xl space-x-4 px-4 sm:px-6 lg:px-8">
                <li className="flex">
                    <div className="flex items-center">
                        <a href="/" className="text-gray-400 hover:text-gray-500">
                            <div className="h-7 w-7 items-center justify-center flex">
                                <Logo brand={false} />
                            </div>
                        </a>
                    </div>
                </li>

                <Breadcrumb />

                <li className="flex">
                    <div className="flex items-center">
                        <a href="/home" className="text-gray-400 hover:text-gray-500">
                            <HomeIcon aria-hidden="true" className="h-5 w-5 flex-shrink-0" />
                            <span className="sr-only">Home</span>
                        </a>
                    </div>
                </li>

                {
                    (props.params && props.params.cid) ? (
                        <>
                            <Breadcrumb />
                            <a
                                href={"/" + props.params.cid}
                                // aria-current={page.current ? 'page' : undefined}
                                className="ml-4 text-md font-md items-center flex text-gray-500 hover:text-gray-700"
                            >
                                生徒一覧
                            </a>
                        </>
                    ) : <></>
                }


                {
                    (props.surveys) ? (
                        <>
                            <Breadcrumb />
                            <a
                                href={"/" + props.params.cid + "/surveys"}
                                // aria-current={page.current ? 'page' : undefined}
                                className="ml-4 text-md font-md items-center flex text-gray-500 hover:text-gray-700"
                            >
                                アンケート一覧
                            </a>
                        </>
                    ) : <></>
                }


                {
                    (props.params && props.params.sid) ? (
                        <>
                            <Breadcrumb />
                            <a
                                href={"/" + props.params.sid}
                                // aria-current={page.current ? 'page' : undefined}
                                className="ml-4 text-md font-md items-center flex text-gray-500 hover:text-gray-700"
                            >
                                アンケート
                            </a>
                        </>
                    ) : <></>
                }
            </ol>
            <div className="ml-auto mr-4 flex items-center">
                <button
                    className="flex items-center text-gray-500 hover:text-gray-700"
                    onClick={() => {
                        localStorage.removeItem('user');
                        router.push('/');
                    }}>
                    <ArrowRightStartOnRectangleIcon aria-hidden="true" className="h-5 w-5 flex-shrink-0" />
                    <span className="ml-2 text-sm font-medium">サインアウト</span>
                </button>
            </div>
        </nav >
    )
}
