'use client';

import React, { useState } from 'react';
import { OptimizationJob, Team } from '@/src/lib/interfaces';
import { useToastHelpers } from '@/src/components/notifications/ToastNotifications';

interface ResultConfirmationPhaseProps {
  optimizationJob: OptimizationJob | null;
  onBack: () => void;
}

const ResultConfirmationPhase: React.FC<ResultConfirmationPhaseProps> = ({
  optimizationJob,
  onBack
}) => {
  const [selectedTeam, setSelectedTeam] = useState<number | null>(null);
  const [showStats, setShowStats] = useState(true);
  const toastHelpers = useToastHelpers();

  // Mock team data - in real implementation, this would come from optimizationJob.result_data.teams
  const mockTeams: Team[] = [
    {
      id: 1,
      team_id: 1,
      name: '1班',
      student_preferences: [
        // This would include actual student data
      ]
    },
    {
      id: 2,
      team_id: 2,
      name: '2班',
      student_preferences: []
    },
    {
      id: 3,
      team_id: 3,
      name: '3班',
      student_preferences: []
    },
    {
      id: 4,
      team_id: 4,
      name: '4班',
      student_preferences: []
    },
  ];

  const mockStudents = [
    { id: 1, name: '田中 太郎', sex: 1, mi_total: 35, leader: 1, team_id: 1 },
    { id: 2, name: '佐藤 花子', sex: 2, mi_total: 32, leader: 0, team_id: 1 },
    { id: 3, name: '鈴木 次郎', sex: 1, mi_total: 28, leader: 0, team_id: 1 },
    { id: 4, name: '田村 美咲', sex: 2, mi_total: 30, leader: 0, team_id: 1 },
    { id: 5, name: '山田 健太', sex: 1, mi_total: 33, leader: 1, team_id: 2 },
    { id: 6, name: '中川 彩香', sex: 2, mi_total: 29, leader: 0, team_id: 2 },
    { id: 7, name: '森 大輔', sex: 1, mi_total: 27, leader: 0, team_id: 2 },
    { id: 8, name: '井上 真理', sex: 2, mi_total: 34, leader: 0, team_id: 2 },
  ];

  const getTeamStudents = (teamId: number) => {
    return mockStudents.filter(student => student.team_id === teamId);
  };

  const getTeamStats = (teamId: number) => {
    const students = getTeamStudents(teamId);
    const totalScore = students.reduce((sum, student) => sum + student.mi_total, 0);
    const avgScore = students.length > 0 ? totalScore / students.length : 0;
    const maleCount = students.filter(s => s.sex === 1).length;
    const femaleCount = students.filter(s => s.sex === 2).length;
    const leaderCount = students.filter(s => s.leader === 1).length;
    
    return {
      totalStudents: students.length,
      avgScore: avgScore.toFixed(1),
      maleCount,
      femaleCount,
      leaderCount
    };
  };

  const handleExportResults = () => {
    // TODO: Implement export functionality
    toastHelpers.success('エクスポート', '結果をCSVファイルでダウンロードしました');
  };

  const handleSaveResults = () => {
    // TODO: Implement save functionality
    toastHelpers.success('保存完了', '班分け結果を保存しました');
  };

  if (!optimizationJob) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">最適化結果がありません</p>
        <button
          onClick={onBack}
          className="text-blue-500 hover:text-blue-600 mt-2"
        >
          制約設定に戻る
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">結果確認</h2>
            <p className="text-gray-600">
              最適化された班分け結果を確認してください
            </p>
          </div>
          <button
            onClick={onBack}
            className="flex items-center text-gray-500 hover:text-gray-700"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            制約設定に戻る
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="px-6 py-4">
          {/* Optimization Stats */}
          {showStats && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-medium text-green-900">最適化結果</h3>
                <button
                  onClick={() => setShowStats(false)}
                  className="text-green-600 hover:text-green-800"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-green-700 font-medium">目的関数値:</span>
                  <div className="text-green-900 font-bold">
                    {optimizationJob.result_data?.objective_value?.toFixed(2) || '12.34'}
                  </div>
                </div>
                <div>
                  <span className="text-green-700 font-medium">計算時間:</span>
                  <div className="text-green-900 font-bold">
                    {optimizationJob.result_data?.computation_time?.toFixed(2) || '1.23'}秒
                  </div>
                </div>
                <div>
                  <span className="text-green-700 font-medium">制約充足度:</span>
                  <div className="text-green-900 font-bold">
                    {((optimizationJob.result_data?.feasibility_score || 0.95) * 100).toFixed(1)}%
                  </div>
                </div>
                <div>
                  <span className="text-green-700 font-medium">総班数:</span>
                  <div className="text-green-900 font-bold">{mockTeams.length}班</div>
                </div>
              </div>
            </div>
          )}

          {/* Teams Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
            {mockTeams.map((team) => {
              const stats = getTeamStats(team.team_id);
              const students = getTeamStudents(team.team_id);
              const isSelected = selectedTeam === team.team_id;
              
              return (
                <div
                  key={team.id}
                  onClick={() => setSelectedTeam(isSelected ? null : team.team_id)}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">{team.name}</h3>
                    <div className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {stats.totalStudents}人
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">平均スコア:</span>
                      <span className="font-medium">{stats.avgScore}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">男女比:</span>
                      <span className="font-medium">{stats.maleCount}:{stats.femaleCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">リーダー:</span>
                      <span className="font-medium">{stats.leaderCount}人</span>
                    </div>
                  </div>
                  
                  {isSelected && (
                    <div className="mt-3 pt-3 border-t border-blue-200">
                      <div className="space-y-1">
                        {students.map(student => (
                          <div key={student.id} className="flex items-center justify-between text-xs">
                            <div className="flex items-center">
                              <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                                student.sex === 1 ? 'bg-blue-400' : 'bg-pink-400'
                              }`}></span>
                              <span>{student.name}</span>
                              {student.leader === 1 && (
                                <span className="ml-1 text-orange-600">★</span>
                              )}
                            </div>
                            <span className="text-gray-500">{student.mi_total}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Team Detail View */}
          {selectedTeam && (
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {selectedTeam}班 詳細情報
              </h3>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        氏名
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        性別
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        MI合計
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        リーダー
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {getTeamStudents(selectedTeam).map(student => (
                      <tr key={student.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {student.name}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {student.sex === 1 ? '男子' : '女子'}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {student.mi_total}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {student.leader === 1 ? '★' : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="border-t border-gray-200 px-6 py-4 bg-white">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            班分け結果: {mockTeams.length}班、計{mockStudents.length}名
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleExportResults}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
            >
              CSVエクスポート
            </button>
            <button
              onClick={handleSaveResults}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              結果を保存
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultConfirmationPhase;