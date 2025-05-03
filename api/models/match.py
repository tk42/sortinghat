from pydantic import BaseModel
from typing import Optional
from typing import List


class Student(BaseModel):
    student_no: int
    name: Optional[str]
    sex: int
    memo: Optional[str]


class Students(BaseModel):
    students: List[Student]


class StudentPreference(BaseModel):
    student_id: int
    # without sex
    previous_team: int
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
    student_dislikes: List[int]


class StudentPreferences(BaseModel):
    preferences: List[StudentPreference]


class StudentConstraint(BaseModel):
    # all fields are 0-indexed
    student_no: int | None
    dislikes: List[int] = []
    previous: int | None
    mi_a: int
    mi_b: int
    mi_c: int
    mi_d: int
    mi_e: int
    mi_f: int
    mi_g: int
    mi_h: int
    leader: int  # {1, 3, 8}
    eyesight: int  # {1, 3, 8}
    sex: int  # 0: male, 1: female


class Constraint(BaseModel):
    max_num_teams: int
    members_per_team: int | None = None
    at_least_one_pair_sex: bool = True
    girl_geq_boy: bool = False
    boy_geq_girl: bool = False
    at_least_one_leader: bool = False
    unique_previous: int | None = 1
    group_diff_coeff: float | None = 1.5


class MatchingRequest(BaseModel):
    student_constraints: List[StudentConstraint]
    constraint: Constraint
