import AppLayout from 'services/components/layouts/applayout';
import type { ReactElement } from 'react'
import type { NextPageWithLayout } from './_app'
import dynamic from 'next/dynamic';
const Table = dynamic(
    () => import('components/handsontable').then(mod => mod.Table),
    { ssr: false }  // This line is important. It disables server-side rendering for this component.
);

type ContainerProps = {}

const Page: NextPageWithLayout & React.FC<ContainerProps> = (props) => {
    return (
        <>
            <main className="lg:pl-72">
                <div className="xl:pl-96">
                    <div className="px-4 py-10 sm:px-6 lg:px-8 lg:py-6">
                        <p className="text-2xl font-thin leading-9 tracking-tight text-blue-900">
                            スコア入力
                        </p>
                        <span className="text-base font-light my-4 leading-9 tracking-tight text-blue-900">生徒たちに実施したアンケート結果を記入してください</span>
                        <Table />
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
