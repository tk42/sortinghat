import numpy as np
import pandas as pd
from pulp import *
from ortoolpy import addvar, addvars, addbinvars

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
result = np.vectorize(value)(x)
print([teams[i] for i in (result@range(nteams)).astype(int)])