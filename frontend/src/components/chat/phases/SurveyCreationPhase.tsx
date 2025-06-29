'use client';

import React, { useState, useCallback } from 'react';
import { Class, Survey } from '@/src/lib/interfaces';
import { useToastHelpers } from '@/src/components/notifications/ToastNotifications';

interface SurveyCreationPhaseProps {
  selectedClass: Class | null;
  onSurveySelect: (survey: Survey) => void;
  onNext: () => void;
  selectedSurvey: Survey | null;
}

const SurveyCreationPhase: React.FC<SurveyCreationPhaseProps> = ({
  selectedClass,
  onSurveySelect,
  onNext,
  selectedSurvey
}) => {
  const [mode, setMode] = useState<'welcome' | 'create' | 'select'>('welcome');
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const toastHelpers = useToastHelpers();

  const handleFileUpload = useCallback(async (file: File) => {
    if (!file.name.endsWith('.csv')) {
      toastHelpers.error('ファイル形式エラー', 'CSVファイルを選択してください');
      return;
    }

    setIsUploading(true);
    try {
      // TODO: Implement actual CSV upload and survey creation
      const newSurvey: Survey = {
        id: Date.now(),
        name: file.name.replace('.csv', ''),
        status: 1,
        class: selectedClass!,
        class_id: selectedClass!.id,
        created_at: new Date().toISOString(),
      };
      
      onSurveySelect(newSurvey);
      toastHelpers.success('アンケート作成完了', `${newSurvey.name}が作成されました`);
    } catch (error) {
      console.error('Error uploading file:', error);
      toastHelpers.error('アップロードエラー', 'ファイルの処理に失敗しました');
    } finally {
      setIsUploading(false);
    }
  }, [onSurveySelect, selectedClass, toastHelpers]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileUpload(files[0]);
    }
  }, [handleFileUpload]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  }, [handleFileUpload]);

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
          <button
            onClick={() => setMode('welcome')}
            className="flex items-center text-gray-500 hover:text-gray-700 mb-4"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            戻る
          </button>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">新しいアンケートを作成</h2>
          <p className="text-gray-600">
            アンケート結果のCSVファイルをアップロードしてください。
          </p>
        </div>

        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive
              ? 'border-green-400 bg-green-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          {isUploading ? (
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mb-4"></div>
              <p className="text-gray-600">ファイルを処理中...</p>
            </div>
          ) : (
            <>
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-lg font-medium text-gray-900 mb-2">
                CSVファイルをドラッグ&ドロップ
              </p>
              <p className="text-gray-500 mb-4">
                または下のボタンからファイルを選択
              </p>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileInputChange}
                className="hidden"
                id="survey-file-upload"
              />
              <label
                htmlFor="survey-file-upload"
                className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors cursor-pointer inline-block"
              >
                ファイルを選択
              </label>
            </>
          )}
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-2">CSVファイル形式</h3>
          <p className="text-sm text-gray-600 mb-2">
            以下の列を含むCSVファイルをアップロードしてください：
          </p>
          <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
            <li>student_no: 出席番号</li>
            <li>previous_team: 前回の班番号</li>
            <li>mi_a〜mi_h: 多重知能スコア（1-8）</li>
            <li>leader: リーダー希望（0: なし, 1: あり）</li>
            <li>eyesight: 視力（0: 普通, 1: 配慮必要）</li>
            <li>student_dislikes: 苦手な生徒の出席番号（カンマ区切り）</li>
          </ul>
        </div>
      </div>
    </div>
  );

  const renderSelectSurvey = () => (
    <div className="px-6 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => setMode('welcome')}
            className="flex items-center text-gray-500 hover:text-gray-700 mb-4"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            戻る
          </button>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">既存のアンケートを選択</h2>
          <p className="text-gray-600">
            以前に作成したアンケートから選択してください。
          </p>
        </div>

        <div className="space-y-4">
          {surveys.length > 0 ? (
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
                <p className="text-sm text-gray-500">作成日: {survey.created_at}</p>
                <p className="text-sm text-gray-500">ステータス: {survey.status === 1 ? 'アクティブ' : '非アクティブ'}</p>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>アンケートが見つかりません</p>
              <button
                onClick={() => setMode('create')}
                className="text-green-500 hover:text-green-600 mt-2"
              >
                新しいアンケートを作成
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-0 flex flex-col">
      {mode === 'welcome' && renderWelcome()}
      {mode === 'create' && renderCreateSurvey()}
      {mode === 'select' && renderSelectSurvey()}
      
      {/* Next Button */}
      {selectedSurvey && (
        <div className="border-t border-gray-200 px-6 py-4 bg-white">
          <div className="flex justify-between items-center max-w-2xl mx-auto">
            <div>
              <p className="text-sm text-gray-600">選択中のアンケート:</p>
              <p className="font-medium text-gray-900">{selectedSurvey.name}</p>
            </div>
            <button
              onClick={onNext}
              className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors"
            >
              次へ（制約設定）
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SurveyCreationPhase;