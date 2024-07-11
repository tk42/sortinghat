from pydantic import BaseModel
from typing import Optional
from datetime import datetime

from fastapi import APIRouter
from fastapi.responses import JSONResponse
from .graphql import client, gql


router = APIRouter(
    prefix="/users",
    tags=["users"],
    include_in_schema=True
)


class User(BaseModel):
    id: int
    name: Optional[str] = None
    family_name: Optional[str] = None
    given_name: Optional[str] = None
    school_id: Optional[int] = None
    email: str
    status: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    expired_at: Optional[datetime] = None


@router.post("/signin", response_class=JSONResponse)
async def signin(email: str) -> Optional[User]:
    """
    :return: User
    """

    # Provide a GraphQL query
    query = gql(
        """
        query getUser($email: String!) {
            teachers(limit:1, where: {email: {_eq: $email}}) {
              id
              name
              family_name
              given_name
              school_id
              email
              status
              created_at
              updated_at
              expired_at
            }
        }
        """
    )

    # Execute the query on the transport
    result = await client.execute_async(
        query,
        variable_values={"email": email}
    )

    users = result["teachers"]

    if len(users) == 0:
        return None

    return users[0]


@router.patch("/update", response_class=JSONResponse)
async def update(user: User) -> User:
    """
    :return: User
    """

    # Provide a GraphQL query
    query = gql(
        """
        mutation updateTeacher(
          $user_id: bigint!,
          $name: String,
          $family_name: String,
          $given_name: String,
          $school_id: bigint,
          $status: Int,
          $updated_at: timestamp,
        ) {
            update_teachers_by_pk(
              pk_columns: {id: $user_id}, 
              _set: {
                name: $name,
                family_name: $family_name,
                given_name: $given_name,
                school_id: $school_id,
                status: $status,
                updated_at: $updated_at
              }
            ) {
              id
              name
              family_name
              given_name
              school_id
              email
              status
              created_at
              updated_at
              expired_at
            }
        }
        """
    )

    # Execute the query on the transport
    result = await client.execute_async(
        query,
        variable_values={
            "user_id": user.id,
            "name": user.name,
            "family_name": user.family_name,
            "given_name": user.given_name,
            "school_id": user.school_id,
            "status": user.status,
            "updated_at": datetime.now().strftime('%Y-%m-%dT%H:%M:%S.%f') + 'Z'
        }
    )

    updated_user = result["update_teachers_by_pk"]

    return updated_user


@router.delete("/delete", response_class=JSONResponse)
async def delete(user_id: int) -> bool:
    """
    :return: bool
    """

    # Provide a GraphQL query
    query = gql(
        """
        mutation deleteUser(
          $user_id: bigint!,
        ) {
            delete_teachers_by_pk(
              id: $user_id
            ) {
                id
            }
        }
        """
    )

    # Execute the query on the transport
    result = await client.execute_async(
        query,
        variable_values={
            "user_id": user_id
        }
    )

    deleted_user = result["delete_teachers_by_pk"]

    if not deleted_user:
        return False

    return len(deleted_user) == 1
