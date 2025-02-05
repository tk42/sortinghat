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

interface MatchingOverviewProps {
  selectedMatching: MatchingResult;
}

export function MatchingOverview({ selectedMatching }: MatchingOverviewProps) {
  // チームごとに生徒データを集計
  const teamsById = selectedMatching.teams.reduce((acc, teamData) => {
    const teamId = teamData.team_id;
    // チームがまだ登録されていなければ初期化
    if (!acc[teamId]) {
      acc[teamId] = {
        team_id: teamId,
        name: teamData.name, // 各レコードで同じチーム名になっている前提
        aggregatedScores: [0, 0, 0, 0, 0, 0, 0, 0], // mi_a ~ mi_h の合計値
        students: [] as { name: string; sex: number }[], // 生徒名のリスト
      };
    }
    const pref = teamData.student_preference;
    if (pref) {
      // 各 mi_x の値を合算（値がない場合は 0 を加算）
      acc[teamId].aggregatedScores[0] += pref.mi_a || 0;
      acc[teamId].aggregatedScores[1] += pref.mi_b || 0;
      acc[teamId].aggregatedScores[2] += pref.mi_c || 0;
      acc[teamId].aggregatedScores[3] += pref.mi_d || 0;
      acc[teamId].aggregatedScores[4] += pref.mi_e || 0;
      acc[teamId].aggregatedScores[5] += pref.mi_f || 0;
      acc[teamId].aggregatedScores[6] += pref.mi_g || 0;
      acc[teamId].aggregatedScores[7] += pref.mi_h || 0;
    }
    // 生徒名（または必要な情報）を追加
    if (pref && pref.student) {
      acc[teamId].students.push({
        name: pref.student.name,
        sex: pref.student.sex
      });
    }
    return acc;
  }, {} as Record<number, {
    team_id: number;
    name: string;
    aggregatedScores: number[];
    students: { name: string; sex: number }[];
  }>);

  // オブジェクトから配列に変換
  const teamsArray = Object.values(teamsById);

  return (
    <div>
      <h2 className="text-xl font-semibold">マッチング結果</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
        {teamsArray.map((team, index) => {
          const colorIndex = index % colors.length;

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
            </div>
          );
        })}
      </div>
    </div>
  );
}