import { MatchingResult } from '@/src/lib/interfaces'
import { RadarChart } from './RadarChart'

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
  leader: number;  // student_preference から取得
  // student_dislike が存在する場合は、生徒IDの配列など（なければ undefined）
  student_dislikes?: number[]; // 数値の配列に変更
}

interface TeamAggregated {
  team_id: number;
  name: string;
  aggregatedScores: number[]; // [mi_a, mi_b, ..., mi_h]
  students: StudentData[];
}

interface MatchingOverviewProps {
  selectedMatching: MatchingResult;
}

export function MatchingOverview({ selectedMatching }: MatchingOverviewProps) {
  console.log(JSON.stringify(selectedMatching, null, 2))

  // チームごとに生徒データを集計
  const teamsById = selectedMatching.teams.reduce((acc, teamData: any) => {
    const teamId = teamData.team_id;
    if (!acc[teamId]) {
      acc[teamId] = {
        team_id: teamId,
        name: teamData.name, // 各レコードで同じチーム名になっている前提
        aggregatedScores: [0, 0, 0, 0, 0, 0, 0, 0], // mi_a ~ mi_h の合計値
        students: [] as StudentData[],
      };
    }
    const pref = teamData.student_preference; // 単数形で参照することに注意
    if (pref) {
      // mi_a ~ mi_h の値を加算（存在しなければ 0 を加算）
      acc[teamId].aggregatedScores[0] += pref.mi_a || 0;
      acc[teamId].aggregatedScores[1] += pref.mi_b || 0;
      acc[teamId].aggregatedScores[2] += pref.mi_c || 0;
      acc[teamId].aggregatedScores[3] += pref.mi_d || 0;
      acc[teamId].aggregatedScores[4] += pref.mi_e || 0;
      acc[teamId].aggregatedScores[5] += pref.mi_f || 0;
      acc[teamId].aggregatedScores[6] += pref.mi_g || 0;
      acc[teamId].aggregatedScores[7] += pref.mi_h || 0;
    }
    // 生徒情報を追加（student_dislike も含む）
    if (pref && pref.student) {
      acc[teamId].students.push({
        id: pref.student.id,
        name: pref.student.name,
        sex: pref.student.sex,
        student_no: pref.student.student_no,
        leader: pref.leader,  // student_preference から leader を取得
        student_dislikes: pref.student_dislikes.map((sd: { student_id: number }) => sd.student_id),  // student_preference から student_dislikes を取得
      });
    }
    return acc;
  }, {} as Record<number, TeamAggregated>);

  // オブジェクトから配列に変換
  const teamsArray = Object.values(teamsById);

  return (
    <div>
      <h2 className="text-xl font-semibold">マッチング結果</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
        {teamsArray.map((team, index) => {
          const colorIndex = index % colors.length;
          // チーム内の全生徒のID一覧
          const teamStudentIds = team.students.map(student => student.id);

          // 各生徒ごとに、同じチーム内に「嫌いな生徒」が含まれているかをチェック
          const studentDislikeTable = (
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr>
                  <th className="px-2 py-1 border">生徒名</th>
                  <th className="px-2 py-1 border">役割</th>
                  <th className="px-2 py-1 border">嫌いな生徒</th>
                </tr>
              </thead>
              <tbody>
                {team.students.map(student_pref => {
                    let leadership;
                    switch (student_pref.leader) {
                    case 8:
                        leadership = 'リーダー';
                        break;
                    case 3:
                        leadership = 'サブリーダー';
                        break;
                    default:
                        leadership = 'メンバー';
                    }
                    let conflict = false;
                    if (student_pref.student_dislikes && student_pref.student_dislikes.length > 0) {
                        // 数値の配列なので、dislikedStudentId として直接比較する
                        conflict = student_pref.student_dislikes.some(dislikedStudentId =>
                            teamStudentIds.includes(dislikedStudentId)
                        );
                    }
                    return (
                    <tr key={student_pref.id}>
                        <td className={`px-2 py-1 border ${student_pref.sex === 1 ? 'bg-blue-50' : 'bg-pink-50'}`}>{student_pref.name}</td>
                        <td className={`px-2 py-1 border ${student_pref.sex === 1 ? 'bg-blue-50' : 'bg-pink-50'}`}>{leadership}</td>
                        <td className={`px-2 py-1 border ${student_pref.sex === 1 ? 'bg-blue-50' : 'bg-pink-50'}`}>{conflict ? "あり" : "なし"}</td>
                    </tr>
                    );
                })}
            </tbody>
            </table>
          );

          return (
            <div key={team.team_id} className="bg-white rounded-lg shadow-md p-4">
              <h3 className="text-lg font-semibold mb-2">{team.name}</h3>
              <div className="pt-4">
                <RadarChart
                  label={`${team.name} の合計スコア`}
                  label_students={team.students}
                  data={team.aggregatedScores}
                  color={colors[colorIndex]}
                />
              </div>
              <div className="mt-4">
                <h4 className="font-semibold mb-2">生徒の不適合状況</h4>
                {studentDislikeTable}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}