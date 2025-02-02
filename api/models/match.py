from pydantic import BaseModel
from typing import Dict, List, Any


class StudentConstraint(BaseModel):
    student_no: int or None  # 0-indexed
    dislikes: list[int] = []  # 0-indexed member number
    previous: int or None  # 0-indexed team number
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
    members_per_team: int or None = None
    at_least_one_pair_sex: bool = True
    girl_geq_boy: bool = False
    boy_geq_girl: bool = False
    at_least_one_leader: bool = False
    unique_previous: bool = True
    group_diff_coeff: float or None = 1.5


class MatchingRequest(BaseModel):
    student_constraints: list[StudentConstraint]
    constraint: Constraint
