'use client';

import React, { useState, useEffect } from 'react';
import { useAuthContext } from '@/src/utils/firebase/authprovider';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/src/utils/firebase/firebase';
import { getIdToken } from '@firebase/auth';
import toast, { Toaster } from 'react-hot-toast';
import { updateTeacher } from '@/src/utils/actions/update_teacher';
import { handleEmailUpdate, handleResetPassword } from '@/src/services/authservice';
import DashboardHeader from '@/src/components/Common/DashboardHeader';
import { Teacher } from '@/src/lib/interfaces';

interface SettingsPageClientProps {
  initialTeacher?: Teacher;
}

const SettingsPageClient: React.FC<SettingsPageClientProps> = ({ initialTeacher }) => {
  const { state } = useAuthContext();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  // SSRから渡された初期データを使用し、その後クライアントサイドの状態で更新
  const currentTeacher = state.teacher || initialTeacher;
  const [name, setName] = useState(currentTeacher?.name || '');
  const [email, setEmail] = useState(currentTeacher?.email || '');

  useEffect(() => {
    if (state.teacher) {
      setName(state.teacher.name || '');
      setEmail(state.teacher.email || '');
    }
  }, [state.teacher]);

  // アカウント削除
  const handleDeleteAccount = async () => {
    if (!window.confirm('本当にアカウントを削除しますか？この操作は取り消せません。')) return;
    setIsLoading(true);
    try {
      // サーバー側でユーザー削除 & セッション破棄
      const res = await fetch('/api/auth/delete', { method: 'DELETE' });
      if (!res.ok) {
        throw new Error('Delete account failed');
      }

      // Firebase クライアント側サインアウト
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('Account delete error:', error);
      toast.error('アカウント削除に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!state.user) return;
    try {
      // 名前変更
      if (name !== currentTeacher?.name) {
        const idToken = await getIdToken(state.user);
        const res = await updateTeacher(idToken, name, currentTeacher?.email || '');
        if (res.success) {
          toast.success('名前を更新しました');
        } else {
          toast.error(res.error || '更新に失敗しました');
        }
      }
      // メールアドレス変更
      if (email !== currentTeacher?.email && currentTeacher) {
        await handleEmailUpdate(state.user, email, currentTeacher);
      }
    } catch (error) {
      console.error('プロフィール更新エラー:', error);
      toast.error('プロフィールの更新に失敗しました');
    }
  };

  const handlePasswordResetClick = async () => {
    if (!state.user?.email) {
      toast.error('メールアドレスが見つかりません');
      return;
    }
    await handleResetPassword(state.user.email);
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
                      {currentTeacher?.name?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {currentTeacher?.name || 'ユーザー'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {currentTeacher?.email}
                    </p>
                  </div>
                </div>

                {currentTeacher?.school && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-md">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">所属校</h4>
                    <p className="text-sm text-gray-900">{currentTeacher.school.name}</p>
                    <p className="text-xs text-gray-500">
                      {currentTeacher.school.prefecture} {currentTeacher.school.city}
                    </p>
                  </div>
                )}
              </div>

              {/* 編集フォーム */}
              <div className="mt-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">名前</label>
                  <input
                    type="text"
                    className="w-full border rounded-md p-2"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">メールアドレス</label>
                  <input
                    type="email"
                    className="w-full border rounded-md p-2"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="flex space-x-4">
                  <button
                    onClick={handleSaveProfile}
                    className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
                  >
                    変更を保存
                  </button>
                  <button
                    onClick={handlePasswordResetClick}
                    className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
                  >
                    パスワードをリセット
                  </button>
                </div>
              </div>
            </div>

            {/* Support Section */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">サポート</h2>
              
              <div className="space-y-4">
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
                  onClick={handleDeleteAccount}
                  disabled={isLoading}
                  className="w-full bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? '削除中...' : 'アカウント削除'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Side margins */}
      <div className="hidden lg:block flex-1 max-w-xs" />
      <Toaster />
    </div>
  );
};

export default SettingsPageClient;