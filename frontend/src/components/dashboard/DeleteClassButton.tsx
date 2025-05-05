'use client'

import { useState } from 'react'
import { Container as Loading } from '@/src/components/Common/Loading'
import { deleteClass } from '@/src/utils/actions/delete_class'

interface Props {
  classId: string
  onSuccess?: () => void
  children?: React.ReactNode
}

export default function DeleteClassButton({ classId, onSuccess, children }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleDelete = async () => {
    try {
      setIsLoading(true)
      await deleteClass(classId)
      setIsOpen(false)
      onSuccess?.()
    } catch (error) {
      console.error('Error deleting class:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <div onClick={() => setIsOpen(true)}>
        {children}
      </div>

      {isOpen && (
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center"
          onClick={() => setIsOpen(false)}
        >
          <div 
            className="bg-white p-6 rounded-lg text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-medium mb-4">クラスを削除</h3>
            {isLoading ? (
              <Loading />
            ) : (
              <>
                <p className="mb-4">このクラスを削除してもよろしいですか？<br />
                このクラスを削除すると、以下のデータも削除されます。</p>
                <ul className="mb-4 list-disc list-inside">
                  <li>児童生徒</li>
                  <li>アンケート</li>
                  <li>マッチング結果</li>
                </ul>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setIsOpen(false)}
                    className="rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                  >
                    キャンセル
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={isLoading}
                    className="rounded-md bg-red-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 disabled:opacity-50"
                  >
                    {isLoading ? '削除中...' : '削除'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}