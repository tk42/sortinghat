"use client"

import { MatchingResult, Class } from '@/src/lib/interfaces'
import { TrashIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { toast } from 'react-hot-toast';

export interface MatchingListProps {
    matchingResults?: MatchingResult[]
    classes?: Class[]
    onCreateMatching?: (formData: FormData) => Promise<any>
    selectedMatching?: MatchingResult | null
    onSelectMatching?: (matching: MatchingResult) => void
    onDeleteMatching?: (matchingId: string) => Promise<void>
    isOpen: boolean
    onClose: () => void
}

export default function MatchingList({ 
    matchingResults = [], 
    selectedMatching = null, 
    onSelectMatching = () => {}, 
    onDeleteMatching = async () => {},
    isOpen,
    onClose
}: MatchingListProps) {
    const handleDeleteMatching = async (matchingId: number) => {
        try {
          await onDeleteMatching(matchingId.toString())
          toast.success('マッチング結果を削除しました')
        } catch (error) {
          console.error('Failed to delete matching:', error)
          toast.error('マッチング結果の削除に失敗しました')
        }
      }

    return (
        <>
            {/* Overlay */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-gray-600 bg-opacity-50 transition-opacity z-20"
                    onClick={onClose}
                />
            )}
            
            {/* Drawer */}
            <div className={`fixed inset-y-0 left-0 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} w-96 bg-white shadow-xl transition-transform duration-300 ease-in-out z-30`}>
                <div className="h-full overflow-y-auto">
                    <div className="p-4">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">マッチング結果一覧</h2>
                            <button
                                onClick={onClose}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            {/* Matching Results List */}
                            <div className="space-y-2">
                                {matchingResults.map((matching) => (
                                    <div
                                        key={matching.id}
                                        className={`p-4 rounded-lg border ${
                                            selectedMatching?.id === matching.id
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-gray-200'
                                        } hover:border-blue-500 cursor-pointer relative group`}
                                        onClick={() => onSelectMatching(matching)}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <h3 className="font-medium">
                                                    {matching.survey?.class?.name || '不明なクラス'}
                                                </h3>
                                                <p className="text-sm text-gray-600">
                                                    {matching.survey?.name || '不明なアンケート'}
                                                </p>
                                                <div className="mt-1 flex items-center space-x-2">
                                                    <span className="text-gray-300">•</span>
                                                    <p className="text-xs text-gray-400">
                                                        {new Date(matching.created_at).toLocaleDateString('ja-JP', {
                                                                                year: 'numeric',
                                                                                month: '2-digit',
                                                                                day: '2-digit'
                                                                            })}
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    handleDeleteMatching(matching.id)
                                                }}
                                                className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700"
                                            >
                                                <TrashIcon className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}