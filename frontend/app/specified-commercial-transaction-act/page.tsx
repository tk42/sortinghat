import React from 'react';

const Page = () => {
    return (
        <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-md">
            <h1 className="text-3xl font-bold mb-6">特定商取引法に基づく表記</h1>

            <div className="mb-6">
                <h2 className="text-2xl font-semibold mb-2">販売業者名称</h2>
                <p className="text-gray-700">株式会社インターメディア</p>
            </div>

            <div className="mb-6">
                <h2 className="text-2xl font-semibold mb-2">所在地</h2>
                <p className="text-gray-700">東京都港区北青山1-3-1 アールキューブ3F</p>
            </div>

            {/* <div className="mb-6">
                <h2 className="text-2xl font-semibold mb-2">電話番号</h2>
                <p className="text-gray-700">070-8308-8185 （受付時間 10:00-18:00、土日祝を除く）</p>
            </div> */}

            <div className="mb-6">
                <h2 className="text-2xl font-semibold mb-2">メールアドレス</h2>
                <p className="text-gray-700">kojima-tadashi@intermedia.ltd</p>
            </div>

            <div className="mb-6">
                <h2 className="text-2xl font-semibold mb-2">代表者</h2>
                <p className="text-gray-700">小嶋忠詞</p>
            </div>

            <div className="mb-6">
                <h2 className="text-2xl font-semibold mb-2">決済手段</h2>
                <p className="text-gray-700">クレジットカード、コンビニ決済、銀行振込</p>
            </div>

            <div className="mb-6">
                <h2 className="text-2xl font-semibold mb-4">交換及び返品（返金ポリシー）</h2>
                <p className="text-gray-700 mb-4">
                    本サービスは自動更新型の月額課金サービスであり、利用者がサービスをキャンセルするまで毎月自動的に料金が請求されます。返金は以下の条件において行われるものとします。
                </p>
                <ul className="list-disc list-inside text-gray-700 mb-6">
                    <li className="mb-2">当社による技術的な問題や障害が原因で、サービスが全く利用できない状態が発生した場合</li>
                    <li className="mb-2">誤って重複課金が行われた場合</li>
                </ul>

                <h3 className="text-xl font-semibold mb-2">返金が適用されないケース</h3>
                <p className="text-gray-700 mb-4">以下の場合には返金の対象外となります。</p>
                <ul className="list-disc list-inside text-gray-700 mb-6">
                    <li className="mb-2">ユーザーの都合により途中解約された場合</li>
                    <li className="mb-2">サービスが正常に提供されているにもかかわらず、満足しなかった場合</li>
                    <li className="mb-2">支払い済みの利用料金について、途中解約による日割り計算での返金は行いません</li>
                    <li className="mb-2">無償期間中やトライアル中に発生した料金</li>
                </ul>
            </div>
        </div>
    );
};

export default Page;
