"use client"

import React, { useState, useEffect } from 'react'
// import { TeacherContext } from '@/src/lib/context';
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
// import { Claims, getSession } from '@auth0/nextjs-auth0';
import { Container as SelectSchool } from '@/src/components/Common/SchoolList'
import { Teacher } from '@/src/lib/interfaces';

// (2) Types Layer
export type ContainerProps = {
    user: any // Claims
}
type Props = {
    open: boolean
    setOpen: React.Dispatch<React.SetStateAction<boolean>>
    family_name: string
    setFamilyName: React.Dispatch<React.SetStateAction<string>>
    given_name: string
    setGivenName: React.Dispatch<React.SetStateAction<string>>
    school_id: number
    setSchoolId: React.Dispatch<React.SetStateAction<number>>
} & ContainerProps

// (3) Define Global Constants


// (4) DOM Layer
const Component: React.FC<Props> = (props) => (
    <>
        <Dialog className="relative z-10" open={props.open} onClose={() => { }}>
            <DialogBackdrop
                transition
                className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
            />

            <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                    <DialogPanel
                        transition
                        className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-sm sm:p-6 data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
                    >
                        <div>
                            <div className="mt-3 text-center sm:mt-5">
                                <DialogTitle as="h3" className="text-base font-semibold leading-6 text-gray-900">
                                    新規ユーザー追加
                                </DialogTitle>
                                <p className='text-sm text-gray-500'>ご利用ありがとうございます！<br />始める前にあなたの情報を教えて下さい！</p>
                                <div className="mt-3 text-center sm:mt-5">
                                    <span className='text-sm text-gray-500'>Email: {props.user.email}</span>
                                    <div className="flex">
                                        <label htmlFor="family_name" className="block text-sm mx-2 font-medium leading-6 text-gray-500 flex items-center">
                                            氏
                                        </label>
                                        <div className="relative mt-2 rounded-md shadow-sm mr-2">
                                            <input
                                                type="text"
                                                name="氏"
                                                id="family_name"
                                                className="block w-full rounded-md border-0 py-1.5 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-300 focus:ring-2 focus:ring-inset focus:ring-gray-500 sm:text-sm sm:leading-6"
                                                defaultValue={props.family_name}
                                                value={props.family_name}
                                                onChange={(e) => { props.setFamilyName(e.target.value) }}
                                            />
                                        </div>
                                        <label htmlFor="given_name" className="block text-sm mx-2 font-medium leading-6 text-gray-500 flex items-center">
                                            名
                                        </label>
                                        <div className="relative mt-2 rounded-md shadow-sm">
                                            <input
                                                type="text"
                                                name="名"
                                                id="given_name"
                                                className="block w-full rounded-md border-0 py-1.5 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-300 focus:ring-2 focus:ring-inset focus:ring-gray-500 sm:text-sm sm:leading-6"
                                                defaultValue={props.given_name}
                                                value={props.given_name}
                                                onChange={(e) => { props.setGivenName(e.target.value) }}
                                            />
                                        </div>
                                    </div>
                                    <SelectSchool {...{
                                        setSchoolId: props.setSchoolId
                                    }} />
                                </div>
                            </div>
                        </div>
                        <div className="mt-5 sm:mt-6">
                            <button
                                type="button"
                                className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:bg-gray-400"
                                onClick={() => {
                                    addTeacher(props.user.email, props.family_name, props.given_name, props.school_id)
                                    props.setOpen(false)
                                }}
                                disabled={props.school_id == 0}
                            >
                                追加
                            </button>
                        </div>
                    </DialogPanel>
                </div>
            </div >
        </Dialog >
    </>
)

// (5) Container Layer
export function Container(props: ContainerProps) {
    const [open, setOpen] = useState(true)
    const [family_name, setFamilyName] = useState(props.user.family_name);
    const [given_name, setGivenName] = useState(props.user.given_name);
    const [school_id, setSchoolId] = useState(0);

    // useEffect(() => {
    //     const teacher: Teacher = getTeacher(props.user.email)
    //     document.cookie = `token=${teacher}; path=/`;
    //     setOpen(false)
    //     return <></>
    // }, [])


    return <Component {...{
        ...props,
        open: open,
        setOpen: setOpen,
        family_name: family_name,
        setFamilyName: setFamilyName,
        given_name: given_name,
        setGivenName: setGivenName,
        school_id: school_id,
        setSchoolId: setSchoolId
    }} />
}

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
}


export async function addTeacher(email: string, family_name: string, given_name: string, school_id: number): Promise<Teacher | null> {
    const data: Teacher | null = await fetch("/api/teacher", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            email: email,
            family_name: family_name,
            given_name: given_name,
            school_id: school_id,
        }),
    }).then((data: any) => {
        if (data.teachers.length == 0) {
            return null
        }
        return (data.teachers as Teacher[])[0]
    }).catch((error) => {
        console.error(error);
        return {} as Teacher;
    });
    return data;
};

