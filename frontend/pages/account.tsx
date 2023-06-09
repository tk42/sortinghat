import Image from 'next/image'
import AppLayout from 'services/layouts/applayout';
import type { ReactElement } from 'react'
import type { NextPageWithLayout } from './_app'
import { ArrowRightIcon } from '@heroicons/react/20/solid'
import { Invoices } from 'components/invoices'

type ContainerProps = {}

const Page: NextPageWithLayout & React.FC<ContainerProps> = (props) => {

    return (
        <>
            <main className="py-10 lg:pl-72">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
                    <h1 className="text-2xl font-thin my-4 leading-9 tracking-tight text-blue-900">
                        アカウント
                    </h1>
                </div>
                <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
                    <h2 className="text-xl font-thin my-4 leading-9 tracking-tight text-blue-900">
                        京都府京都市 修学院小学校
                    </h2>
                    <h3 className="text-xl font-thin my-4 leading-9 tracking-tight text-blue-900">
                        奥埜 のぞみ 様
                    </h3>
                </div>
                <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 md:px-8">
                    <div className="w-full py-2 lg:w-[80%]">
                        <div className="mx-auto grid max-w-full gap-8 py-10 lg:grid-cols-50/50">
                            <div className="flex w-full justify-between rounded-sm border border-gray-200 p-4">
                                <p className="font-light text-blue-900">ご加入プラン</p>

                                <div className="flex flex-col items-end justify-between">
                                    <p className="text-4xl font-light text-blue-900">¥50,000/年</p>
                                </div>
                            </div>
                            <div className="flex w-full  justify-between rounded-sm border border-gray-200 p-4">
                                <div>
                                    <p className="font-light text-blue-900">支払方法</p>

                                    <div className="mt-2 flex">
                                        <div className="mr-4 mt-2">
                                            <Image
                                                className="min-w-[50px]"
                                                src={'/visa.png'}
                                                alt="visa"
                                                height={28.13}
                                                width={50}
                                            />
                                        </div>

                                        <div className="flex flex-col">
                                            <p className="m-0 font-light text-gray-400">
                                                Visa 末尾 1234
                                            </p>
                                            <p className="font-light text-gray-400">02/25</p>
                                            <p className="font-light text-gray-400">jdoe@cone.com</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col justify-end">
                                    <button className="flex items-center text-blue-900">
                                        変更
                                        <ArrowRightIcon className="ml-1 h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="w-full">
                            <Invoices />
                        </div>
                    </div>
                </div>
            </main>
        </>
    )
}

Page.getLayout = function getLayout(page: ReactElement) {
    return <AppLayout>{page}</AppLayout>
}

export default Page
