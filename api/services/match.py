import logging
from pulp import LpMaximize, LpProblem, LpVariable, lpSum, LpBinary, PULP_CBC_CMD, LpInteger

from models.match import StudentConstraint, Constraint

logger = logging.getLogger(__name__)


def calc_mi_score(students, teams):
    if teams is None:
        return None

    # スコアの合計を計算する
    categories = ["mi_a", "mi_b", "mi_c", "mi_d", "mi_e", "mi_f", "mi_g", "mi_h"]
    team_scores = {team: [0.0] * (len(categories)) for team in teams}

    for team, members in teams.items():
        for member in members:
            for i, cat in enumerate(categories):
                team_scores[team][i] += getattr(students[member], cat)

    return team_scores


def calc_sex_by_team(students, teams):
    if teams is None:
        return None

    # チーム毎の性別を計算する
    team_sexes = {team: [] for team in teams}
    for team, members in teams.items():
        for member in members:
            team_sexes[team].append(students[member].sex)
    return team_sexes


def calc_previous_by_team(students, teams):
    if teams is None:
        return None

    # チーム毎の前回のチームを計算する
    team_previous = {team: [] for team in teams}
    for team, members in teams.items():
        for member in members:
            team_previous[team].append(students[member].previous)
    return team_previous


def calc_dislikes_by_team(students, teams):
    if teams is None:
        return None

    # チーム毎の嫌いな生徒を計算する
    team_dislikes = {team: [] for team in teams}
    for team, members in teams.items():
        team_dislikes[team] = []
        for member in members:
            team_dislikes[team] += [students[member].dislikes]
    return team_dislikes


