'use client';

import React, { useState } from 'react';
import { useAuthContext } from '@/src/utils/firebase/authprovider';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/src/utils/firebase/firebase';
import DashboardHeader from '@/src/components/common/DashboardHeader';

const SettingsPage: React.FC = () => {
  const { state } = useAuthContext();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Side margins for consistency */}
      <div className="hidden lg:block flex-1 max-w-xs" />

      {/* Main area */}
      <div className="w-full max-w-[80%] mx-auto flex flex-col bg-white shadow-lg">
        <DashboardHeader subtitle="アカウント設定" />

        {/* Content */}
        <div className="py-8 px-4 sm:px-6 lg:px-8">
          <div className="space-y-6">
            {/* Profile Section */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">プロフィール</h2>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xl font-medium">
                      {state.teacher?.name?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {state.teacher?.name || 'ユーザー'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {state.teacher?.email}
                    </p>
                  </div>
                </div>

                {state.teacher?.school && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-md">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">所属校</h4>
                    <p className="text-sm text-gray-900">{state.teacher.school.name}</p>
                    <p className="text-xs text-gray-500">
                      {state.teacher.school.prefecture} {state.teacher.school.city}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Preferences Section */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">環境設定</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">チャット履歴</h3>
                    <p className="text-sm text-gray-500">AIアシスタントとの会話履歴を管理</p>
                  </div>
                  <button
                    onClick={() => router.push('/chat/history')}
                    className="text-blue-500 text-sm hover:text-blue-600 transition-colors"
                  >
                    管理
                  </button>
                </div>
              </div>
            </div>

            {/* Data Management Section */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">データ管理</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">データエクスポート</h3>
                    <p className="text-sm text-gray-500">アンケート結果や班分け履歴をダウンロード</p>
                  </div>
                  <button className="text-blue-500 text-sm hover:text-blue-600 transition-colors">
                    エクスポート
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">バックアップ作成</h3>
                    <p className="text-sm text-gray-500">すべてのデータのバックアップを作成</p>
                  </div>
                  <button className="text-blue-500 text-sm hover:text-blue-600 transition-colors">
                    作成
                  </button>
                </div>
              </div>
            </div>

            {/* Support Section */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">サポート</h2>
              
              <div className="space-y-4">
                {/* <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">ヘルプ・FAQ</h3>
                    <p className="text-sm text-gray-500">よくある質問と使い方ガイド</p>
                  </div>
                  <button className="text-blue-500 text-sm hover:text-blue-600 transition-colors">
                    表示
                  </button>
                </div> */}

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">お問い合わせ</h3>
                    <p className="text-sm text-gray-500">サポートへのお問い合わせ</p>
                  </div>
                  <button
                    onClick={() => router.push('https://forms.gle/sRB2NbXyYaEB9FVE9')}
                    className="text-blue-500 text-sm hover:text-blue-600 transition-colors">
                    連絡
                  </button>
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
              <h2 className="text-lg font-medium text-red-900 mb-4">アカウント操作</h2>
              
              <div className="space-y-4">
                <button
                  onClick={handleLogout}
                  disabled={isLoading}
                  className="w-full bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? 'ログアウト中...' : 'ログアウト'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Side margins */}
      <div className="hidden lg:block flex-1 max-w-xs" />
    </div>
  );
};

export default SettingsPage;