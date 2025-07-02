'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Class } from '@/src/lib/interfaces';
import { useToastHelpers } from '@/src/components/notifications/ToastNotifications';
import { Container as Logo } from "@/src/components/Common/Logo";
import { useDropzone } from 'react-dropzone';
import { createClassFromCSV } from '@/src/utils/actions/create_class_from_csv';
import { getCurrentTeacher } from '@/src/utils/actions/get_current_teacher';

interface StartPhaseProps {
  onClassSelect: (cls: Class) => void;
  selectedClass: Class | null;
}

const StartPhase: React.FC<StartPhaseProps> = ({
  onClassSelect,
  selectedClass
}) => {
  const [mode, setMode] = useState<'welcome' | 'create' | 'select'>('welcome');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const toastHelpers = useToastHelpers();

  // クラス一覧取得用ステート
  const [classes, setClasses] = useState<Class[]>([]);
  const [isLoadingClasses, setIsLoadingClasses] = useState(false);

  // 既存クラス選択後に呼び出す
  const handleClassSelect = (cls: Class) => {
    onClassSelect(cls);
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return
    const file = acceptedFiles[0]
    if (file.type !== 'text/csv') {
      setError('CSVファイルのみアップロード可能です')
      return
    }
    setIsUploading(true)
    setError(null)

    try {
      // 現在の教師情報を取得
      const teacher = await getCurrentTeacher()
      if (!teacher) {
        throw new Error('認証情報が見つかりません')
      }

      const formData = new FormData()
      formData.append('file', file)

      const className = file.name.replace('.csv', '')
      
      // LLM→パース→一括登録→state 更新
      const newClass = await createClassFromCSV(formData, className, teacher.id)
      onClassSelect(newClass)
      
      toastHelpers.success('クラス作成完了', `${newClass.name}が作成されました`)
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'アップロードに失敗しました'
      setError(msg)
      toastHelpers.error('アップロードエラー', msg)
    } finally {
      setIsUploading(false)
    }
  }, [onClassSelect, toastHelpers])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/csv': ['.csv'] },
    disabled: isUploading
  })

  // 初回マウント時にクラス一覧を取得
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setIsLoadingClasses(true);
        const res = await fetch('/api/chat/classes');
        const json = await res.json();
        if (json.success) {
          setClasses(json.data.classes);
        } else {
          toastHelpers.error('取得エラー', json.error || 'クラス一覧の取得に失敗しました');
        }
      } catch (error) {
        console.error('Error fetching classes:', error);
        toastHelpers.error('取得エラー', 'クラス一覧の取得に失敗しました');
      } finally {
        setIsLoadingClasses(false);
      }
    };

    fetchClasses();
  }, []); // 初回マウント時のみ実行

  const renderWelcome = () => (
    <div className="text-center py-12 px-6">
      <div className="w-200 h-200 bg-transparent flex items-center justify-center mx-auto mb-6">
        <Logo brand={true} />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        班分け最適化を始めましょう
      </h2>
      <p className="text-gray-600 mb-8 max-w-md mx-auto">
        まずはクラスを設定してください。新しいクラスを作成するか、既存のクラスを選択できます。
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
        <button
          onClick={() => setMode('create')}
          className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center"
        >
          <svg className="w-8 h-5 " fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          クラスを新規作成
        </button>
        <button
          onClick={() => setMode('select')}
          className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center"
        >
          <svg className="w-8 h-5 " fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          既存のクラスを選択
        </button>
      </div>
    </div>
  );

  const renderCreateClass = () => (
    <div className="px-6 py-8">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">新しいクラスを作成</h2>
        <p className="text-gray-600">
          クラス名簿のCSVファイルをアップロードしてください。
        </p>
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragActive
              ? 'border-blue-400 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <input {...getInputProps()} />
          {isUploading ? (
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
              <p className="text-gray-600">ファイルを処理中...(十数秒かかります)</p>
            </div>
          ) : (
            <>
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-lg font-medium text-gray-900 mb-2">
                CSVファイルをドラッグ&ドロップ、またはクリックしてアップロード
              </p>
              <p className="text-gray-500 mb-4">
                CSVファイルからクラスと生徒情報を一括作成します
              </p>
            </>
          )}
        </div>

        {error && <p className="text-red-500 mt-4">{error}</p>}

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-2">CSVファイル形式</h3>
          <p className="text-sm text-gray-600 mb-2">
            以下の列を含むCSVファイルをアップロードしてください：
          </p>
          <ul className="text-sm text-gray-600 list-disc list-inside">
            <li>番号</li>
            <li>名前</li>
            <li>性別</li>
          </ul>
          <a
            href="/sample/class.csv"
            download
            className="text-sm text-blue-600 hover:text-blue-800 underline mt-2 inline-block"
          >
            サンプルCSVをダウンロード
          </a>
        </div>
      </div>
    </div>
  );

  const renderSelectClass = () => (
    <div className="px-6 py-8">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">既存のクラスを選択</h2>
        <p className="text-gray-600">
          以前に作成したクラスから選択してください。
        </p>
        <div className="space-y-4">
          {isLoadingClasses && (
            <div className="text-center text-gray-500 py-8">読み込み中...</div>
          )}

          {!isLoadingClasses && classes.length === 0 && (
            <div className="text-center py-8 text-gray-500">クラスが見つかりません</div>
          )}

          {!isLoadingClasses &&
            classes.map((cls) => (
              <div
                key={cls.id}
                className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                onClick={() => handleClassSelect(cls)}
              >
                <h3 className="font-medium text-gray-900">{cls.name}</h3>
                <p className="text-sm text-gray-500">作成日: {cls.created_at.slice(0, 10)}</p>
              </div>
            ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-0 flex flex-col">
      {mode === 'welcome' && renderWelcome()}
      {mode === 'create' && renderCreateClass()}
      {mode === 'select' && renderSelectClass()}
      
    </div>
  );
};

export default StartPhase;