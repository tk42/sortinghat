'use client';

import React, { useState, useEffect } from 'react';
import { Class, Student } from '@/src/lib/interfaces';
import { useToastHelpers } from '@/src/components/notifications/ToastNotifications';

interface ClassSetupPhaseProps {
  selectedClass: Class | null;
}

const ClassSetupPhase: React.FC<ClassSetupPhaseProps> = ({
  selectedClass
}) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [newStudent, setNewStudent] = useState({
    student_no: '',
    name: '',
    sex: 1,
    memo: ''
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const toastHelpers = useToastHelpers();

  useEffect(() => {
    if (selectedClass) {
      loadStudents();
    }
  }, [selectedClass]);

  const loadStudents = async () => {
    if (!selectedClass) return;
    
    setIsLoading(true);
    try {
      // Load students from API
      const response = await fetch(`/api/chat/classes/${selectedClass.id}/students`);
      const result = await response.json();
      
      if (result.success && result.data?.students) {
        // Map the API response to match our Student interface
        const apiStudents = result.data.students.map((student: any) => ({
          ...student,
          class: selectedClass
        }));
        setStudents(apiStudents);
      } else {
        // Fallback to empty array if no students found
        setStudents([]);
        toastHelpers.info('情報', 'このクラスにはまだ生徒が登録されていません');
      }
    } catch (error) {
      console.error('Error loading students:', error);
      // Fallback to empty array on error
      setStudents([]);
      toastHelpers.error('読み込みエラー', '生徒データの読み込みに失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddStudent = async () => {
    if (!newStudent.name || !newStudent.student_no) {
      toastHelpers.error('入力エラー', '出席番号と氏名を入力してください');
      return;
    }

    try {
      // Add student via API
      const response = await fetch('/api/chat/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          class_id: selectedClass!.id,
          student_no: parseInt(newStudent.student_no),
          name: newStudent.name,
          sex: newStudent.sex,
          memo: newStudent.memo
        })
      });

      const result = await response.json();
      
      if (result.success && result.data?.student) {
        // Add the new student to the local state
        const newStudentData: Student = {
          ...result.data.student,
          class: selectedClass!
        };
        setStudents([...students, newStudentData]);
        setNewStudent({ student_no: '', name: '', sex: 1, memo: '' });
        setShowAddForm(false);
        toastHelpers.success('追加完了', '生徒を追加しました');
      } else {
        toastHelpers.error('追加エラー', result.error || '生徒の追加に失敗しました');
      }
    } catch (error) {
      console.error('Error adding student:', error);
      toastHelpers.error('追加エラー', '生徒の追加に失敗しました');
    }
  };

  const handleUpdateStudent = async (student: Student) => {
    try {
      // Update student via API
      const response = await fetch(`/api/chat/students/${student.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_no: student.student_no,
          name: student.name,
          sex: student.sex,
          memo: student.memo
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setStudents(students.map(s => s.id === student.id ? student : s));
        setEditingStudent(null);
        toastHelpers.success('更新完了', '生徒情報を更新しました');
      } else {
        toastHelpers.error('更新エラー', result.error || '生徒情報の更新に失敗しました');
      }
    } catch (error) {
      console.error('Error updating student:', error);
      toastHelpers.error('更新エラー', '生徒情報の更新に失敗しました');
    }
  };

  const handleDeleteStudent = async (studentId: number) => {
    if (!confirm('この生徒を削除しますか？')) return;

    try {
      // Delete student via API
      const response = await fetch(`/api/chat/students/${studentId}`, {
        method: 'DELETE'
      });

      const result = await response.json();
      
      if (result.success) {
        setStudents(students.filter(s => s.id !== studentId));
        toastHelpers.success('削除完了', '生徒を削除しました');
      } else {
        toastHelpers.error('削除エラー', result.error || '生徒の削除に失敗しました');
      }
    } catch (error) {
      console.error('Error deleting student:', error);
      toastHelpers.error('削除エラー', '生徒の削除に失敗しました');
    }
  };

  if (!selectedClass) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">クラスが選択されていません</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">クラス設定</h2>
        <p className="text-gray-600">
          {selectedClass.name} の生徒名簿を確認・編集してください
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4">
        {/* Add Student Button */}
        <div className="mb-4">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            生徒を追加
          </button>
        </div>

        {/* Add Student Form */}
        {showAddForm && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-gray-900 mb-4">新しい生徒を追加</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  出席番号
                </label>
                <input
                  type="number"
                  value={newStudent.student_no}
                  onChange={(e) => setNewStudent({ ...newStudent, student_no: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  氏名
                </label>
                <input
                  type="text"
                  value={newStudent.name}
                  onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  性別
                </label>
                <select
                  value={newStudent.sex}
                  onChange={(e) => setNewStudent({ ...newStudent, sex: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={1}>男子</option>
                  <option value={2}>女子</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  メモ
                </label>
                <input
                  type="text"
                  value={newStudent.memo}
                  onChange={(e) => setNewStudent({ ...newStudent, memo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="任意"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={handleAddStudent}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
              >
                追加
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
              >
                キャンセル
              </button>
            </div>
          </div>
        )}

        {/* Students List */}
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-gray-600 mt-2">読み込み中...</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    出席番号
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    氏名
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    性別
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    メモ
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {students.map((student) => (
                  <tr
                    key={student.id}
                    className={`hover:bg-gray-50 ${student.sex === 1 ? 'bg-blue-50' : 'bg-pink-50'}`}
                  >
                    {editingStudent?.id === student.id ? (
                      <EditStudentRow
                        student={editingStudent}
                        onSave={handleUpdateStudent}
                        onCancel={() => setEditingStudent(null)}
                      />
                    ) : (
                      <>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {student.student_no}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {student.name}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {student.sex === 1 ? '男子' : '女子'}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          {student.memo}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => setEditingStudent(student)}
                            className="text-blue-600 hover:text-blue-900 mr-2"
                            aria-label="編集"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16.862 3.487a2.25 2.25 0 013.182 3.182l-8.94 8.94a.75.75 0 01-.327.196l-4.125 1.236a.25.25 0 01-.317-.317l1.236-4.125a.75.75 0 01.196-.327l8.94-8.94z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.5 12.75V19.5a1.5 1.5 0 01-1.5 1.5h-13.5a1.5 1.5 0 01-1.5-1.5v-13.5a1.5 1.5 0 011.5-1.5h6.75" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteStudent(student.id)}
                            className="text-red-600 hover:text-red-900"
                            aria-label="削除"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4a2 2 0 012 2v2H7V5a2 2 0 012-2z" />
                            </svg>
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            
            {students.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">生徒が登録されていません</p>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="text-blue-500 hover:text-blue-600 mt-2"
                >
                  最初の生徒を追加
                </button>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
};

const EditStudentRow: React.FC<{
  student: Student;
  onSave: (student: Student) => void;
  onCancel: () => void;
}> = ({ student, onSave, onCancel }) => {
  const [editedStudent, setEditedStudent] = useState(student);

  return (
    <>
      <td className="px-4 py-4 whitespace-nowrap">
        <input
          type="number"
          value={editedStudent.student_no}
          onChange={(e) => setEditedStudent({ ...editedStudent, student_no: parseInt(e.target.value) })}
          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </td>
      <td className="px-4 py-4 whitespace-nowrap">
        <input
          type="text"
          value={editedStudent.name}
          onChange={(e) => setEditedStudent({ ...editedStudent, name: e.target.value })}
          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </td>
      <td className="px-4 py-4 whitespace-nowrap">
        <select
          value={editedStudent.sex}
          onChange={(e) => setEditedStudent({ ...editedStudent, sex: parseInt(e.target.value) })}
          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value={1}>男子</option>
          <option value={2}>女子</option>
        </select>
      </td>
      <td className="px-4 py-4 whitespace-nowrap">
        <input
          type="text"
          value={editedStudent.memo || ''}
          onChange={(e) => setEditedStudent({ ...editedStudent, memo: e.target.value })}
          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </td>
      <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
        <button
          onClick={() => onSave(editedStudent)}
          className="text-green-600 hover:text-green-900 mr-2"
          aria-label="保存"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </button>
        <button
          onClick={onCancel}
          className="text-gray-600 hover:text-gray-900"
          aria-label="キャンセル"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </td>
    </>
  );
};

export default ClassSetupPhase;