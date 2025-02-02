"use client"

import { useEffect, useState } from 'react';
import { School } from '@/src/lib/interfaces';
import { Container as Loading } from '@/src/components/Common/Loading'

// (2) Types Layer
export type ContainerProps = {
    setSchoolId: React.Dispatch<React.SetStateAction<number>>
}
type Props = {
    schools: School[]
} & ContainerProps


// TODO: https://www.edu.city.kyoto.jp/hp/

// (4) DOM Layer
const Component: React.FC<Props> = (props) => (
    <div>
        <label htmlFor="school" className="block text-sm font-medium leading-6 text-gray-600">
            学校を選択してください
        </label>
        <select
            id="school"
            name="school"
            className="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
            onChange={(e) => {
                if (e.target.selectedIndex > 0) {
                    const selectSchool: School | undefined = props.schools[e.target.selectedIndex - 1]
                    // console.log(selectSchool.name)
                    props.setSchoolId(selectSchool.id)
                } else {
                    props.setSchoolId(0)
                }
            }}
        >
            <option key="school-empty"> </option>
            {
                props.schools.map((school: School, index: number) => {
                    return <option key={"school-" + school.id}>{school.name} - {school.prefecture}</option>
                })
            }
        </select>
    </div >
)

export function Container(props: ContainerProps) {
    const [schools, setSchool] = useState<School[]>([]);

    useEffect(() => {
        async function fetchData() {
            setSchool(await listSchool());
        }
        fetchData();
    }, [])

    return (schools.length === 0) ? <Loading /> : <Component {...{ ...props, schools: schools }} />
}

async function listSchool(): Promise<School[]> {
    const data: School[] = await fetch("/api/school", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
        }),
    }).then((res) => {
        return res.json();
    }).then((json) => {
        return json as School[];
    }).catch((error) => {
        console.error(error);
        return {} as School[];
    });
    // console.log(data)
    return data;
}
