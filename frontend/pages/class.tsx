import AppLayout from 'components/layouts/applayout';
import { Grid } from 'components/grid'
import type { ReactElement } from 'react'
import type { NextPageWithLayout } from './_app'

type ContainerProps = {}

const Page: NextPageWithLayout & React.FC<ContainerProps> = (props) => {
    return (
        <>
            <main className="lg:pl-72">
                <div className="xl:pl-96">
                    <div className="px-4 py-10 sm:px-6 lg:px-8 lg:py-6">
                        <span className="text-2xl font-thin my-4 leading-9 tracking-tight text-blue-900">生徒一覧</span>
                        <Grid />
                    </div>
                </div>
            </main>

            <aside className="fixed inset-y-0 left-72 hidden w-96 overflow-y-auto border-r border-gray-200 px-4 py-6 sm:px-6 lg:px-8 xl:block">
                <span className="text-2xl font-thin my-4 leading-9 tracking-tight text-blue-900">クラス一覧</span>
            </aside>
        </>
    )
}

Page.getLayout = function getLayout(page: ReactElement) {
    return <AppLayout>{page}</AppLayout>
}

export default Page
