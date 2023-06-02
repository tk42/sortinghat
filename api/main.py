import os
import logging
import traceback
import numpy as np
import pandas as pd
from scipy.sparse import lil_matrix
from gql import gql, Client

from pydantic import BaseModel
from fastapi import FastAPI

from gql.transport.requests import RequestsHTTPTransport
from ortools.linear_solver import pywraplp

GRAPHQL_API_ENDPOINT = os.environ.get("GRAPHQL_API_ENDPOINT")
assert GRAPHQL_API_ENDPOINT, "GRAPHQL_API_ENDPOINT is not set"

gql_client = Client(
    transport=RequestsHTTPTransport(
        url=GRAPHQL_API_ENDPOINT,
        use_json=True,
        headers={"Content-type": "application/json"},
        verify=False,
        retries=3,
    ),
    fetch_schema_from_transport=True,
)


app = FastAPI(
    title="Synergy Matchmaker",
    description="Synergy Matchmaker API",
    version="0.1.0",
    docs_url=None,
    redoc_url=None,
)

logger = logging.getLogger("uvicorn")


def eyesight_coeff(s):
    return 1.5 if s == "ES" else 1.0


class StudentFlavor(BaseModel):
    student_id: int | None
    dislikes: list[int] = []  # 0-indexed member number
    previous: int | None  # 0-indexed team number
    mi_a: int
    mi_b: int
    mi_c: int
    mi_d: int
    mi_e: int
    mi_f: int
    mi_g: int
    mi_h: int
    leader: int
    eyesight: int
    sex: int

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
    # 0: 誰とも互いに被らない
    # 1: 1人被ってもOK
    # 2: 2人被ってもOK
    previous_overlap: int = 1
    timeout: int = 60 * 2


