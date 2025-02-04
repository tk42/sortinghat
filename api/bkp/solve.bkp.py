import logging
import traceback
import numpy as np
import pandas as pd
from scipy.sparse import lil_matrix

from pydantic import BaseModel
from fastapi import FastAPI

import pulp

app = FastAPI(
    title="Synergy Matchmaker",
    description="Synergy Matchmaker API",
    version="0.2.0",
    docs_url=None,
    redoc_url=None,
)

logger = logging.getLogger("uvicorn")


def eyesight_coeff(s):
    # s にはスキル名（例："ES"）が入ることを想定しているが，
    # OR‐Tools版では s は整数（0～7）となっているので，
    # ここではスキル名に変換する例を示す．
    # ※今回の使用では，s が 0～7 のときは常に 1.0 となる．
    skills = ["A", "B", "C", "D", "E", "F", "G", "H"]
    if s < len(skills) and skills[s] == "ES":
        return 1.5
    return 1.0


class StudentFlavor(BaseModel):
    # student_id はリクエストに必要な場合はコメントアウトを外す．
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

    def to_array(self):
        return [
            self.mi_a,
            self.mi_b,
            self.mi_c,
            self.mi_d,
            self.mi_e,
            self.mi_f,
            self.mi_g,
            self.mi_h,
            self.leader,
            self.eyesight,
            self.sex,
        ]


class SolveRequest(BaseModel):
    class_id: int
    max_team_num: int
    flavors: list[StudentFlavor]
    # previous_overlap
    # None: previous 判定を無効にする
    # 0: 誰とも互いに被らない
    # 1: 1人被ってもOK
    # 2: 2人被ってもOK
    previous_overlap: int | None = 1
    team_num_n: int | None = None
    max_leader: int | None = 1
    max_sub_leader: int | None = 1
    min_member: int | None = 1
    girl_geq_boy: bool = False
    boy_geq_girl: bool = False
    group_diff_coeff: float | None = 1.5
    timeout: int = 60 * 2


