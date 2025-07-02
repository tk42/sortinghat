'use client';

import React, { useState, useEffect } from 'react';
import { Survey, StudentPreference, Constraint } from '@/src/lib/interfaces';
import { matchStudentPreferences } from '@/src/utils/actions/match_student_preferences';
import { useToastHelpers } from '@/src/components/notifications/ToastNotifications';

interface OptimizationExecutionPhaseProps {
  selectedSurvey: Survey | null;
  studentPreferences: StudentPreference[];
  onOptimizationComplete: (result: any) => void;
}

const OptimizationExecutionPhase: React.FC<OptimizationExecutionPhaseProps> = ({
  selectedSurvey,
  studentPreferences,
  onOptimizationComplete
}) => {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [constraint, setConstraint] = useState<Constraint>({
    max_num_teams: 0,
    members_per_team: 4,
    at_least_one_pair_sex: true,
    girl_geq_boy: false,
    boy_geq_girl: false,
    at_least_one_leader: true,
    unique_previous: true,
    group_diff_coeff: 1.5
  });
  const toastHelpers = useToastHelpers();

  // Calculate max teams based on class size and members per team
  useEffect(() => {
    if (studentPreferences.length > 0) {
      const maxTeams = Math.ceil(studentPreferences.length / constraint.members_per_team);
      setConstraint(prev => ({ ...prev, max_num_teams: maxTeams }));
    }
  }, [studentPreferences.length, constraint.members_per_team]);

  const handleOptimizationExecution = async () => {
    if (!selectedSurvey || studentPreferences.length === 0) {
      toastHelpers.error('エラー', 'アンケートまたは選好データが選択されていません');
      return;
    }

    setIsOptimizing(true);
    
    try {
      const result = await matchStudentPreferences(constraint, studentPreferences);
      
      if (result.error) {
        toastHelpers.error('最適化エラー', result.error);
      } else if (result.data) {
        toastHelpers.success('最適化完了', 'チーム編成が完了しました');
        onOptimizationComplete({
          teams: result.data,
          constraint: constraint,
          survey: selectedSurvey,
          studentPreferences: studentPreferences,
        });
      }
    } catch (error) {
      console.error('Optimization error:', error);
      toastHelpers.error('最適化エラー', '最適化処理中にエラーが発生しました');
    } finally {
      setIsOptimizing(false);
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
        <h2 className="text-xl font-semibold text-gray-900">最適化実行</h2>
        <p className="text-gray-600">
          {selectedSurvey.name} のチーム編成制約を設定して最適化を実行してください
        </p>
        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
          <span>対象生徒数: {studentPreferences.length}人</span>
          <span>予想チーム数: {constraint.max_num_teams}チーム</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          <h3 className="text-lg font-medium text-gray-900">制約設定</h3>
          
          {/* Team Size Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                1チームあたりの人数
              </label>
              <select
                value={constraint.members_per_team}
                onChange={(e) => setConstraint(prev => ({ 
                  ...prev, 
                  members_per_team: parseInt(e.target.value) 
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value={3}>3人</option>
                <option value={4}>4人</option>
                <option value={5}>5人</option>
                <option value={6}>6人</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                最大チーム数
              </label>
              <input
                type="number"
                value={constraint.max_num_teams}
                onChange={(e) => setConstraint(prev => ({ 
                  ...prev, 
                  max_num_teams: parseInt(e.target.value) || 0 
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                min={1}
              />
            </div>
          </div>

          {/* Gender Balance Settings */}
          <div>
            <h4 className="text-md font-medium text-gray-800 mb-3">性別バランス</h4>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={constraint.at_least_one_pair_sex}
                  onChange={(e) => setConstraint(prev => ({ 
                    ...prev, 
                    at_least_one_pair_sex: e.target.checked 
                  }))}
                  className="mr-2 h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">各チームに男女を含める</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={constraint.girl_geq_boy}
                  onChange={(e) => setConstraint(prev => ({ 
                    ...prev, 
                    girl_geq_boy: e.target.checked 
                  }))}
                  className="mr-2 h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">女性の人数を男性以上にする</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={constraint.boy_geq_girl}
                  onChange={(e) => setConstraint(prev => ({ 
                    ...prev, 
                    boy_geq_girl: e.target.checked 
                  }))}
                  className="mr-2 h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">男性の人数を女性以上にする</span>
              </label>
            </div>
          </div>

          {/* Leadership Settings */}
          <div>
            <h4 className="text-md font-medium text-gray-800 mb-3">リーダーシップ</h4>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={constraint.at_least_one_leader}
                onChange={(e) => setConstraint(prev => ({ 
                  ...prev, 
                  at_least_one_leader: e.target.checked 
                }))}
                className="mr-2 h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">各チームに最低1人のリーダーを配置</span>
            </label>
          </div>

          {/* Previous Team Settings */}
          <div>
            <h4 className="text-md font-medium text-gray-800 mb-3">前回チーム考慮</h4>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={constraint.unique_previous}
                onChange={(e) => setConstraint(prev => ({ 
                  ...prev, 
                  unique_previous: e.target.checked 
                }))}
                className="mr-2 h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">前回と異なるチーム編成にする</span>
            </label>
          </div>

          {/* Score Balance Coefficient */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              スコアバランス係数: {constraint.group_diff_coeff}
            </label>
            <input
              type="range"
              min="0"
              max="3"
              step="0.1"
              value={constraint.group_diff_coeff}
              onChange={(e) => setConstraint(prev => ({ 
                ...prev, 
                group_diff_coeff: parseFloat(e.target.value) 
              }))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>スコア差を重視しない</span>
              <span>スコア差を重視する</span>
            </div>
          </div>

          {/* Optimization Button */}
          <div className="pt-4 border-t border-gray-200">
            <button
              onClick={handleOptimizationExecution}
              disabled={isOptimizing || studentPreferences.length === 0}
              className="w-full bg-orange-600 text-white py-3 px-4 rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isOptimizing ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  最適化実行中...
                </div>
              ) : (
                '最適化を実行'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OptimizationExecutionPhase;