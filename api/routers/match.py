from fastapi import APIRouter
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder

from models.match import MatchingRequest
from services.match import (
    matching,
    # calc_mi_score,
    # calc_sex_by_team,
    # calc_previous_by_team,
    # calc_dislikes_by_team,
    calc_student_no_by_team
)

router = APIRouter(prefix="/match", tags=["match"], include_in_schema=True)


@router.post("")
@router.post("/")
async def match(req: MatchingRequest):
    teams, _, error = matching(req.student_constraints, req.constraint)

    if teams is None:
        print(f"Error: {error}\nConstraint: {req.constraint}")
        return JSONResponse(
            status_code=400,
            content={"error": error}
        )

    # mi_score_by_team = calc_mi_score(req.student_constraints, teams)
    # sex_by_team = calc_sex_by_team(req.student_constraints, teams)
    # previous_by_team = calc_previous_by_team(req.student_constraints, teams)
    # dislikes_by_team = calc_dislikes_by_team(req.student_constraints, teams)
    student_no_by_team = calc_student_no_by_team(req.student_constraints, teams)

    return JSONResponse(
        status_code=200,
        content=jsonable_encoder(
            {
                # "students": req.student_constraints,
                "teams": student_no_by_team,  # 0-index
                # "mi_score_by_team": mi_score_by_team,
                # "sex_by_team": sex_by_team,
                # "previous_by_team": previous_by_team,
                # "dislikes_by_team": dislikes_by_team,
            }
        )
    )
