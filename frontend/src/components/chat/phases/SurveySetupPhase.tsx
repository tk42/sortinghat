'use client';

import React, { useState, useEffect } from 'react';
import { Survey, StudentPreference } from '@/src/lib/interfaces';
import { useToastHelpers } from '@/src/components/notifications/ToastNotifications';

interface SurveySetupPhaseProps {
  selectedSurvey: Survey | null;
}

const SurveySetupPhase: React.FC<SurveySetupPhaseProps> = ({
  selectedSurvey
}) => {
  const [studentPreferences, setStudentPreferences] = useState<StudentPreference[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingPreference, setEditingPreference] = useState<StudentPreference | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [classStudents, setClassStudents] = useState<{ id: number; student_no: number; name: string; sex: number }[]>([]);
  const [combinedData, setCombinedData] = useState<Array<{
    student: { id: number; student_no: number; name: string; sex: number };
    preference?: StudentPreference;
    hasPreference: boolean;
  }>>([]);
  const toastHelpers = useToastHelpers();

  useEffect(() => {
    if (selectedSurvey) {
      loadStudentPreferences();
      loadClassStudents();
    }
  }, [selectedSurvey]);

  // クラス生徒と選好データを結合
  useEffect(() => {
    if (classStudents.length > 0) {
      const combined = classStudents.map(student => {
        const preference = studentPreferences.find(p => p.student?.id === student.id);
        return {
          student,
          preference,
          hasPreference: !!preference
        };
      });
      setCombinedData(combined);
    }
  }, [classStudents, studentPreferences]);

  // 苦手な生徒のIDから名前を取得するヘルパー関数
  const getDislikedStudentNames = (studentDislikes: any[] | undefined): string => {
    if (!studentDislikes || studentDislikes.length === 0) return '-';
    
    const names = studentDislikes
      .map(dislike => {
        const student = classStudents.find(s => s.id === dislike.student_id);
        return student ? `${student.name}(${student.student_no})` : `ID:${dislike.student_id}`;
      })
      .filter(name => name);
      
    return names.length > 0 ? names.join(', ') : '-';
  };

  const loadClassStudents = async () => {
    if (!selectedSurvey?.class) return;
    
    try {
      const response = await fetch(`/api/chat/classes/${selectedSurvey.class.id}/students`);
      const result = await response.json();
      
      if (result.success && result.data?.students) {
        setClassStudents(result.data.students);
      }
    } catch (error) {
      console.error('Error loading class students:', error);
    }
  };

  const loadStudentPreferences = async () => {
    if (!selectedSurvey) return;
    
    setIsLoading(true);
    try {
      // Load student preferences from API
      const response = await fetch(`/api/chat/surveys/${selectedSurvey.id}/preferences`);
      const result = await response.json();
      
      if (result.success && result.data?.student_preferences) {
        setStudentPreferences(result.data.student_preferences);
      } else {
        // Fallback to empty array if no preferences found
        setStudentPreferences([]);
        toastHelpers.info('情報', 'このアンケートにはまだ選好データが登録されていません');
      }
    } catch (error) {
      console.error('Error loading student preferences:', error);
      // Fallback to empty array on error
      setStudentPreferences([]);
      toastHelpers.error('読み込みエラー', '選好データの読み込みに失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePreference = async (studentId: number) => {
    try {
      // Create new preference with default values
      const response = await fetch('/api/chat/student-preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          survey_id: selectedSurvey!.id,
          student_no: classStudents.find(s => s.id === studentId)?.student_no || 0,
          mi_a: 1, mi_b: 1, mi_c: 1, mi_d: 1, mi_e: 1, mi_f: 1, mi_g: 1, mi_h: 1,
          leader: 1,
          eyesight: 1,
          previous_team: 0
        })
      });

      const result = await response.json();
      
      if (result.success && result.data?.student_preference) {
        setStudentPreferences([...studentPreferences, result.data.student_preference]);
        toastHelpers.success('作成完了', '選好データを作成しました');
      } else {
        toastHelpers.error('作成エラー', result.error || '選好データの作成に失敗しました');
      }
    } catch (error) {
      console.error('Error creating student preference:', error);
      toastHelpers.error('作成エラー', '選好データの作成に失敗しました');
    }
  };

  const handleEdit = (preference: StudentPreference) => {
    setEditingId(preference.id);
    setEditingPreference({ ...preference });
  };

  const handleSave = async () => {
    if (!editingPreference) return;

    try {
      // Update student preference via API
      const response = await fetch(`/api/chat/student-preferences/${editingPreference.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: editingPreference.student?.id,
          previous_team: editingPreference.previous_team || 0,
          mi_a: editingPreference.mi_a,
          mi_b: editingPreference.mi_b,
          mi_c: editingPreference.mi_c,
          mi_d: editingPreference.mi_d,
          mi_e: editingPreference.mi_e,
          mi_f: editingPreference.mi_f,
          mi_g: editingPreference.mi_g,
          mi_h: editingPreference.mi_h,
          leader: editingPreference.leader,
          eyesight: editingPreference.eyesight
        })
      });

      const result = await response.json();
      
      if (result.success && result.data?.student_preference) {
        setStudentPreferences(studentPreferences.map(p => 
          p.id === editingPreference.id ? result.data.student_preference : p
        ));
        setEditingId(null);
        setEditingPreference(null);
        toastHelpers.success('更新完了', '選好データを更新しました');
      } else {
        toastHelpers.error('更新エラー', result.error || '選好データの更新に失敗しました');
      }
    } catch (error) {
      console.error('Error updating student preference:', error);
      toastHelpers.error('更新エラー', '選好データの更新に失敗しました');
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditingPreference(null);
  };

  const handleDeletePreference = async (preferenceId: number) => {
    if (!confirm('この選好データを削除しますか？')) return;

    try {
      // Delete student preference via API
      const response = await fetch(`/api/chat/student-preferences/${preferenceId}`, {
        method: 'DELETE'
      });

      const result = await response.json();
      
      if (result.success) {
        setStudentPreferences(studentPreferences.filter(p => p.id !== preferenceId));
        toastHelpers.success('削除完了', '選好データを削除しました');
      } else {
        toastHelpers.error('削除エラー', result.error || '選好データの削除に失敗しました');
      }
    } catch (error) {
      console.error('Error deleting student preference:', error);
      toastHelpers.error('削除エラー', '選好データの削除に失敗しました');
    }
  };

  if (!selectedSurvey) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">アンケートが選択されていません</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">アンケート設定</h2>
        <p className="text-gray-600">
          {selectedSurvey.name} の選好データを確認・編集してください
        </p>
        {combinedData.length > 0 && (
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
            <span>総数: {combinedData.length}人</span>
            <span className="text-blue-500">♂ 男性: {combinedData.filter(d => d.student.sex === 1).length}人</span>
            <span className="text-pink-500">♀ 女性: {combinedData.filter(d => d.student.sex === 2).length}人</span>
            <span className="text-green-600">データ有: {combinedData.filter(d => d.hasPreference).length}人</span>
            <span className="text-orange-600">データ無: {combinedData.filter(d => !d.hasPreference).length}人</span>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4">

        {/* Student Preferences List */}
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
            <p className="text-gray-600 mt-2">読み込み中...</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    出席番号
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    名前
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    前回チーム
                  </th>
                  <th className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    身体
                  </th>
                  <th className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    空間
                  </th>
                  <th className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    論理
                  </th>
                  <th className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    言語
                  </th>
                  <th className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    対人
                  </th>
                  <th className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    内省
                  </th>
                  <th className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    音楽
                  </th>
                  <th className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    自然
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    視力
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    リーダー
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    苦手な生徒
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {combinedData.sort((a, b) => a.student.student_no - b.student.student_no).map((data) => {
                  const { student, preference, hasPreference } = data;
                  const isEditing = preference && editingId === preference.id;
                  
                  // 性別による行の色分け (1: 男性=青系, 2: 女性=ピンク系)
                  const rowBgColor = student.sex === 1 ? 'bg-blue-50' : student.sex === 2 ? 'bg-pink-50' : 'bg-gray-50';
                  
                  // データがない場合の背景色
                  const finalBgColor = hasPreference ? rowBgColor : 'bg-gray-100';
                  
                  return (
                    <tr key={student.id} className={`${finalBgColor} hover:opacity-75`}>
                      {isEditing && preference ? (
                        // 編集モード
                        <>
                          <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                            {student.student_no}
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div className="flex items-center">
                              <span>{student.name}</span>
                              {student.sex === 1 && <span className="ml-1 text-blue-500">♂</span>}
                              {student.sex === 2 && <span className="ml-1 text-pink-500">♀</span>}
                            </div>
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap text-sm">
                            <input
                              type="number"
                              value={editingPreference?.previous_team || 0}
                              onChange={(e) => setEditingPreference(prev => prev ? {
                                ...prev,
                                previous_team: parseInt(e.target.value) || 0
                              } : null)}
                              className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                            />
                          </td>
                          {/* MI Scores編集 */}
                          {['mi_a', 'mi_b', 'mi_c', 'mi_d', 'mi_e', 'mi_f', 'mi_g', 'mi_h'].map((field) => (
                            <td key={field} className="px-2 py-4 whitespace-nowrap text-sm text-center">
                              <select
                                value={editingPreference?.[field as keyof StudentPreference] as number || 1}
                                onChange={(e) => setEditingPreference(prev => prev ? {
                                  ...prev,
                                  [field]: parseInt(e.target.value)
                                } : null)}
                                className="w-12 px-1 py-1 border border-gray-300 rounded text-sm"
                              >
                                {[1,2,3,4,5,6,7,8].map(val => (
                                  <option key={val} value={val}>{val}</option>
                                ))}
                              </select>
                            </td>
                          ))}
                          <td className="px-3 py-4 whitespace-nowrap text-sm">
                            <select
                              value={editingPreference?.eyesight || 1}
                              onChange={(e) => setEditingPreference(prev => prev ? {
                                ...prev,
                                eyesight: parseInt(e.target.value)
                              } : null)}
                              className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                            >
                              <option value={1}>普通</option>
                              <option value={3}>前方</option>
                              <option value={8}>要配慮</option>
                            </select>
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap text-sm">
                            <select
                              value={editingPreference?.leader || 1}
                              onChange={(e) => setEditingPreference(prev => prev ? {
                                ...prev,
                                leader: parseInt(e.target.value)
                              } : null)}
                              className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                            >
                              <option value={1}>お任せ</option>
                              <option value={3}>サブ</option>
                              <option value={8}>リーダー</option>
                            </select>
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                            {editingPreference?.student_dislikes ? 
                              getDislikedStudentNames(editingPreference.student_dislikes) : '-'
                            }
                            {/* TODO: 苦手な生徒の編集機能 - 将来実装予定 */}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={handleSave}
                              className="text-green-600 hover:text-green-900 mr-2"
                              title="保存"
                            >
                              ✓
                            </button>
                            <button
                              onClick={handleCancel}
                              className="text-gray-600 hover:text-gray-900"
                              title="キャンセル"
                            >
                              ✗
                            </button>
                          </td>
                        </>
                      ) : (
                        // 表示モード
                        <>
                          <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                            {student.student_no}
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div className="flex items-center">
                              <span>{student.name}</span>
                              {student.sex === 1 && <span className="ml-1 text-blue-500">♂</span>}
                              {student.sex === 2 && <span className="ml-1 text-pink-500">♀</span>}
                            </div>
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                            {preference?.previous_team || '-'}
                          </td>
                          <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                            {preference?.mi_a || '-'}
                          </td>
                          <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                            {preference?.mi_b || '-'}
                          </td>
                          <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                            {preference?.mi_c || '-'}
                          </td>
                          <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                            {preference?.mi_d || '-'}
                          </td>
                          <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                            {preference?.mi_e || '-'}
                          </td>
                          <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                            {preference?.mi_f || '-'}
                          </td>
                          <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                            {preference?.mi_g || '-'}
                          </td>
                          <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                            {preference?.mi_h || '-'}
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                            {preference ? (preference.eyesight === 8 ? '要配慮' : preference.eyesight === 3 ? '前方' : '普通') : '-'}
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                            {preference ? (preference.leader === 8 ? 'リーダー' : preference.leader === 3 ? 'サブ' : 'お任せ') : '-'}
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                            {hasPreference && preference?.student_dislikes ? 
                              getDislikedStudentNames(preference.student_dislikes) : '-'
                            }
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                            {hasPreference && preference ? (
                              <>
                                <button
                                  onClick={() => handleEdit(preference)}
                                  className="text-orange-600 hover:text-orange-900 mr-2"
                                >
                                  編集
                                </button>
                                <button
                                  onClick={() => handleDeletePreference(preference.id)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  削除
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => handleCreatePreference(student.id)}
                                className="text-green-600 hover:text-green-900"
                              >
                                作成
                              </button>
                            )}
                          </td>
                        </>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
            
            {combinedData.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">クラスの生徒データが読み込まれていません</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SurveySetupPhase;