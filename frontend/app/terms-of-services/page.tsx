import React from 'react';

const Page = () => {
    return (
        <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-md">
            <h1 className="text-3xl font-bold mb-4">利用規約</h1>
            <p className="text-gray-700 mb-6">
                本利用規約（以下「本規約」といいます）は、株式会社インターメディア（以下「当社」といいます）が提供するサービス（以下「本サービス」といいます）の利用条件を定めるものです。本サービスをご利用いただく前に、本規約をお読みいただき、同意の上ご利用ください。
            </p>

            <h2 className="text-2xl font-semibold mb-4">第1条（適用範囲）</h2>
            <p className="text-gray-700 mb-6">本規約は、本サービスを利用するすべてのユーザーに適用されます。ユーザーは、本サービスを利用することにより、本規約に同意したものとみなされます。</p>

            <h2 className="text-2xl font-semibold mb-4">第2条（利用登録）</h2>
            <ol className="list-decimal ml-6 mb-6 text-gray-700">
                <li className="mb-2">ユーザーが本サービスを利用するには、当社の定める方法により利用登録を行う必要があります。</li>
                <li className="mb-2">当社は、以下のいずれかに該当する場合、利用登録を拒否することがあります。
                    <ol className="list-decimal ml-6">
                        <li className="mb-2">登録内容に虚偽、誤記、記入漏れがあった場合</li>
                        <li className="mb-2">過去に本規約に違反したことがある場合</li>
                        <li className="mb-2">その他、当社が利用登録を不適切と判断した場合</li>
                    </ol>
                </li>
            </ol>

            <h2 className="text-2xl font-semibold mb-4">第3条（アカウント管理）</h2>
            <ol className="list-decimal ml-6 mb-6 text-gray-700">
                <li className="mb-2">ユーザーは、自らの責任においてアカウント情報（ユーザー名、パスワードなど）を適切に管理するものとします。</li>
                <li className="mb-2">アカウントの不正使用による損害について、当社は一切責任を負いません。</li>
            </ol>

            <h2 className="text-2xl font-semibold mb-4">第4条（禁止事項）</h2>
            <p className="text-gray-700 mb-6">ユーザーは、本サービスを利用するにあたり、以下の行為を行ってはなりません。</p>
            <ol className="list-decimal ml-6 mb-6 text-gray-700">
                <li className="mb-2">法令または公序良俗に違反する行為</li>
                <li className="mb-2">他のユーザーまたは第三者の権利を侵害する行為</li>
                <li className="mb-2">不正アクセス、クラッキングなどのシステムへの攻撃</li>
                <li className="mb-2">当社のサーバーまたはネットワークに過度な負担をかける行為</li>
                <li className="mb-2">本サービスの運営を妨害する行為</li>
                <li className="mb-2">その他、当社が不適切と判断する行為</li>
            </ol>

            <h2 className="text-2xl font-semibold mb-4">第5条（サービスの提供および変更）</h2>
            <ol className="list-decimal ml-6 mb-6 text-gray-700">
                <li className="mb-2">当社は、ユーザーに対して安定したサービス提供を努めますが、以下の場合にサービスの全部または一部を中断、変更、停止することがあります。
                    <ol className="list-decimal ml-6">
                        <li className="mb-2">システムメンテナンスや更新</li>
                        <li className="mb-2">火災、停電、天災などの不可抗力による場合</li>
                        <li className="mb-2">その他、当社がやむを得ないと判断した場合</li>
                    </ol>
                </li>
                <li className="mb-2">当社は、サービスの提供中断、変更、停止によって生じた損害について、一切責任を負いません。</li>
            </ol>

            <h2 className="text-2xl font-semibold mb-4">第6条（料金および支払い）</h2>
            <ol className="list-decimal ml-6 mb-6 text-gray-700">
                <li className="mb-2">本サービスの利用には、別途定める料金が発生する場合があります。</li>
                <li className="mb-2">ユーザーは、当社が指定する方法に従い、利用料金を支払うものとします。</li>
                <li className="mb-2">支払い方法の遅延または不履行が発生した場合、当社は利用停止の措置を取ることができます。</li>
            </ol>

            <h2 className="text-2xl font-semibold mb-4">第7条（契約の解除および終了）</h2>
            <ol className="list-decimal ml-6 mb-6 text-gray-700">
                <li className="mb-2">ユーザーが本規約に違反した場合、当社は事前通知なくアカウントを停止または削除することができます。</li>
                <li className="mb-2">ユーザーが任意で利用を終了する場合、当社が定める手続きに従い、アカウントの解約を行うものとします。</li>
            </ol>

            <h2 className="text-2xl font-semibold mb-4">第8条（免責事項）</h2>
            <ol className="list-decimal ml-6 mb-6 text-gray-700">
                <li className="mb-2">本サービスの利用に関して、当社はその正確性、完全性、信頼性を保証しません。</li>
                <li className="mb-2">ユーザーは、自己の責任で本サービスを利用するものとし、本サービスの利用によって生じた損害について、当社は一切責任を負いません。</li>
                <li className="mb-2">当社は、ユーザー間または第三者との間で生じた紛争について、いかなる責任も負わないものとします。</li>
            </ol>

            <h2 className="text-2xl font-semibold mb-4">第9条（知的財産権）</h2>
            <ol className="list-decimal ml-6 mb-6 text-gray-700">
                <li className="mb-2">本サービスに関する著作権、商標権、特許権などの知的財産権は、すべて当社または正当な権利を有する第三者に帰属します。</li>
                <li className="mb-2">ユーザーは、当社または第三者の知的財産権を侵害する行為を行ってはなりません。</li>
            </ol>

            <h2 className="text-2xl font-semibold mb-4">第10条（個人情報の取り扱い）</h2>
            <p className="text-gray-700 mb-6">当社は、別途定める「プライバシーポリシー」に従い、ユーザーの個人情報を適切に取り扱います。</p>

            <h2 className="text-2xl font-semibold mb-4">第11条（規約の変更）</h2>
            <p className="text-gray-700 mb-6">当社は、必要に応じて本規約を変更することがあります。変更後の規約は、本サービス上で告知した時点から効力を持ちます。ユーザーは、変更後も本サービスを利用することで、変更後の規約に同意したものとみなされます。</p>

            <h2 className="text-2xl font-semibold mb-4">第12条（準拠法および裁判管轄）</h2>
            <p className="text-gray-700 mb-6">本規約は、日本法に準拠し解釈されます。また    、本サービスに関して生じた紛争については、東京地方裁判所を第一審の専属的合意管轄裁判所とします。</p>
        </div>
    );
};

export default Page;
