import React from 'react';

const Page = () => {
    return (
        <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-md">
            <h1 className="text-3xl font-bold mb-4">プライバシーポリシー</h1>
            <p className="text-gray-700 mb-6">
                当サービス（以下「本サービス」といいます）は、お客様の個人情報を適切に保護することを重要視しています。本プライバシーポリシーは、本サービスが収集する情報の種類、その利用目的、情報の管理方法、およびお客様の権利について説明しています。
            </p>

            <h2 className="text-2xl font-semibold mb-4">1. 収集する情報</h2>
            <p className="text-gray-700 mb-4">本サービスは、以下の情報を収集する場合があります。</p>
            <ul className="list-disc list-inside text-gray-700 mb-6">
                <li className="mb-2">個人情報: ユーザー名、メールアドレス、住所、電話番号など、お客様が登録時や利用中に提供する情報。</li>
                <li className="mb-2">利用情報: 本サービスの利用状況、アクセスログ、IPアドレス、ブラウザ情報、デバイス情報などの技術的なデータ。</li>
                <li className="mb-2">支払い情報: サービスの支払い時に使用されるクレジットカード情報やその他の決済情報（決済処理は安全に処理され、クレジットカード番号は保存されません）。</li>
            </ul>

            <h2 className="text-2xl font-semibold mb-4">2. 情報の利用目的</h2>
            <p className="text-gray-700 mb-4">収集した情報は、以下の目的で利用されます。</p>
            <ul className="list-disc list-inside text-gray-700 mb-6">
                <li className="mb-2">本サービスの提供および運営</li>
                <li className="mb-2">お客様の本人確認、アカウントの管理</li>
                <li className="mb-2">サポートの提供および問い合わせ対応</li>
                <li className="mb-2">サービスの改善、新機能の開発</li>
                <li className="mb-2">マーケティングおよびプロモーションの実施（同意を得た場合）</li>
                <li className="mb-2">法的義務の遵守および紛争の解決</li>
            </ul>

            <h2 className="text-2xl font-semibold mb-4">3. クッキー（Cookie）の使用</h2>
            <p className="text-gray-700 mb-6">
                本サービスは、ユーザーの利便性を向上させるためにクッキーを使用しています。クッキーは、ウェブサイト訪問時にお客様のブラウザに保存される小さなデータファイルです。クッキーを無効にすることも可能ですが、その場合一部のサービスが正しく動作しないことがあります。
            </p>

            <h2 className="text-2xl font-semibold mb-4">4. 情報の共有および第三者提供</h2>
            <p className="text-gray-700 mb-4">
                本サービスは、お客様の個人情報を第三者に販売、貸与、共有することはありません。ただし、以下の場合には例外として情報を提供することがあります。
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-6">
                <li className="mb-2">法的義務に基づく場合</li>
                <li className="mb-2">サービス提供のために業務委託先に提供する場合</li>
                <li className="mb-2">お客様の同意を得た場合</li>
            </ul>

            <h2 className="text-2xl font-semibold mb-4">5. 情報の管理</h2>
            <p className="text-gray-700 mb-6">
                本サービスは、お客様の個人情報を適切に管理し、情報の漏洩、紛失、破壊、不正アクセスから保護するために、合理的な安全対策を講じます。また、個人情報の保存期間は、法令に従い適切に定めます。
            </p>

            <h2 className="text-2xl font-semibold mb-4">6. お客様の権利</h2>
            <p className="text-gray-700 mb-4">
                お客様は、以下の権利を有します。
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-6">
                <li className="mb-2">ご自身の個人情報へのアクセス、訂正、削除の要求</li>
                <li className="mb-2">データ処理の制限や停止の要求</li>
                <li className="mb-2">同意の撤回（同意に基づく処理に関して）</li>
            </ul>
            <p className="text-gray-700 mb-6">
                これらの要求は、本サービスサポート窓口までご連絡いただくことで行使できます。
            </p>

            <h2 className="text-2xl font-semibold mb-4">7. 改定</h2>
            <p className="text-gray-700 mb-6">
                本プライバシーポリシーは、必要に応じて改定されることがあります。改定内容は本サービス上で告知され、告知後に本サービスをご利用いただくことで、改定後のポリシーに同意いただいたものとみなされます。
            </p>
        </div>
    );
};

export default Page;
