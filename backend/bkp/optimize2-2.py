import numpy as np
import pandas as pd
from pulp import *
from ortoolpy import addvar, addvars, addbinvars

MEMBER_PER_TEAM = 3

raw = [
    [4,3,3,2,4,1,4,1,5,1,7,1,4,3,7,6,3,8,7,4,8,2,3,6,2,3,6], # A
    [3,3,6,3,6,3,1,5,2,5,7,4,4,2,8,8,6,8,6,5,8,4,4,8,4,7,6], # B
    [3,6,5,1,4,6,2,2,5,3,8,3,2,4,3,6,6,7,5,6,4,4,5,7,3,4,8], # C
    [1,2,4,1,6,5,1,5,2,2,7,4,3,2,4,5,4,5,5,5,4,2,7,6,5,4,7], # D
    [4,2,7,4,8,4,8,5,7,6,5,4,3,2,4,7,7,7,7,4,2,5,8,7,7,4,8], # E
    [1,2,5,2,6,4,3,6,6,5,5,4,5,1,7,5,5,7,5,5,4,3,5,6,8,3,7], # F
    [3,5,8,2,7,6,5,7,1,3,8,7,6,4,8,7,8,7,4,7,8,5,7,8,3,7,8], # G
    [4,7,5,2,8,5,3,6,8,4,8,5,7,3,7,6,8,7,6,8,3,2,8,8,7,4,8], # H
    [9,1,3,1,3,9,9,3,3,1,9,3,1,1,3,1,9,9,1,1,1,1,9,3,1,9,9], # Leader(+9), SubLeader(+3), Non-Leader(+1)
]

# MEMBER_PER_TEAM = 2
# raw = [
#     [ 6,  2,  2,  3,  0,  2],
#     [ 0, -1,  4,  4,  2,  3],
#     [ 1,  3,  0,  5,  1, -1],
#     [ 3,  5,  0,  0,  4,  1]
# ]

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

# 平均偏差最小化

m = LpProblem()  # 数理モデル
x = pd.DataFrame(addbinvars(nmembers, nteams), index=members, columns=teams)  # 割当
y = pd.DataFrame(addvars(nteams, nskills), index=teams, columns=skills)  # チーム内の平均偏差
mu = pd.DataFrame(addvars(nteams), index=teams)   # チーム内の平均
z = pd.DataFrame(addvars(nteams), index=teams)  # チームごとの平均偏差
nu = addvar()  # 全チームの平均

m.setObjective(lpSum([lpSum(y.loc[j]) + 1.5*z.loc[j] for j in teams]))  # 目的関数

m.addConstraint(lpSum(np.dot(scores.sum(1), x)) / nteams == nu)
for j in teams:
    m.addConstraint(lpDot(scores.sum(1), x[j]) - nu <= z.loc[j])
    m.addConstraint(lpDot(scores.sum(1), x[j]) - nu >= -z.loc[j])
    m.addConstraint(lpSum(np.dot(x[j], scores)) / nskills == mu.loc[j])
    for k in skills:
        m.addConstraint(lpDot(scores[k], x[j]) - mu.loc[j] <= y.loc[j,k])
        m.addConstraint(lpDot(scores[k], x[j]) - mu.loc[j] >= -y.loc[j,k])
for i in members:
    m.addConstraint(lpSum(x.loc[i]) == 1)  # どこかのチームに所属

m.solve()  # 求解

if m.status == 1:
    for i, xi in enumerate(np.vectorize(value)(x).tolist()):
        print((members[i], teams[xi.index(1)]))
else:
    print('最適解を得られなかった。')
