import { XMarkIcon } from '@heroicons/react/24/outline'

export interface MatchingListProps {
    isOpen: boolean
    onClose: () => void
}

export default function MatchingList({ 
    isOpen,
    onClose
}: MatchingListProps) {
    return (
        <div className="h-full overflow-y-auto">
            <div className="p-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">マッチング一覧</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>
                <div className="space-y-4">
                    {/* マッチングリストの内容をここに実装 */}
                </div>
            </div>
        </div>
    )
}