@app.post("/solve")
async def solve(req: SolveRequest):
    try:
        # previous_survey = get_previous_survey(req.class_id)
        nmembers = len(req.flavors)
        if nmembers > req.max_team_num * 10:
            return {"error": "The number of member is too many than max_team_num. The ratio should be lower than 10"}
        team_num_n = 0
        while 999:
            q, r = divmod(nmembers + team_num_n, req.max_team_num)
            if r == 0 and q < 10:
                break
            team_num_n += 1
        else:
            return {"error": "Can't find team_num_n. Please check the number of member and max_team_num."}
        # team_num_m = (nmembers - team_num_n * (req.max_team_num - 1)) // req.max_team_num
        filled_team_num = int(np.ceil(nmembers / req.max_team_num))
        filled_member_num = filled_team_num * req.max_team_num
        remain = filled_member_num - nmembers

        # for debug
        # print(f"filled_team_num: {filled_team_num}")
        # print(f"nmembers: {nmembers}")
        # print(f"filled_member_num: {filled_member_num}")

        nfemales = sum([flavor.sex for flavor in req.flavors])

        dummy_flavors = [
            StudentFlavor(
                student_id=None,
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
                dislikes=[],  # dislike dummy each other
                previous=None,
                sex=(i + (1 if nfemales < (filled_member_num - nfemales) else 0)) % 2
                + 1,  # TODO: adjust the current num of boys and girls
            )
            for i in range(remain)
        ]

        flavors = [
            StudentFlavor(
                student_id=flavor.student_id,
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
                sex=flavor.sex + 1,
            )
            for flavor in req.flavors
        ] + dummy_flavors

        _dislikes = lil_matrix((filled_member_num, filled_member_num), dtype=int)
        for i, flavor in enumerate(flavors):
            for j in flavor.dislikes:
                _dislikes[i, j] = 1
        dislikes = _dislikes.toarray()

        previous_team_list = {k: [] for k in range(filled_team_num)}
        for i, flavor in enumerate(flavors):
            if not flavor.previous:
                continue
            previous_team_list[flavor.previous] += [i]

        _previous_team = lil_matrix((filled_member_num, filled_member_num), dtype=int)
        for j, l in previous_team_list.items():
            for i in l:
                _previous_team[i, j] = 1
        previous_team = _previous_team.toarray()

        members = list(range(filled_member_num))
        teams = list(range(filled_team_num))

        skills = ["A", "B", "C", "D", "E", "F", "G", "H", "L", "ES", "S"]

        array = np.array([flavor.to_array() for flavor in flavors]).T

        # for debug
        # print(f"array: {array}")
        # print(f"dislikes: {dislikes}")
        # print(f"previous_team: {previous_team}")

        s = np.array(array).shape
        s0 = np.array(dislikes).shape
        assert s[1] == s0[0], "The number of members and dislikes should be same."
        assert s0[0] == s0[1], "The dislikes should be square matrix."

        members = list(range(filled_member_num))
        teams = list(range(filled_team_num))

        scores = pd.DataFrame(array, index=skills, columns=list(range(filled_member_num))).T
        MAX_SCORE = int(max(scores.values.flatten()))
        MIN_SCORE = int(min(scores.values.flatten()))

        COEFF = 1.5

        solver = pywraplp.Solver.CreateSolver("SCIP")

        x = {}
        for i in members:
            for j in teams:
                x[i, j] = solver.IntVar(0, 1, f"Member{i} in Team{j}")

        y = {}
        # [0, 1]: 'min', 'max'
        for i in [0, 1]:
            for j in teams:
                y[i, j] = solver.IntVar(MIN_SCORE * req.max_team_num, MAX_SCORE * req.max_team_num, f"{i} of Team{j}")

        z = {}
        for i in [0, 1]:
            z[i] = solver.IntVar(
                MIN_SCORE * req.max_team_num * filled_team_num,
                MAX_SCORE * req.max_team_num * filled_team_num,
                f"{i} of All Teams",
            )

        logger.info(f"Number of variables = {solver.NumVariables()}")

        # Each member is assigned to exactly one team.
        for i in members:
            solver.Add(solver.Sum([x[i, j] for j in teams]) == 1)

        # Each team has exactly MEMBER_PER_TEAM members.
        for j in teams:
            solver.Add(solver.Sum([x[i, j] for i in members]) == req.max_team_num)

        # Each team doesn't have more than one leader.
        for j in teams:
            solver.Add(solver.Sum([x[i, j] for i in members if scores.loc[i, "L"] == 8]) <= 1)

        # Each team doesn't have more than one sub-leader.
        for j in teams:
            solver.Add(solver.Sum([x[i, j] for i in members if scores.loc[i, "L"] == 3]) <= 1)

        # Each team has at least one non-leader.
        for j in teams:
            solver.Add(solver.Sum([x[i, j] for i in members if scores.loc[i, "L"] == 1]) >= 1)

        # Each team has at least male and female.
        for j in teams:
            solver.Add(solver.Sum([x[i, j] for i in members if scores.loc[i, "S"] == 1]) >= 1)
            solver.Add(solver.Sum([x[i, j] for i in members if scores.loc[i, "S"] == 2]) >= 1)

        # Each team satisfies that member doesn't dislike another.
        for j in teams:
            for i in members:
                for k, v in enumerate(dislikes[i]):
                    if v > 0:
                        solver.Add(solver.Sum([x[i, j] + x[k, j]]) <= 1)

        # Each team satisfies that member doesn't contain in the previous team.
        for j in teams:
            for i in members:
                solver.Add(
                    solver.Sum([x[k, j] for (k, v) in enumerate(previous_team[i]) if v > 0]) <= req.previous_overlap
                )

        # Bad eye-sight members are assigned to within 3 teams.
        # print([1 if any([x[i, j] == 1 for i in members if scores.loc[i, "ES"] == 8]) else 0 for j in teams])
        bad_eye_sight_members = [i for i in members if scores.loc[i, "ES"] == 8]
        # print(bad_eye_sight_members) # 3, 6, 15, 19

        # (1,1,1,1,0,0,0,0,0) -> 0, (2,1,1,0,0,0,0,0,0) -> 1
        solver.Add(
            solver.Sum([1 if solver.Sum([x[i, j] for i in bad_eye_sight_members]) >= 2 else 0 for j in teams]) >= 1
        )

        # Total sum of scores of each team is within the range of min and max.
        nskills_mi8 = 8
        for j in range(filled_team_num):
            solver.Add(
                solver.Sum([x[i, j] * scores.iloc[i, s] for i in range(filled_member_num) for s in range(nskills_mi8)])
                >= z[0]
            )
            solver.Add(
                solver.Sum([x[i, j] * scores.iloc[i, s] for i in range(filled_member_num) for s in range(nskills_mi8)])
                <= z[1]
            )

            # Each sum of scores of each skill in each team is within the range of min and max.
            for s in range(nskills_mi8):
                solver.Add(
                    solver.Sum([x[i, j] * eyesight_coeff(s) * scores.iloc[i, s] for i in range(filled_member_num)])
                    >= y[0, j]
                )
                solver.Add(
                    solver.Sum([x[i, j] * eyesight_coeff(s) * scores.iloc[i, s] for i in range(filled_member_num)])
                    <= y[1, j]
                )

        logger.info(f"Number of constraints = {solver.NumConstraints()}")

        # Minimize sum for j (y[j,1]-y[j,0]) + 1.5*(z[1]-z[0]).
        objective = solver.Objective()
        for j in teams:
            objective.SetCoefficient(y[1, j], 1)
            objective.SetCoefficient(y[0, j], -1)
        objective.SetCoefficient(z[1], COEFF)
        objective.SetCoefficient(z[0], -1 * COEFF)
        objective.SetMinimization()

        # time limit
        solver.SetTimeLimit(req.timeout * 1000)
        try:
            status = solver.Solve()

            result = {}
            if status == pywraplp.Solver.OPTIMAL:
                logger.info("Optimal Solution:")
                logger.info(f"Objective value = {solver.Objective().Value()}")
                for i in members:
                    for j in teams:
                        if x[i, j].solution_value() > 0:
                            result[i] = j
                            logger.info(f"Member{i} in Team{j}")
            elif status == pywraplp.Solver.FEASIBLE:
                logger.info("Feasible Solution:")
                logger.info(f"Objective value = {solver.Objective().Value()}")
                for i in members:
                    for j in teams:
                        if x[i, j].solution_value() > 0:
                            result[i] = j
                            logger.info(f"Member{i} in Team{j}")
            else:
                # https://google.github.io/or-tools/python/ortools/linear_solver/pywraplp.html#Solver.OPTIMAL
                return {"error": f"The problem does not have an optimal solution. {status}"}
        except Exception as e:
            return {"error": str(e)}

        # remove dummy students
        if remain > 0:
            result = {k: v for k, v in result.items() if k in members[:-remain]}
        score_by_member = {j: [] for j in teams}
        result_by_team = score_by_member.copy()
        for member, score in scores.iterrows():
            if member not in result:
                continue
            score_by_member[result[member]] += [score]
        for k, v in score_by_member.items():
            result_by_team[k] = pd.DataFrame(v).sum()

        # TODO: put the result to database. surveys, teams, student_flavor, dislikes

        score_by_team = pd.DataFrame(result_by_team).T
        return {"score_by_team": score_by_team.to_dict(), "teams_by_member": result}
    except Exception as e:
        return {"error": str(e), "stacktrace": traceback.format_exc()}