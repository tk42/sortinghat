import AppLayout from 'components/layouts/applayout';
import type { ReactElement } from 'react'
import type { NextPageWithLayout } from './_app'

type ContainerProps = {}

const Page: NextPageWithLayout & React.FC<ContainerProps> = (props) => {
    return (
        <>
            <main className="py-10 lg:pl-72">
                <div className="px-4 sm:px-6 lg:px-8">
                    <span className="text-2xl font-thin my-4 leading-9 tracking-tight text-blue-900">
                        ようこそ！
                    </span>
                    <h2 className="text-xl font-thin my-4 leading-9 tracking-tight text-blue-900">
                        京都府京都市 修学院小学校
                    </h2>
                    <h2 className="text-xl font-thin my-4 leading-9 tracking-tight text-blue-900">
                        4年1組 奥埜 のぞみ 様
                    </h2>
                    <h3 className='text-xl font-thin my-4 leading-9 tracking-tight text-blue-900'>
                        MI理論に基づくアンケートの実施方法
                    </h3>
                </div>
            </main>
        </>
    )
}

Page.getLayout = function getLayout(page: ReactElement) {
    return <AppLayout>{page}</AppLayout>
}

export default Page
