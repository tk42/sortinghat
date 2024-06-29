import numpy as np
from pydantic import BaseModel
from typing import Dict, List, Any

from fastapi import FastAPI
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

from pulp import LpMaximize, LpProblem, LpVariable, lpSum, LpBinary, PULP_CBC_CMD


app = FastAPI(
    title="Synergy Matchmaker",
    description="Synergy Matchmaker API",
    version="0.3.0",
    docs_url=None,
    redoc_url=None,
)


class StudentFlavor(BaseModel):
    # TODO: comment out student_id which is needed in request also
    # student_id: int | None
    dislikes: list[int] = []  # 0-indexed member number
    previous: int | None  # 0-indexed team number
    mi_a: int  # 1-indexed
    mi_b: int  # 1-indexed
    mi_c: int  # 1-indexed
    mi_d: int  # 1-indexed
    mi_e: int  # 1-indexed
    mi_f: int  # 1-indexed
    mi_g: int  # 1-indexed
    mi_h: int  # 1-indexed
    leader: int  # 1, 3, 8
    eyesight: int  # 1, 3, 8
    sex: int  # 0: male, 1: female


class Constraint(BaseModel):
    max_num_teams: int
    members_per_team: int | None = None
    at_least_one_pair_sex: bool = True
    girl_geq_boy: bool = False
    boy_geq_girl: bool = False
    at_least_one_leader: bool = False
    unique_previous: bool = True
    group_diff_coeff: float | None = 1.5


class SolveRequest(BaseModel):
    class_uuid: str
    flavors: list[StudentFlavor]
    constraint: Constraint
    timeout: int = 10


# CORSの設定 for local
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 実際の使用では特定のオリジンを指定した方が安全です
    allow_credentials=True,
    allow_methods=[
        "*"
    ],  # GET, POST, PUT, DELETEなど必要なメソッドに限定することを推奨します
    allow_headers=["*"],
)


# leader_map = {
#     "その他": 1,
#     "サブリーダー": 3,
#     "リーダー": 8,
# }

# eyesight_map = {
#     "どこでもいいよ": 1,
#     "できれば前がいいな": 3,
#     "絶対に前がいいです": 8,
# }

# files_to_zip = ["check_team.png", "check_mi_score.png"]
# zip_filename = "files.zip"


# def create_zip_file(files: list, zip_filename: str):
#     with zipfile.ZipFile(zip_filename, "w") as zipf:
#         for file in files:
#             zipf.write(file, os.path.basename(file))
#     return zip_filename


# def savepng_check_team(students, teams):
#     # データフレームの作成
#     data = []
#     for team_id, members in teams.items():
#         for member_id in members:
#             student = students[member_id]
#             data.append(
#                 {
#                     "Team": team_id + 1,
#                     "Member ID": member_id + 1,
#                     "Sex": "Female" if student["sex"] == 1 else "Male",
#                     "Role": (
#                         "Leader"
#                         if student["leader"] == 8
#                         else ("Sub-leader" if student["leader"] == 3 else "Member")
#                     ),
#                     "Dislikes": ", ".join(map(str, np.array(student["dislikes"]) + 1)),
#                     "Previous Team": student["previous"]
#                     + 1,  # 前回のチーム情報（人が読めるように+1しています）
#                 }
#             )

#     df = pd.DataFrame(data)

#     # 色の定義
#     team_colors = [
#         "#FFCCCC",
#         "#CCCCFF",
#         "#CCFFCC",
#         "#FFFF99",
#         "#FFCC99",
#         "#99CCFF",
#         "#FF99FF",
#         "#CC99FF",
#     ]  # 8色定義
#     sex_colors = {
#         "Male": "#ADD8E6",
#         "Female": "#FFB6C1",
#     }  # 男: Light Blue, 女: Light Pink

#     # 表の表示
#     fig, ax = plt.subplots(figsize=(14, 10))
#     ax.axis("tight")
#     ax.axis("off")

#     table = ax.table(
#         cellText=df.values,
#         colLabels=df.columns,
#         cellLoc="center",
#         loc="center",
#         cellColours=[["#ffffff" for _ in df.columns] for row in df.to_dict("records")],
#     )

#     # チームと性別による色分け
#     cells = table.get_celld()
#     for (row_idx, col_idx), cell in cells.items():
#         if row_idx == 0:
#             continue  # ヘッダー行を無視
#         row = df.iloc[row_idx - 1]
#         if col_idx in [0, 1, 3, 4]:  # Team 列
#             cell.set_facecolor(team_colors[(row["Team"] - 1) % len(team_colors)])
#         elif col_idx == 2:  # Sex 列
#             cell.set_facecolor(sex_colors[row["Sex"]])
#         elif col_idx == 5:  # Previous Team 列
#             cell.set_facecolor(
#                 team_colors[(row["Previous Team"] - 1) % len(team_colors)]
#             )
#         cell.set_edgecolor("black")
#         cell.set_text_props(weight="bold")

