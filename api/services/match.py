import cvxpy as cp

from models.match import StudentConstraint, Constraint


def calc_mi_score(students, teams):
    # スコアの合計を計算する
    categories = ["mi_a", "mi_b", "mi_c", "mi_d", "mi_e", "mi_f", "mi_g", "mi_h"]
    team_scores = {team: [0.0] * (len(categories)) for team in teams}

    for team, members in teams.items():
        for member in members:
            for i, cat in enumerate(categories):
                team_scores[team][i] += getattr(students[member], cat)

    return team_scores


def calc_sex_by_team(students, teams):
    # チーム毎の性別を計算する
    team_sexes = {team: [] for team in teams}
    for team, members in teams.items():
        for member in members:
            team_sexes[team].append(students[member].sex)
    return team_sexes


def calc_previous_by_team(students, teams):
    # チーム毎の前回のチームを計算する
    team_previous = {team: [] for team in teams}
    for team, members in teams.items():
        for member in members:
            team_previous[team].append(students[member].previous)
    return team_previous


def calc_dislikes_by_team(students, teams):
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
    # 変数の定義（各生徒が各チームに所属するかどうか）
    x = {
        i: {t: cp.Variable(boolean=True) for t in range(constraint.max_num_teams)}
        for i in range(len(student_constraints))
    }

    # 制約のリスト
    constraints = []

    # 各生徒は1つのチームにのみ所属
    for i in range(len(student_constraints)):
        constraints.append(
            cp.sum([x[i][t] for t in range(constraint.max_num_teams)]) == 1
        )

    # 各チームの人数制限（最少3人、最大4人）
    for t in range(constraint.max_num_teams):
        team_size = cp.sum([x[i][t] for i in range(len(student_constraints))])
        constraints.append(team_size <= constraint.members_per_team)
        constraints.append(team_size >= constraint.members_per_team - 1)

    # 各チームに少なくとも1人の男女がいる制約
    if constraint.at_least_one_pair_sex:
        for t in range(constraint.max_num_teams):
            # 少なくとも1人の男性
            constraints.append(
                cp.sum(
                    [
                        x[i][t]
                        for i in range(len(student_constraints))
                        if student_constraints[i].sex == 0
                    ]
                )
                >= 1
            )
            # 少なくとも1人の女性
            constraints.append(
                cp.sum(
                    [
                        x[i][t]
                        for i in range(len(student_constraints))
                        if student_constraints[i].sex == 1
                    ]
                )
                >= 1
            )

    # 女性の数が男性の数以上である制約
    if constraint.girl_geq_boy:
        for t in range(constraint.max_num_teams):
            constraints.append(
                cp.sum(
                    [
                        x[i][t]
                        for i in range(len(student_constraints))
                        if student_constraints[i].sex == 1
                    ]
                )
                >= cp.sum(
                    [
                        x[i][t]
                        for i in range(len(student_constraints))
                        if student_constraints[i].sex == 0
                    ]
                )
            )

    # 男性の数が女性の数以上である制約
    if constraint.boy_geq_girl:
        for t in range(constraint.max_num_teams):
            constraints.append(
                cp.sum(
                    [
                        x[i][t]
                        for i in range(len(student_constraints))
                        if student_constraints[i].sex == 0
                    ]
                )
                >= cp.sum(
                    [
                        x[i][t]
                        for i in range(len(student_constraints))
                        if student_constraints[i].sex == 1
                    ]
                )
            )

    # 嫌いな生徒との割り当てを避ける制約
    for i in range(len(student_constraints)):
        for disliked in student_constraints[i].dislikes:
            for t in range(constraint.max_num_teams):
                constraints.append(x[i][t] + x[disliked][t] <= 1)

    # 各チームには多くとも1人のリーダー（leader: 8がリーダー希望）
    if constraint.at_least_one_leader:
        for t in range(constraint.max_num_teams):
            constraints.append(
                cp.sum(
                    [
                        x[i][t]
                        for i in range(len(student_constraints))
                        if student_constraints[i].leader == 8
                    ]
                )
                <= 1
            )

    # 過去のチームメンバーと重複しない制約
    if constraint.unique_previous:
        for i in range(len(student_constraints)):
            previous_team = student_constraints[i].previous  # previousは0-indexedに調整
            constraints.append(x[i][previous_team] == 0)

    # 問題を解くためのダミーの目的関数（最大化）
    objective = cp.Maximize(0)  # 目的関数は最大化に設定

    # 問題の定義と解決
    problem = cp.Problem(objective, constraints)

    # 問題の解決
    try:
        problem.solve()
        print("Optimal solution found")
    except cp.error.SolverError as e:
        print(f"Solver failed: {e}")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")

    # 割り当て結果の表示
    teams = {t: [] for t in range(constraint.max_num_teams)}
    for i in range(len(student_constraints)):
        for t in range(constraint.max_num_teams):
            if x[i][t].value == 1:
                teams[t].append(i)

    return teams
