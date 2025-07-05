'use client';

import React, { useState, useCallback, useEffect, MutableRefObject, Dispatch, SetStateAction } from 'react';
import { Class, Survey } from '@/src/lib/types';
import { useToastHelpers } from '@/src/components/notifications/ToastNotifications';
import { useDropzone } from 'react-dropzone';
import { createSurveyFromCSV } from '@/src/utils/actions/create_survey_from_csv';
import { useAuthContext } from '@/src/utils/firebase/authprovider';
import type { BackHandler } from '../ChatWindow';

interface SurveyCreationPhaseProps {
  selectedClass: Class | null;
  onSurveySelect: (survey: Survey) => void;
  selectedSurvey: Survey | null;
  internalBackRef: MutableRefObject<BackHandler | undefined>;
  setInternalBackActive: Dispatch<SetStateAction<boolean>>;
}

const SurveyCreationPhase: React.FC<SurveyCreationPhaseProps> = ({
  selectedClass,
  onSurveySelect,
  selectedSurvey,
  internalBackRef,
  setInternalBackActive
}) => {
  const [mode, setMode] = useState<'welcome' | 'create' | 'select'>('welcome');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [isLoadingSurveys, setIsLoadingSurveys] = useState(false);
  const toastHelpers = useToastHelpers();
  const { state: authState } = useAuthContext();

  // keep parent informed about back button necessity
  useEffect(() => {
    setInternalBackActive(mode !== 'welcome')
  }, [mode, setInternalBackActive])

  // Register internal back handler to reset mode
  useEffect(() => {
    if (!internalBackRef) return;

    if (mode !== 'welcome') {
      internalBackRef.current = () => {
        setMode('welcome');
        return true;
      };
    } else {
      internalBackRef.current = undefined;
    }

    return () => {
      if (internalBackRef) internalBackRef.current = undefined;
      setInternalBackActive(false)
    };
  }, [mode, internalBackRef, setInternalBackActive]);

  // selectモードに切り替わった時にアンケートを読み込む
  useEffect(() => {
    if (mode === 'select' && selectedClass) {
      const loadSurveys = async () => {
        setIsLoadingSurveys(true);
        setError(null);
        try {
          const response = await fetch(`/api/chat/classes/${selectedClass.id}/surveys`);
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const result = await response.json();
          
          if (result.success && result.data?.surveys) {
            // Survey オブジェクトの元のclass情報を保持する
            const surveysWithClass = result.data.surveys.map((survey: any) => ({
              ...survey,
              // API から取得した本来の class 情報がある場合はそれを使用、
              // ない場合は selectedClass をフォールバックとして使用
              class: survey.class || selectedClass,
              class_id: survey.class?.id || selectedClass.id
            }));
            setSurveys(surveysWithClass);
          } else {
            setSurveys([]);
            const errorMsg = result.error || 'アンケートの取得に失敗しました';
            setError(errorMsg);
            toastHelpers.warning('読み込み結果', errorMsg);
          }
        } catch (error) {
          console.error('Error loading surveys:', error);
          setSurveys([]);
          const errorMsg = error instanceof Error ? error.message : 'アンケートの読み込みに失敗しました';
          setError(errorMsg);
          toastHelpers.error('読み込みエラー', errorMsg);
        } finally {
          setIsLoadingSurveys(false);
        }
      };

      loadSurveys();
    }
  // Only refetch when mode or selectedClass.id changes; exclude toastHelpers to prevent infinite loops
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, selectedClass?.id]);

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
      if (!selectedClass) {
        throw new Error('クラスが選択されていません')
      }

      const formData = new FormData()
      formData.append('file', file)

      const surveyName = file.name.replace('.csv', '')
      
      // LLM→パース→一括登録→state 更新
      const newSurvey = await createSurveyFromCSV(formData, surveyName, selectedClass.id)
      
      // Survey オブジェクトにクラス情報を追加
      const surveyWithClass: any = {
        ...newSurvey,
        class: selectedClass
      }
      
      onSurveySelect(surveyWithClass)
      
      // 新しく作成されたアンケートをリストに追加
      setSurveys(prevSurveys => [surveyWithClass, ...prevSurveys])
      
      toastHelpers.success('アンケート作成完了', `${newSurvey.name}が作成されました`)
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'アップロードに失敗しました'
      setError(msg)
      toastHelpers.error('アップロードエラー', msg)
    } finally {
      setIsUploading(false)
    }
  }, [onSurveySelect, toastHelpers, selectedClass])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/csv': ['.csv'] },
    disabled: isUploading
  })

  if (!selectedClass) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">クラスが選択されていません</p>
      </div>
    );
  }

  const renderWelcome = () => (
    <div className="text-center py-12 px-6">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        アンケート作成
      </h2>
      <p className="text-gray-600 mb-8 max-w-md mx-auto">
        班分けに使用するアンケートデータを設定してください。新しいアンケートを作成するか、既存のアンケートを選択できます。
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
        <button
          onClick={() => setMode('create')}
          className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          新しいアンケートを作成
        </button>
        <button
          onClick={() => setMode('select')}
          className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          既存のアンケートを選択
        </button>
      </div>
    </div>
  );

  const renderCreateSurvey = () => (
    <div className="px-6 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">新しいアンケートを作成</h2>
          <p className="text-gray-600">
            アンケート結果のCSVファイルをアップロードしてください。
          </p>
        </div>

        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragActive
              ? 'border-green-400 bg-green-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <input {...getInputProps()} />
          {isUploading ? (
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mb-4"></div>
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
                アンケート結果CSVファイルからアンケートと選好データを一括作成します
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
          <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
            <li>出席番号</li>
            <li>前回の班番号</li>
            <li>多重知能スコア（0-8）</li>
            <li>リーダー希望（リーダー希望, サブリーダー希望, お任せ）</li>
            <li>視力（要配慮, 前方希望, お任せ）</li>
            <li>苦手な生徒の出席番号（カンマ区切り）</li>
          </ul>
          <a
            href="/sample/survey.csv"
            download
            className="text-sm text-blue-600 hover:text-blue-800 underline mt-2 inline-block"
          >
            サンプルCSVをダウンロード
          </a>
        </div>
      </div>
    </div>
  );

  const renderSelectSurvey = () => (
    <div className="px-6 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">既存のアンケートを選択</h2>
          <p className="text-gray-600">
            以前に作成したアンケートから選択してください。
          </p>
        </div>

        <div className="space-y-4">
          {isLoadingSurveys ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-4"></div>
              <p className="text-gray-600">アンケートを読み込み中...</p>
            </div>
          ) : surveys.length > 0 ? (
            surveys.map((survey) => (
              <div
                key={survey.id}
                onClick={() => onSurveySelect(survey)}
                className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                  selectedSurvey?.id === survey.id
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <h3 className="font-medium text-gray-900">{survey.name}</h3>
                <p className="text-sm text-gray-500">作成日: {new Date(survey.created_at || '').toLocaleDateString('ja-JP')}</p>
                <p className="text-sm text-gray-500">ステータス: {survey.status === 1 ? 'アクティブ' : '非アクティブ'}</p>
                {(survey as any).student_preferences_aggregate?.aggregate?.count !== undefined && (
                  <p className="text-sm text-gray-500">
                    回答数: {(survey as any).student_preferences_aggregate.aggregate.count}件
                  </p>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              {error ? (
                <div className="text-red-600">
                  <p className="font-medium">エラー</p>
                  <p className="text-sm mt-1">{error}</p>
                  <button
                    onClick={() => setMode('select')}
                    className="text-green-500 hover:text-green-600 mt-4 text-sm"
                  >
                    再試行
                  </button>
                </div>
              ) : (
                <div className="text-gray-500">
                  <p>このクラスにはまだアンケートがありません</p>
                  <button
                    onClick={() => setMode('create')}
                    className="text-green-500 hover:text-green-600 mt-2"
                  >
                    新しいアンケートを作成
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 選択されたアンケートの確認 */}
        {selectedSurvey && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="font-medium text-green-800 mb-2">選択されたアンケート</h3>
            <p className="text-green-700">
              <strong>{selectedSurvey.name}</strong> が選択されました。
              「次へ」ボタンを押してアンケート設定に進んでください。
            </p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-0 flex flex-col">
      {mode === 'welcome' && renderWelcome()}
      {mode === 'create' && renderCreateSurvey()}
      {mode === 'select' && renderSelectSurvey()}
      
    </div>
  );
};

export default SurveyCreationPhase;