"""OR-Tools solution to the N-queens problem."""
import sys
import time
import math
import ortools
import numpy as np
import pandas as pd

from ortools.sat.python import cp_model
from ortools.linear_solver import pywraplp

MEMBER_PER_TEAM = 3


# raw = [
#     [4,3,3,2,4,1,4,1,5,1,7,1,4,3,7,6,3,8,7,4,8,2,3,6,2,3,6], # A
#     [3,3,6,3,6,3,1,5,2,5,7,4,4,2,8,8,6,8,6,5,8,4,4,8,4,7,6], # B
#     [3,6,5,1,4,6,2,2,5,3,8,3,2,4,3,6,6,7,5,6,4,4,5,7,3,4,8], # C
#     [1,2,4,1,6,5,1,5,2,2,7,4,3,2,4,5,4,5,5,5,4,2,7,6,5,4,7], # D
#     [4,2,7,4,8,4,8,5,7,6,5,4,3,2,4,7,7,7,7,4,2,5,8,7,7,4,8], # E
#     [1,2,5,2,6,4,3,6,6,5,5,4,5,1,7,5,5,7,5,5,4,3,5,6,8,3,7], # F
#     [3,5,8,2,7,6,5,7,1,3,8,7,6,4,8,7,8,7,4,7,8,5,7,8,3,7,8], # G
#     [4,7,5,2,8,5,3,6,8,4,8,5,7,3,7,6,8,7,6,8,3,2,8,8,7,4,8], # H
#     [9,1,6,1,6,9,9,6,6,1,9,6,1,1,6,1,9,9,1,1,1,1,9,6,1,9,9], # Leader(+9), SubLeader(+3), Non-Leader(+1)
# ]


MEMBER_PER_TEAM = 2
raw = [
    [ 6,  2,  2,  3,  0,  2],
    [ 0, -1,  4,  4,  2,  3],
    [ 1,  3,  0,  5,  1, -1],
    [ 3,  5,  0,  0,  4,  1]
]

s = np.array(raw).shape

nmembers = s[1]  # メンバー数
members = list(range(nmembers))

nteams = int(nmembers/MEMBER_PER_TEAM)  # チーム数
teams = list(range(nteams))

nskills = s[0]  # 能力種別数
skills = ['A', 'B', 'C', 'D', "E", "F", "G", "H", "L"][:nskills]

print(f"nmembers: {nmembers}")
print(f"nteams: {nteams}")
print(f"nskills: {nskills}")

scores = pd.DataFrame(
    raw,
    index=skills,
    columns=members).T

print(scores)

MAX_SCORE = int(max(scores.values.flatten()))
MIN_SCORE = int(min(scores.values.flatten()))


def main():
    # Creates the solver.
    solver = pywraplp.Solver.CreateSolver('SCIP')

    x = {}
    for i in members:
        for j in teams:
            x[i, j] = solver.IntVar(0, 1, f'Member{i} in Team{j}')
    
    y = {}
    # [0, 1]: 'min', 'max'
    for i in [0, 1]:
        for j in teams:
            # y[i, j] = solver.IntVar(MIN_SCORE*nteams, MAX_SCORE*nteams, f'{i} of Team{j}')
            y[i, j] = solver.IntVar(MIN_SCORE*MEMBER_PER_TEAM, MAX_SCORE*MEMBER_PER_TEAM, f'{i} of Team{j}')
    
    z = {}
    for i in [0, 1]:
        # z[i] = solver.IntVar(MIN_SCORE*nteams, MAX_SCORE*nteams, f'{i} of All Teams')
        z[i] = solver.IntVar(MIN_SCORE*nteams, MAX_SCORE*nteams, f'{i} of All Teams')

    print('Number of variables =', solver.NumVariables())

    # Each member is assigned to exactly one team.
    for i in members:
        solver.Add(solver.Sum([x[i, j] for j in teams]) == 1)

    # Each team has exactly MEMBER_PER_TEAM members.
    for j in teams:
        solver.Add(solver.Sum([x[i, j] for i in members]) == MEMBER_PER_TEAM)
    
    # # Each team has exactly one leader.
    # for j in teams:
    #     solver.Add(solver.Sum([x[i, j] for i in members if scores.loc[i, "L"] == 9]) == 1)
    
    # # Each team has at least one subleader.
    # for j in teams:
    #     solver.Add(solver.Sum([x[i, j] for i in members if scores.loc[i, "L"] == 3]) >= 1)
    
    # # Each team has at least one non-leader.
    # for j in teams:
    #     solver.Add(solver.Sum([x[i, j] for i in members if scores.loc[i, "L"] == 1]) >= 1)
    
    # Total sum of scores of each team is within the range of min and max.
    for j in range(nteams):
        solver.Add(solver.Sum([x[i, j] * scores.iloc[i, s] for i in range(nmembers) for s in range(nskills)]) >= z[0])
        solver.Add(solver.Sum([x[i, j] * scores.iloc[i, s] for i in range(nmembers) for s in range(nskills)]) <= z[1])

        # Each sum of scores of each skill in each team is within the range of min and max.
        for s in range(nskills):
            solver.Add(solver.Sum([x[i, j] * scores.iloc[i, s] for i in range(nmembers)]) >= y[0, j])
            solver.Add(solver.Sum([x[i, j] * scores.iloc[i, s] for i in range(nmembers)]) <= y[1, j])

    print('Number of constraints =', solver.NumConstraints())

    # Minimize sum for j (y[j,1]-y[j,0]) + 1.5*(z[1]-z[0]).
    objective = solver.Objective()
    for j in teams:
        objective.SetCoefficient(y[1, j], 1)
        objective.SetCoefficient(y[0, j], -1)
    objective.SetCoefficient(z[1], 1.5)
    objective.SetCoefficient(z[0], -1.5)
    objective.SetMinimization()

    status = solver.Solve()

    if status == pywraplp.Solver.OPTIMAL:
        print('Solution:')
        print('Objective value =', solver.Objective().Value())
        for i in members:
            for j in teams:
                if x[i, j].solution_value() > 0:
                    print(f'Member{i} in Team{j}')
    else:
        print('The problem does not have an optimal solution.')

    print('\nAdvanced usage:')
    print('Problem solved in %f milliseconds' % solver.wall_time())
    print('Problem solved in %d iterations' % solver.iterations())
    print('Problem solved in %d branch-and-bound nodes' % solver.nodes())
    

if __name__ == '__main__':
    main()
