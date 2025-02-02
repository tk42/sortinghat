import { Container as CookieConsent } from '@/src/components/Common/CookieConsent'

export function Container() {
    return (
        <footer className="bg-white text-black py-6">
            <div className="container mx-auto flex flex-row justify-between items-center space-x-4">
                <div>
                    <h3 className="text-lg font-semibold">株式会社インターメディア</h3>
                    <p className="text-sm">© 2025 Intermedia. All Rights Reserved.</p>
                </div>
                <div className="flex flex-row space-x-8">
                    <a href="https://intermedia.ltd/" className="text-sm hover:text-gray-400">企業について</a>
                    <a href="mailto:kojima-tadashi@intermedia.ltd" className="text-sm hover:text-gray-400">連絡先</a>
                    <a href='https://docs.google.com/forms/d/e/1FAIpQLSclgPJKx1s7Dvu2E-kMWmCcBAj8QGY0e2TRhI8EuKLjThICbQ/viewform' className="text-sm hover:text-gray-400">アンケート</a>
                    <a href="/privacy-policy" className="text-sm hover:text-gray-400">プライバシーポリシー</a>
                    <a href="/terms-of-services" className="text-sm hover:text-gray-400">利用規約</a>
                    <a href="/specified-commercial-transaction-act" className="text-sm hover:text-gray-400">特定商取引法に基づく表記</a>
                </div>
            </div>
            <CookieConsent />
        </footer>

    )
}