@app.post("/solve")
async def solve(req: SolveRequest):
    try:
        # logger.info(f"Request: {req}")

        nmembers = len(req.flavors)
        if nmembers > req.max_team_num * 10:
            return {
                "error": "The number of member is too many than max_team_num. The ratio should be lower than 10"
            }
        # チーム数の計算（必要なら team_num_n が指定される）
        filled_team_num = (
            req.team_num_n
            if req.team_num_n
            else int(np.ceil(nmembers / req.max_team_num))
        )
        filled_member_num = filled_team_num * req.max_team_num
        remain = filled_member_num - nmembers

        # ダミーメンバー（割り当て除外用）の作成
        dummy_flavors = [
            StudentFlavor(
                # student_id=None,
                mi_a=1,
                mi_b=1,
                mi_c=1,
                mi_d=1,
                mi_e=1,
                mi_f=1,
                mi_g=1,
                mi_h=1,
                leader=1,
                eyesight=1,
                dislikes=[],  # ダミー同士はお互いに嫌いとみなす
                previous=None,
                sex=3,  # 1: male, 2: female 以外
            )
        ] * remain

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
                sex=flavor.sex + 1,  # 0->1 (male), 1->2 (female)
            )
            for flavor in req.flavors
        ] + dummy_flavors

        # dislikes 行列の作成
        _dislikes = lil_matrix((filled_member_num, filled_member_num), dtype=int)
        for i, flavor in enumerate(flavors):
            for j in flavor.dislikes:
                _dislikes[i, j] = 1
        dislikes = _dislikes.toarray()

        # previous_team 行列の作成（previous_overlap が指定されている場合）
        if req.previous_overlap is not None:
            previous_team = np.zeros((filled_member_num, filled_member_num), dtype=int)
            previous_team_list = {k: [] for k in range(filled_team_num)}
            for i, flavor in enumerate(flavors):
                if flavor.previous is None:
                    continue
                previous_team_list[flavor.previous] += [i]
            for ll in previous_team_list.values():
                for i in ll:
                    for j in ll:
                        if i == j:
                            continue
                        previous_team[i, j] = 1

        members = list(range(filled_member_num))
        teams = list(range(filled_team_num))

        skills = ["A", "B", "C", "D", "E", "F", "G", "H", "L", "ES", "S"]

        # 各メンバーのスコア配列（列：各項目）を作成．
        array = np.array([flavor.to_array() for flavor in flavors]).T
        # DataFrame の各行がメンバー，列がスキル項目となる．
        scores = pd.DataFrame(array, index=skills, columns=list(range(filled_member_num))).T

        MAX_SCORE = int(scores.values.max())
        MIN_SCORE = int(scores.values.min())

        logger.info(f"Number of members: {filled_member_num}, teams: {filled_team_num}")

        # PuLP による MILP モデルの作成
        model = pulp.LpProblem("Synergy_Matchmaker", pulp.LpMinimize)

        # 変数定義
        # x[i,j] : メンバー i がチーム j に所属する（バイナリ変数）
        x = {
            (i, j): pulp.LpVariable(f"x_{i}_{j}", cat=pulp.LpBinary)
            for i in members
            for j in teams
        }

        # y[0,j] と y[1,j] : チーム j の各スキルに関する下限・上限（整数変数）
        y = {
            (i, j): pulp.LpVariable(
                f"y_{i}_{j}",
                lowBound=MIN_SCORE * req.max_team_num,
                upBound=MAX_SCORE * req.max_team_num,
                cat=pulp.LpInteger,
            )
            for i in [0, 1]
            for j in teams
        }

        # z[0] と z[1] : 全チームの総スコアの下限・上限（整数変数）
        z = {
            i: pulp.LpVariable(
                f"z_{i}",
                lowBound=MIN_SCORE * req.max_team_num * filled_team_num,
                upBound=MAX_SCORE * req.max_team_num * filled_team_num,
                cat=pulp.LpInteger,
            )
            for i in [0, 1]
        }

        # 悪い視力メンバーのチーム割当を判定するための補助変数 b[j]
        b = {
            j: pulp.LpVariable(f"b_{j}", cat=pulp.LpBinary) for j in teams
        }

        logger.info(f"Number of variables = {len(model.variables())}")

        # 各メンバーは必ず1チームに割り当て
        for i in members:
            model += pulp.lpSum(x[(i, j)] for j in teams) == 1

        # 各チームの人数は固定（max_team_num）
        for j in teams:
            model += pulp.lpSum(x[(i, j)] for i in members) == req.max_team_num

        # リーダー（leader==8）の人数制約
        if req.max_leader is not None:
            for j in teams:
                model += pulp.lpSum(
                    x[(i, j)] for i in members if scores.loc[i, "L"] == 8
                ) <= req.max_leader

        # サブリーダー（leader==3）の人数制約
        if req.max_sub_leader is not None:
            for j in teams:
                model += pulp.lpSum(
                    x[(i, j)] for i in members if scores.loc[i, "L"] == 3
                ) <= req.max_sub_leader

        # 非リーダー（leader==1）の最低人数制約
        if req.min_member is not None:
            for j in teams:
                model += pulp.lpSum(
                    x[(i, j)] for i in members if scores.loc[i, "L"] == 1
                ) >= req.min_member

        # 各チームは男女それぞれ1名以上いる（S: 1->male, 2->female）
        for j in teams:
            model += pulp.lpSum(
                x[(i, j)] for i in members if scores.loc[i, "S"] == 1
            ) >= 1
            model += pulp.lpSum(
                x[(i, j)] for i in members if scores.loc[i, "S"] == 2
            ) >= 1
            if req.girl_geq_boy:
                model += (
                    pulp.lpSum(x[(i, j)] for i in members if scores.loc[i, "S"] == 1)
                    - pulp.lpSum(x[(i, j)] for i in members if scores.loc[i, "S"] == 2)
                    <= 0
                )
            if req.boy_geq_girl:
                model += (
                    pulp.lpSum(x[(i, j)] for i in members if scores.loc[i, "S"] == 2)
                    - pulp.lpSum(x[(i, j)] for i in members if scores.loc[i, "S"] == 1)
                    <= 0
                )

        # 好き嫌い（dislikes）の制約：嫌い合う2人が同じチームに入らない
        for j in teams:
            for i in members:
                for k in range(filled_member_num):
                    if dislikes[i, k] > 0:
                        model += x[(i, j)] + x[(k, j)] <= 1

        # 前回チームの重複制約（previous_overlap が指定されている場合）
        if req.previous_overlap is not None:
            for j in teams:
                for i in members:
                    # メンバー i と同じ previous チームに属していたメンバーの合計
                    related = [
                        x[(k, j)]
                        for k in members
                        if req.previous_overlap is not None and
                        (('previous_team' in locals() and previous_team[i, k] > 0))
                    ]
                    if related:
                        model += pulp.lpSum(related) <= req.previous_overlap

        # 悪い視力（ES==8）のメンバーは，少なくとも1チームに2名以上割り当てる
        bad_eye_sight_members = [i for i in members if scores.loc[i, "ES"] == 8]
        for j in teams:
            bad_sum = pulp.lpSum(x[(i, j)] for i in bad_eye_sight_members)
            # b[j] = 1 なら bad_sum >= 2,  b[j] = 0 なら bad_sum <= 1 とする（Big-M法）
            model += bad_sum >= 2 * b[j]
            model += bad_sum <= req.max_team_num * b[j] + 1
        model += pulp.lpSum(b[j] for j in teams) >= 1

        # チーム毎の総スコアに関する制約
        # 各メンバーの 8 つのスキル（A～H）の合計
        total_skill = {
            i: sum(scores.iloc[i, s] for s in range(8)) for i in members
        }
        for j in teams:
            team_total = pulp.lpSum(total_skill[i] * x[(i, j)] for i in members)
            model += team_total >= z[0]
            model += team_total <= z[1]

            # 各スキルごとの合計（眼鏡補正あり）の制約
            for s in range(8):
                # ※sが 0～7 のとき eyesight_coeff は常に 1.0 となる
                team_skill = pulp.lpSum(
                    x[(i, j)] * eyesight_coeff(s) * scores.iloc[i, s]
                    for i in members
                )
                model += team_skill >= y[(0, j)]
                model += team_skill <= y[(1, j)]

        logger.info(f"Number of constraints = {len(model.constraints)}")

        # 目的関数の設定
        # 目的関数 : Σ_j (y[1,j] - y[0,j]) + group_diff_coeff*(z[1]-z[0])
        objective = (
            pulp.lpSum(y[(1, j)] - y[(0, j)] for j in teams)
            + req.group_diff_coeff * (z[1] - z[0])
        )
        model += objective

        # タイムリミット（秒単位）
        solver = pulp.PULP_CBC_CMD(timeLimit=req.timeout)
        result_status = model.solve(solver)
        status = pulp.LpStatus[model.status]
        logger.info(f"Solver status: {status}")

        result = {}
        if status in ("Optimal", "Feasible"):
            logger.info(f"Objective value = {pulp.value(model.objective)}")
            for i in members:
                for j in teams:
                    if pulp.value(x[(i, j)]) is not None and pulp.value(x[(i, j)]) > 0.5:
                        result[i] = j
                        logger.info(f"Member {i} in Team {j}")
        else:
            return {"error": f"The problem does not have an optimal solution. {status}"}

        # ダミーメンバーを結果から除外
        if remain > 0:
            result = {k: v for k, v in result.items() if k in members[:nmembers]}

        # score_by_member: チーム毎に各メンバーのスコアをまとめる
        score_by_member = {j: [] for j in teams}
        for member, score_row in scores.iterrows():
            if member not in result:
                continue
            score_by_member[result[member]].append(score_row.to_dict())

        # member_by_team: チーム毎に所属するメンバー番号をまとめる
        member_by_team = {j: [] for j in teams}
        for member, team in result.items():
            member_by_team[team].append(member)

        # 結果の返却（DBへの登録等は各自実装）
        return {
            "score_by_member": score_by_member,
            "teams_by_member": result,
            "member_by_team": member_by_team,
        }
    except Exception as e:
        return {"error": str(e), "stacktrace": traceback.format_exc()}