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

m = LpProblem() # 数理モデル
x = np.array(addbinvars(nmembers, nteams)) # 割当
y = np.array(addvars(nteams,2)) # チーム内の最小と最大
z = addvars(2) # チーム間の最小と最大
m += lpSum(y[:,1]-y[:,0]) + 1.5*(z[1]-z[0]) # 目的関数
for i in range(nmembers):
    m += lpSum(x[i]) == 1 # どこかのチームに所属
for j in range(nteams):
    m += lpDot(scores.sum(1),x[:,j]) >= z[0]
    m += lpDot(scores.sum(1),x[:,j]) <= z[1]
    for k in range(scores.shape[1]):
        m += lpDot(scores.iloc[:,k],x[:,j]) >= y[j,0]
        m += lpDot(scores.iloc[:,k],x[:,j]) <= y[j,1]
m.solve() # 求解

if m.status == 1:
    for i, xi in enumerate(np.vectorize(value)(x).tolist()):
        print((members[i], teams[xi.index(1)]))
else:
    print('最適解を得られなかった。')