#     # plt.show()
#     plt.savefig("check_team.png")


def calc_dislikes_by_team(students, teams):
    # チーム毎の嫌いな生徒を計算する
    team_dislikes = {team: [] for team in teams}
    for team, members in teams.items():
        team_dislikes[team] = []
        for member in members:
            team_dislikes[team] += [students[member]["dislikes"]]
    return team_dislikes


def calc_previous_by_team(students, teams):
    # チーム毎の前回のチームを計算する
    team_previous = {team: [] for team in teams}
    for team, members in teams.items():
        for member in members:
            team_previous[team].append(students[member]["previous"])
    return team_previous


def calc_sex_by_team(students, teams):
    # チーム毎の性別を計算する
    team_sexes = {team: [] for team in teams}
    for team, members in teams.items():
        for member in members:
            team_sexes[team].append(students[member]["sex"])
    return team_sexes


def calc_mi_score(students, teams):
    # スコアの合計を計算する
    categories = ["mi_a", "mi_b", "mi_c", "mi_d", "mi_e", "mi_f", "mi_g", "mi_h"]
    team_scores = {team: [0.0] * (len(categories)) for team in teams}

    for team, members in teams.items():
        for member in members:
            for i, cat in enumerate(categories):
                team_scores[team][i] += students[member][cat]

    return team_scores


# def savepng_check_mi(students, teams):
#     # スコアの合計を計算する
#     categories = ["mi_a", "mi_b", "mi_c", "mi_d", "mi_e", "mi_f", "mi_g", "mi_h"]
#     team_scores = {team: np.zeros(len(categories)) for team in teams}

#     for team, members in teams.items():
#         for member in members:
#             for i, cat in enumerate(categories):
#                 team_scores[team][i] += students[member][cat]

#     # データフレームに変換
#     df = pd.DataFrame(team_scores).T
#     df.columns = categories

#     # レーダーチャートを描く関数
#     def plot_radar_chart(df, title, ax):
#         labels = np.array(df.columns)
#         num_vars = len(labels)

#         # 角度を計算
#         angles = np.linspace(0, 2 * np.pi, num_vars, endpoint=False).tolist()
#         angles += angles[:1]  # 最初の角度を最後に追加してリストを閉じる

#         # データフレームの各行に最初の要素を追加してリストを閉じる
#         df = pd.concat([df, df.iloc[:, [0]]], axis=1)

#         # チャートを描画
#         ax.set_theta_offset(np.pi / 2)
#         ax.set_theta_direction(-1)
#         ax.plot(angles, df.iloc[0], linewidth=1, linestyle="solid", label=title)
#         ax.fill(angles, df.iloc[0], "b", alpha=0.1)
#         ax.set_xticks(angles[:-1])
#         ax.set_xticklabels(labels)
#         ax.set_title(title, position=(0.5, 1.1))

#     # サブプロットの設定
#     num_teams = len(teams)
#     fig, axs = plt.subplots(
#         figsize=(10, 12),
#         subplot_kw=dict(polar=True),
#         nrows=(num_teams - 1) // 3 + 1,
#         ncols=3,
#     )
#     axs = axs.flatten() if num_teams > 1 else [axs]  # 単一または複数の軸を一貫して扱う

#     # 各チームのレーダーチャートを描画
#     for i, ax in enumerate(axs[:num_teams]):
#         plot_radar_chart(df.iloc[[i]], f"Team {i+1}", ax)

#     # 余分な軸を非表示にする
#     for ax in axs[num_teams:]:
#         ax.axis("off")

#     plt.tight_layout()  # グラフ間のスペースを調整
#     # plt.show()
#     plt.savefig("check_mi_score.png")


