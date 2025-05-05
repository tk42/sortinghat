interface DashboardClientProps {
}

export default function DashboardClient(props: DashboardClientProps) {
    return (
        <div className="prose mx-auto py-10">
            <video controls className="w-full max-w-3xl mx-auto mb-8 rounded-lg shadow-lg">
                <source src="/demo.mp4" type="video/mp4" />
                お使いのブラウザは動画タグに対応していません。
            </video>
            <h1 className="text-2xl font-bold">使い方</h1>
            <ol className="list-decimal list-inside space-y-4">
                <li className="bg-white p-4 rounded-lg shadow hover:shadow-md transition">
                    新しいクラスを作成する: 「担任クラス」ページで，新規クラスを作成します。
                </li>
                <li className="bg-white p-4 rounded-lg shadow hover:shadow-md transition">
                    クラスメンバーを追加する: クラス詳細ペインで児童生徒を追加します。
                </li>
                <li className="bg-white p-4 rounded-lg shadow hover:shadow-md transition">
                    アンケート結果を追加する: 「アンケート」ページで，アンケート結果のCSVをアップロードします。
                </li>
                <li className="bg-white p-4 rounded-lg shadow hover:shadow-md transition">
                    マッチングを実行する: アンケートをアップロードしたら，右上の「マッチング条件設定」ボタンをクリックし，「マッチング」を押します。
                </li>
                <li className="bg-white p-4 rounded-lg shadow hover:shadow-md transition">
                    結果を確認する: マッチ結果は「マッチング」ページから確認できます。
                </li>
            </ol>
        </div>
    )
}