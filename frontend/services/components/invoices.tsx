export type InvoiceItem = {
    id: string,
    date: string,
    status: string,
    amount: number
}

function Invoice(props: InvoiceItem) {
    return (
        <div className="flex items-center justify-between border-b border-gray-200 py-2">
            <div>
                <p className="font-bold text-blue-900">{props.id}</p>
                <p className="text-sm font-light text-blue-400">{props.date}</p>
            </div>

            <span className="font-light text-blue-900">
                {props.status}
            </span>

            <p className="font-light text-blue-900">¥{props.amount}</p>

            <div className="mr-10">
                <a
                    href="#"
                    className="appearance-none text-sm font-light text-blue-400"
                >
                    ダウンロード
                </a>
            </div>
        </div>
    )
}

const invoices: InvoiceItem[] = [
    {
        id: '001',
        date: `2021/04`,
        status: '支払済',
        amount: 50000,
    },
    {
        id: '002',
        date: `2022/04`,
        status: '支払済',
        amount: 50000,
    },
    {
        id: '003',
        date: `2023/04`,
        status: '支払済',
        amount: 50000,
    },
]

export function Invoices() {
    return (
        <>
            <div className="border-b border-gray-200 py-2">
                <p className="font-light text-blue-900">過去のご請求</p>
            </div>

            {
                invoices.map((invoice) => (
                    <Invoice key={invoice.id} {...invoice} />
                ))
            }
        </>
    )
}
