'use client';

import React, { useState } from 'react';
import { MatchingResult } from '@/src/lib/interfaces';
import { TeamRadarChart } from '@/src/components/matching/TeamRadarChart';
import { useToastHelpers } from '@/src/components/notifications/ToastNotifications';
import { updateStudentTeams } from '@/src/utils/actions/update_student_teams';

interface ResultConfirmationPhaseProps {
  matchingResult: any | null;
}

// チームごとの表示色
const colors = [
  "54, 162, 235",   // blue
  "255, 99, 132",   // red
  "75, 192, 192",   // green
  "255, 206, 86",   // yellow
  "153, 102, 255",  // purple
  "255, 159, 64",   // orange
];

interface StudentData {
  id: number;
  name: string;
  sex: number;
  student_no: number;
  leader: number;
  eyesight: number;
  student_dislikes?: number[];
  miScores: number[];
}

interface TeamAggregated {
  team_id: number;
  name: string;
  aggregatedScores: number[];
  students: StudentData[];
}

const ResultConfirmationPhase: React.FC<ResultConfirmationPhaseProps> = ({
  matchingResult
}) => {
  const [showName, setShowName] = useState<boolean>(false);
  const [hoveredStudent, setHoveredStudent] = useState<StudentData | null>(null);
  const toastHelpers = useToastHelpers();

  if (!matchingResult || !matchingResult.teams) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">最適化結果がありません</p>
      </div>
    );
  }

  // Normalize teams data: support array (GraphQL) or mapping (optimization) formats
  const teamDataRecords: any[] = Array.isArray(matchingResult.teams)
    ? matchingResult.teams
    : Object.entries(matchingResult.teams).flatMap(([teamId, members]) =>
        (members as number[]).map((student_no: number) => {
          const pref = matchingResult.studentPreferences?.find((p: any) => p.student?.student_no === student_no);
          return {
            team_id: Number(teamId),
            name: `チーム${Number(teamId) + 1}`,
            student_preference: pref || {},
          };
        })
      );

  // Process teams data similar to MatchingOverview
  const teamsById = teamDataRecords.sort((a: any, b: any) => a.team_id - b.team_id).reduce((acc: any, teamData: any) => {
    const teamId = teamData.team_id;
    if (!acc[teamId]) {
      acc[teamId] = {
        team_id: teamId,
        name: teamData.name,
        aggregatedScores: [0, 0, 0, 0, 0, 0, 0, 0],
        students: [] as StudentData[],
      };
    }
    const pref = teamData.student_preference;
    if (pref) {
      acc[teamId].aggregatedScores[0] += pref.mi_a || 0;
      acc[teamId].aggregatedScores[1] += pref.mi_b || 0;
      acc[teamId].aggregatedScores[2] += pref.mi_c || 0;
      acc[teamId].aggregatedScores[3] += pref.mi_d || 0;
      acc[teamId].aggregatedScores[4] += pref.mi_e || 0;
      acc[teamId].aggregatedScores[5] += pref.mi_f || 0;
      acc[teamId].aggregatedScores[6] += pref.mi_g || 0;
      acc[teamId].aggregatedScores[7] += pref.mi_h || 0;
    }
    if (pref && pref.student) {
      acc[teamId].students.push({
        id: pref.student.id,
        name: pref.student.name,
        sex: pref.student.sex,
        student_no: pref.student.student_no,
        leader: pref.leader,
        eyesight: pref.eyesight,
        student_dislikes: pref.student_dislikes?.map((sd: { student_id: number }) => sd.student_id),
        miScores: [
          pref.mi_a || 0, pref.mi_b || 0, pref.mi_c || 0, pref.mi_d || 0,
          pref.mi_e || 0, pref.mi_f || 0, pref.mi_g || 0, pref.mi_h || 0,
        ],
      });
    }
    return acc;
  }, {} as Record<number, TeamAggregated>);

  const studentsById = teamDataRecords.map((teamData: any) => {
    const student = teamData.student_preference?.student;
    return {
      student_id: student?.id,
      name: student?.name,
      student_no: student?.student_no,
    };
  });

  const teamsArray = Object.values(teamsById);

  const handleSaveResults = async () => {
    if (!matchingResult || !matchingResult.teams || !matchingResult.survey) {
      toastHelpers.error('エラー', '保存する結果がありません');
      return;
    }

    try {
      // Convert optimization result to the expected teams mapping format
      let teamsMapping: Record<string, number[]> = {};

      if (Array.isArray(matchingResult.teams)) {
        matchingResult.teams.forEach((team: any, idx: number) => {
          const teamId = team.team_id ?? idx;
          const studentNos = team.students
            ? team.students.map((s: any) =>
                s.student_no !== undefined ? s.student_no : s
              )
            : Array.isArray(team)
              ? team.map((s: any) => s)
              : [];
          teamsMapping[teamId.toString()] = studentNos;
        });
      } else {
        teamsMapping = matchingResult.teams as Record<string, number[]>;
      }

      toastHelpers.info('保存中', '班分け結果を保存しています...');
      await updateStudentTeams(teamsMapping, matchingResult.survey.id, matchingResult.constraint);
      toastHelpers.success('保存完了', '班分け結果を保存しました');
    } catch (error) {
      console.error('Error saving matching results:', error);
      toastHelpers.error('保存失敗', '班分け結果の保存に失敗しました');
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">結果確認</h2>
        <p className="text-gray-600">最適化されたチーム編成結果を確認してください</p>
        <div className="flex items-center mb-4 mt-4">
          <div className="flex items-center mb-4 mr-2">
            👑：リーダー
          </div>
          <div className="flex items-center mb-4 mr-2">
            🎩：サブリーダー
          </div>
          <div className="flex items-center mb-4 mr-2">
            👤：メンバー
          </div>
        </div>
        <div className="flex items-center mb-4">
          <div className="flex items-center mb-4 mr-2">
            👁️：前方希望
          </div>
          <div className="flex items-center mb-4 mr-2">
            👀：どちらかというと前方
          </div>
        </div>
        <div className="flex items-center mb-4">
          名前表示：
          <input
            type="checkbox"
            checked={showName}
            onChange={() => setShowName(!showName)}
            className="toggle toggle-primary ml-2"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teamsArray.map((team: any, index) => {
            const colorIndex = index % colors.length;
            
            const studentDislikeTable = (
              <table className="w-full text-sm text-left border-collapse">
                <tbody>
                  {team.students.map((student_pref: StudentData) => {
                    let leadership;
                    switch (student_pref.leader) {
                      case 8:
                        leadership = '👑';
                        break;
                      case 3:
                        leadership = '🎩';
                        break;
                      default:
                        leadership = '👤';
                    }
                    let eyesight;
                    switch (student_pref.eyesight) {
                      case 8:
                        eyesight = '👁️';
                        break;
                      case 3:
                        eyesight = '👀';
                        break;
                    }
                    
                    return (
                      <tr key={student_pref.id}>
                        <td className={`px-2 py-1 border font-bold ${student_pref.sex === 1 ? 'bg-blue-50' : 'bg-pink-50'}`}>
                          <div onMouseEnter={() => setHoveredStudent(student_pref)} onMouseLeave={() => setHoveredStudent(null)}>
                            {showName ? student_pref.student_no + " " + student_pref.name : student_pref.student_no}
                          </div>
                        </td>
                        <td className={`px-2 py-1 border ${student_pref.sex === 1 ? 'bg-blue-50' : 'bg-pink-50'}`}>{leadership} {eyesight}</td>
                        <td className={`px-2 py-1 border ${student_pref.sex === 1 ? 'bg-blue-50' : 'bg-pink-50'}`}>
                          {student_pref.student_dislikes && student_pref.student_dislikes.length > 0 
                            ? student_pref.student_dislikes
                                .map(dislikeId => {
                                  const disliked_student = studentsById.find(s => s.student_id === dislikeId);
                                  if (!disliked_student) {
                                    return `ID:${dislikeId}`;
                                  }
                                  return showName
                                    ? disliked_student.student_no + " " + disliked_student.name
                                    : disliked_student.student_no;
                                })
                                .join(', ')
                            : 'なし'
                          }
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            );

            return (
              <TeamRadarChart
                key={team.team_id}
                teamName={team.name}
                aggregatedScores={team.aggregatedScores}
                color={colors[colorIndex]}
                overlayScores={
                  hoveredStudent && team.students.some((s: StudentData) => s.id === hoveredStudent.id)
                    ? hoveredStudent.miScores
                    : undefined
                }
                overlayColor={colors[colorIndex]}
                overlayLabel="個人のスコア"
                studentDislikeTable={studentDislikeTable}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ResultConfirmationPhase;