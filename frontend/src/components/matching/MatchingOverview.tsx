import { MatchingResult } from '@/src/lib/interfaces'
import { RadarChart } from './RadarChart'

// チームごとにユニークな色を定義
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
    console.log("selectedMatching", selectedMatching);

    // 生徒データを team_id ごとにグループ化する
    const groupedTeams = selectedMatching.teams.reduce((acc, studentData) => {
        // studentData 例: { id: 59, team_id: 0, name: 'Team 0', student_preference: { mi_a: ..., ... } }
        const teamId = studentData.team_id;
        // まだキーがなければ初期化（チーム名は各レコードで同じ値になっている前提）
        if (!acc[teamId]) {
            acc[teamId] = {
                team_id: teamId,
                name: studentData.name,
                student_preferences: [] as any[],
                // 必要であれば生徒名も保持
                students: [] as string[],
            };
        }
        // student_preference が存在すれば配列に追加
        if (studentData.student_preferences) {
            acc[teamId].student_preferences.push(studentData.student_preferences);
        }
        // 生徒名を保持（もし student プロパティが存在する場合）
        if (studentData.student_preferences?.student!) {
            acc[teamId].students.push(studentData.student_preferences.student);
        }
        return acc;
    }, {} as Record<number, {
        team_id: number;
        name: string;
        student_preferences: any[];
        students: string[];
    }>);

    // オブジェクトを配列に変換
    const teamsArray = Object.values(groupedTeams);

    return (
        <div>
            <h2 className="text-xl font-semibold">マッチング結果</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                {teamsArray.map((team, index) => {
                    const colorIndex = index % colors.length;

                    // チーム内のすべての生徒の mi_a ～ mi_h の値を合算する
                    const aggregatedScores = team.student_preferences.reduce((acc, pref) => {
                        return [
                            acc[0] + (pref.mi_a || 0),
                            acc[1] + (pref.mi_b || 0),
                            acc[2] + (pref.mi_c || 0),
                            acc[3] + (pref.mi_d || 0),
                            acc[4] + (pref.mi_e || 0),
                            acc[5] + (pref.mi_f || 0),
                            acc[6] + (pref.mi_g || 0),
                            acc[7] + (pref.mi_h || 0),
                        ];
                    }, [0, 0, 0, 0, 0, 0, 0, 0]);

                    return (
                        <div key={team.team_id} className="bg-white rounded-lg shadow-md p-4">
                            <h3 className="text-lg font-semibold mb-2">{team.name}</h3>
                            <div className="pt-4">
                                <RadarChart
                                    label={`${team.name} の合計スコア`}
                                    label_students={team.students.map(s => s.name)}  // 生徒名のリスト
                                    data={aggregatedScores}
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