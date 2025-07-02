import { useCallback } from 'react'
import { useChatContext } from '@/src/contexts/ChatContext'
import { useToastHelpers } from '@/src/components/notifications/ToastNotifications'

export function useFileProcessing() {
  const { sendMessage, uploadFile } = useChatContext()
  const toastHelpers = useToastHelpers()

  const handleFileUpload = useCallback(async (file: File) => {
    try {
      await uploadFile(file, 'csv_import')
      toastHelpers.info('ファイルアップロード開始', `「${file.name}」の処理を開始しました`)
    } catch (error) {
      console.error('File upload error:', error)
      toastHelpers.error('アップロードエラー', 'ファイルのアップロードに失敗しました')
    }
  }, [uploadFile, toastHelpers])

  const handleConversionConfirm = useCallback(async (jobId: number) => {
    try {
      const response = await fetch('/api/chat/file-conversion/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job_id: jobId })
      })
      
      if (response.ok) {
        await sendMessage('ファイル変換を承認しました。次のステップに進んでください。')
        toastHelpers.success('変換承認', 'ファイル変換が承認されました')
      } else {
        throw new Error('Conversion confirmation failed')
      }
    } catch (error) {
      console.error('Error confirming conversion:', error)
      toastHelpers.error('エラー', '変換の承認に失敗しました')
    }
  }, [sendMessage, toastHelpers])

  const handleConversionReject = useCallback(async (jobId: number) => {
    try {
      const response = await fetch('/api/chat/file-conversion/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job_id: jobId })
      })
      
      if (response.ok) {
        await sendMessage('ファイル変換をやり直します。再度ファイルをアップロードしてください。')
        toastHelpers.warning('変換やり直し', '新しいファイルをアップロードしてください')
      } else {
        throw new Error('Conversion rejection failed')
      }
    } catch (error) {
      console.error('Error rejecting conversion:', error)
      toastHelpers.error('エラー', '変換の拒否に失敗しました')
    }
  }, [sendMessage, toastHelpers])

  const handleConversionModify = useCallback(async (jobId: number, modifications: any) => {
    try {
      const response = await fetch('/api/chat/file-conversion/modify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job_id: jobId, modifications })
      })
      
      if (response.ok) {
        await sendMessage('ファイル変換に修正を適用しました。')
        toastHelpers.success('修正適用', 'ファイルの修正が適用されました')
      } else {
        throw new Error('Conversion modification failed')
      }
    } catch (error) {
      console.error('Error modifying conversion:', error)
      toastHelpers.error('エラー', '修正の適用に失敗しました')
    }
  }, [sendMessage, toastHelpers])

  return {
    handleFileUpload,
    handleConversionConfirm,
    handleConversionReject,
    handleConversionModify,
  }
}