def matching(
    student_constraints: list[StudentConstraint],
    constraint: Constraint,
):
    try:
        # 最適化問題の定義
        prob = LpProblem("TeamMatching", LpMaximize)

        # 変数の定義（各生徒が各チームに所属するかどうか）
        x = {
            (i, t): LpVariable(f"x_{i}_{t}", cat=LpBinary)
            for i in range(len(student_constraints))
            for t in range(constraint.max_num_teams)
        }

        # チーム毎のスコアの上限・下限を表す変数
        categories = ["mi_a", "mi_b", "mi_c", "mi_d", "mi_e", "mi_f", "mi_g", "mi_h"]
        MAX_SCORE = max(max(getattr(s, cat) for cat in categories) for s in student_constraints)
        MIN_SCORE = min(min(getattr(s, cat) for cat in categories) for s in student_constraints)

        # y[0,j]とy[1,j]: チームjの各スキルに関する下限・上限
        y = {
            (i, j): LpVariable(
                f"y_{i}_{j}",
                lowBound=MIN_SCORE * constraint.members_per_team,
                upBound=MAX_SCORE * constraint.members_per_team,
                cat=LpInteger,
            )
            for i in [0, 1]
            for j in range(constraint.max_num_teams)
        }

        # z[0]とz[1]: 全チームの総スコアの下限・上限
        z = {
            i: LpVariable(
                f"z_{i}",
                lowBound=MIN_SCORE * constraint.members_per_team * constraint.max_num_teams,
                upBound=MAX_SCORE * constraint.members_per_team * constraint.max_num_teams,
                cat=LpInteger,
            )
            for i in [0, 1]
        }

        # 制約1：各生徒は1つのチームにのみ所属
        for i in range(len(student_constraints)):
            prob += lpSum(x[(i, t)] for t in range(constraint.max_num_teams)) == 1

        # 制約2：各チームの人数制限
        for t in range(constraint.max_num_teams):
            team_size = lpSum(x[(i, t)] for i in range(len(student_constraints)))
            if constraint.members_per_team:
                prob += team_size <= constraint.members_per_team
                prob += team_size >= constraint.members_per_team - 1

        # 制約3：各チームに少なくとも1人の男女がいる制約
        if constraint.at_least_one_pair_sex:
            for t in range(constraint.max_num_teams):
                # 少なくとも1人の男性
                prob += lpSum(
                    x[(i, t)]
                    for i in range(len(student_constraints))
                    if student_constraints[i].sex == 0
                ) >= 1
                # 少なくとも1人の女性
                prob += lpSum(
                    x[(i, t)]
                    for i in range(len(student_constraints))
                    if student_constraints[i].sex == 1
                ) >= 1

        # 制約4：女性の数が男性の数以上である制約
        if constraint.girl_geq_boy:
            for t in range(constraint.max_num_teams):
                prob += lpSum(
                    x[(i, t)]
                    for i in range(len(student_constraints))
                    if student_constraints[i].sex == 1
                ) >= lpSum(
                    x[(i, t)]
                    for i in range(len(student_constraints))
                    if student_constraints[i].sex == 0
                )

        # 制約5：男性の数が女性の数以上である制約
        if constraint.boy_geq_girl:
            for t in range(constraint.max_num_teams):
                prob += lpSum(
                    x[(i, t)]
                    for i in range(len(student_constraints))
                    if student_constraints[i].sex == 0
                ) >= lpSum(
                    x[(i, t)]
                    for i in range(len(student_constraints))
                    if student_constraints[i].sex == 1
                )

        # 制約6：各チームに少なくとも1人のリーダーがいる制約
        if constraint.at_least_one_leader:
            for t in range(constraint.max_num_teams):
                prob += lpSum(
                    x[(i, t)]
                    for i in range(len(student_constraints))
                    if student_constraints[i].leader == 8
                ) >= 1

        # 制約7：前回と同じチームにならない制約（緩和：2人まで許可）
        if constraint.unique_previous is not None:
            for t in range(constraint.max_num_teams):
                for prev_team in range(constraint.max_num_teams):
                    prob += lpSum(
                        x[(i, t)]
                        for i in range(len(student_constraints))
                        if student_constraints[i].previous == prev_team
                    ) <= constraint.unique_previous

        # 制約8：嫌いな生徒との割り当てを避ける
        for i in range(len(student_constraints)):
            for disliked in student_constraints[i].dislikes:
                if disliked < len(student_constraints):  # 有効な学生番号かチェック
                    for t in range(constraint.max_num_teams):
                        prob += x[(i, t)] + x[(disliked, t)] <= 1

        # チーム毎の総スコアに関する制約
        for t in range(constraint.max_num_teams):
            # 各スキルごとのスコア
            for s in range(len(categories)):
                team_skill = lpSum(
                    x[(i, t)] * getattr(student_constraints[i], categories[s])
                    for i in range(len(student_constraints))
                )
                prob += team_skill >= y[(0, t)]
                prob += team_skill <= y[(1, t)]

            # チーム全体のスコア
            team_total = lpSum(
                x[(i, t)] * sum(getattr(student_constraints[i], cat) for cat in categories)
                for i in range(len(student_constraints))
            )
            prob += team_total >= z[0]
            prob += team_total <= z[1]

        # 目的関数：チーム間のスコアの差を最小化
        objective = (
            lpSum(y[(1, t)] - y[(0, t)] for t in range(constraint.max_num_teams))
            + (z[1] - z[0])
        )
        
        # 視力が悪い学生をできるだけ一つのチームにまとめる「ソフト制約」
        # 1. eyesight が 3 または 8 の学生を対象とする
        group_indices = [
            i for i, s in enumerate(student_constraints) if s.eyesight in {3, 8}
        ]

        # 2. 対象学生の各ペア (i,j) について、チーム番号の差を表す補助変数 d[(i,j)] を導入
        d = {}
        for idx1 in range(len(group_indices)):
            for idx2 in range(idx1 + 1, len(group_indices)):
                i = group_indices[idx1]
                j = group_indices[idx2]
                # d[(i,j)] は非負の整数変数
                d[(i, j)] = LpVariable(f"d_{i}_{j}", lowBound=0, cat=LpInteger)
                
                # 各生徒の所属チーム番号は、∑_{t} t * x[(i,t)] で表現される
                # 以下の2制約で |team_i - team_j| <= d[(i,j)] を実現
                prob += lpSum(t * x[(i, t)] for t in range(constraint.max_num_teams)) - lpSum(t * x[(j, t)] for t in range(constraint.max_num_teams)) <= d[(i, j)]
                prob += lpSum(t * x[(j, t)] for t in range(constraint.max_num_teams)) - lpSum(t * x[(i, t)] for t in range(constraint.max_num_teams)) <= d[(i, j)]

        # 3. 目的関数にペナルティ項を追加
        # もともとの目的（チーム間のスコア差などを最小化する項）が定義されていると仮定して、その上に加えます。
        # ここで、各ペアのペナルティは (eyesight_i + eyesight_j) 倍となります。
        objective += - lpSum((student_constraints[i].eyesight + student_constraints[j].eyesight) * d[(i, j)] for (i, j) in d)
        
        # 解を探す
        prob += objective

        # 最適化問題を解く
        solver = PULP_CBC_CMD(msg=True, timeLimit=30)
        status = prob.solve(solver)

        # 結果の取得とログ出力
        logger.info(f"Optimization status: {status}")
        logger.info(f"Objective value: {prob.objective.value()}")

        teams = {t: [] for t in range(constraint.max_num_teams)}
        if status == 1:  # 最適解が見つかった場合
            for i in range(len(student_constraints)):
                for t in range(constraint.max_num_teams):
                    if x[(i, t)].value() > 0.5:  # バイナリ変数なので0.5以上を1とみなす
                        teams[t].append(i)
            return teams
        else:
            logger.error("No feasible solution found")
            return None

    except Exception as e:
        logger.error(f"Error in matching: {str(e)}")
        return None
