import numpy as np

raw = [
    [4,3,3,2,4,1,4,1,5,1,7,1,4,3,7,6,3,8,7,4,8,2,3,6,2,3,6], # A
    [3,3,6,3,6,3,1,5,2,5,7,4,4,2,8,8,6,8,6,5,8,4,4,8,4,7,6], # B
    [3,6,5,1,4,6,2,2,5,3,8,3,2,4,3,6,6,7,5,6,4,4,5,7,3,4,8], # C
    [1,2,4,1,6,5,1,5,2,2,7,4,3,2,4,5,4,5,5,5,4,2,7,6,5,4,7], # D
    [4,2,7,4,8,4,8,5,7,6,5,4,3,2,4,7,7,7,7,4,2,5,8,7,7,4,8], # E
    [1,2,5,2,6,4,3,6,6,5,5,4,5,1,7,5,5,7,5,5,4,3,5,6,8,3,7], # F
    [3,5,8,2,7,6,5,7,1,3,8,7,6,4,8,7,8,7,4,7,8,5,7,8,3,7,8], # G
    [4,7,5,2,8,5,3,6,8,4,8,5,7,3,7,6,8,7,6,8,3,2,8,8,7,4,8], # H
    [8,1,3,1,3,8,8,3,3,1,8,3,1,1,3,1,8,8,1,1,1,1,8,3,1,8,8], # Leader(+8), SubLeader(+3), Non-Leader(+1)
    [1,1,1,8,1,3,8,1,1,1,1,1,1,1,1,8,1,1,1,8,1,1,1,1,1,3,1], # eyesight
    [1,1,2,1,2,1,2,2,1,2,1,2,2,1,2,1,2,1,1,1,2,2,2,1,1,2,1], # sex. male(+1), female(+2)
]


s = np.array(raw).shape

nmembers = s[1]  # メンバー数
members = list(range(nmembers))

nteams = int(nmembers/MEMBER_PER_TEAM)  # チーム数
teams = list(range(nteams))

nskills = s[0]  # 能力種別数
skills = ['A', 'B', 'C', 'D', "E", "F", "G", "H", "L", "ES", "S"][:nskills]

print(f"nmembers: {nmembers}")
print(f"nteams: {nteams}")
print(f"nskills: {nskills}")

scores = pd.DataFrame(
    raw,
    index=skills,
    columns=members).T

from scipy.sparse import csr_matrix

def teams_score(ll: list):
  z = []
  tt = 0
  for l in ll:
    s = csr_matrix(([1,1,1], ([0,1,2], l)), shape=(3, 27)).toarray()@scores
    m = s.iloc[:,:8].values.flatten()
    y = int(max(m)) - int(min(m))
    tt += y
    z += [sum(m)]
  t = max(z) - min(z)

  return tt + 1.5*t