def find_teams(
    students: List[Dict[str, Any]],
    num_teams: int,
    min_team_size: int,
    max_team_size: int,
    at_least_one_pair_sex: bool = True,
    girl_geq_boy: bool = False,
    boy_geq_girl: bool = False,
    at_least_one_leader: bool = False,
    unique_previous: bool = True,
):

    # 問題の初期化
    model = LpProblem("Team_Assignment", LpMaximize)

    # 変数の定義（各生徒が各チームに所属するかどうか）
    x = {
        i: {t: LpVariable(f"x_{i}_{t}", cat=LpBinary) for t in range(num_teams)}
        for i in range(len(students))
    }

    # 制約の追加
    # 各生徒は1つのチームにのみ所属
    for i in range(len(students)):
        model += lpSum(x[i][t] for t in range(num_teams)) == 1

    # 各チームの人数制限（最少3人、最大4人）
    for t in range(num_teams):
        model += lpSum(x[i][t] for i in range(len(students))) <= max_team_size
        model += lpSum(x[i][t] for i in range(len(students))) >= min_team_size

    # 各チームに少なくとも1人の男女がいる制約
    if at_least_one_pair_sex:
        for t in range(num_teams):
            model += (
                lpSum(x[i][t] for i in range(len(students)) if students[i]["sex"] == 0)
                >= 1
            )
            model += (
                lpSum(x[i][t] for i in range(len(students)) if students[i]["sex"] == 1)
                >= 1
            )

    # 女性の数が男性の数以上である制約
    if girl_geq_boy:
        for t in range(num_teams):
            model += lpSum(
                x[i][t] for i in range(len(students)) if students[i]["sex"] == 1
            ) >= lpSum(x[i][t] for i in range(len(students)) if students[i]["sex"] == 0)

    # 男性の数が女性の数以上である制約
    if boy_geq_girl:
        for t in range(num_teams):
            model += lpSum(
                x[i][t] for i in range(len(students)) if students[i]["sex"] == 0
            ) >= lpSum(x[i][t] for i in range(len(students)) if students[i]["sex"] == 1)

    # 嫌いな生徒との割り当てを避ける制約
    for i in range(len(students)):
        for disliked in students[i]["dislikes"]:
            for t in range(num_teams):
                model += (
                    x[i][t] + x[disliked][t] <= 1
                )  # この制約により、iとdislikedが同じチームになることはない

    # 各チームには多くとも1人のリーダー（leader: 8がリーダー希望）
    if at_least_one_leader:
        for t in range(num_teams):
            model += (
                lpSum(
                    x[i][t] for i in range(len(students)) if students[i]["leader"] == 8
                )
                <= 1
            )

    # 過去のチームメンバーと重複しない制約
    if unique_previous:
        for i in range(len(students)):
            previous_team = students[i]["previous"]  # previousは0-indexedに調整
            model += x[i][previous_team] == 0

    # 問題の解決
    model.solve(PULP_CBC_CMD(msg=0))

    # 割り当て結果の表示
    teams = {t: [] for t in range(num_teams)}
    for i in range(len(students)):
        for t in range(num_teams):
            if x[i][t].value() == 1:
                teams[t].append(i)

    return teams


@app.post("/solve")
async def solve(req: SolveRequest):
    nmembers = len(req.flavors)
    if nmembers > req.constraint.members_per_team * 10:
        return {
            "error": "The number of member is too many than max_team_num. Each team should have at most 10 members."
        }

    max_num_teams = (
        req.constraint.max_num_teams
        if req.constraint.max_num_teams
        else int(np.ceil(nmembers / req.constraint.members_per_team))
    )

    flavors = [
        StudentFlavor(
            # student_id=flavor.student_id,
            mi_a=flavor.mi_a,
            mi_b=flavor.mi_b,
            mi_c=flavor.mi_c,
            mi_d=flavor.mi_d,
            mi_e=flavor.mi_e,
            mi_f=flavor.mi_f,
            mi_g=flavor.mi_g,
            mi_h=flavor.mi_h,
            leader=flavor.leader,
            eyesight=flavor.eyesight,
            dislikes=flavor.dislikes,
            previous=flavor.previous,
            sex=flavor.sex,
        )
        for flavor in req.flavors
    ]

    indexes = list(range(len(flavors)))

    # print(indexes)

    keys = [
        "sex",
        "previous",
        "mi_a",
        "mi_b",
        "mi_c",
        "mi_d",
        "mi_e",
        "mi_f",
        "mi_g",
        "mi_h",
        "leader",
        "eyesight",
        "dislikes",
    ]

    students = []
    for index in indexes:
        record = {}
        for key in keys:
            v = getattr(flavors[index], key)
            # print(v, key, index)

            record[key] = v
        students.append(record)

    # 結果の出力
    # print(students)

    teams = find_teams(
        students,
        max_num_teams,
        req.constraint.members_per_team - 1,
        req.constraint.members_per_team,
        req.constraint.at_least_one_pair_sex,
        req.constraint.girl_geq_boy,
        req.constraint.boy_geq_girl,
        req.constraint.at_least_one_leader,
        req.constraint.unique_previous,
    )

    # print(teams)

    mi_score_by_team = calc_mi_score(students, teams)
    sex_by_team = calc_sex_by_team(students, teams)
    previous_by_team = calc_previous_by_team(students, teams)
    dislikes_by_team = calc_dislikes_by_team(students, teams)

    return JSONResponse(
        content={
            "students": students,
            "teams": teams,  # 0-index
            "mi_score_by_team": mi_score_by_team,
            "sex_by_team": sex_by_team,
            "previous_by_team": previous_by_team,
            "dislikes_by_team": dislikes_by_team,
        }
    )
