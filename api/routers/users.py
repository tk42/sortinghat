import json

from pydantic import BaseModel
from typing import Optional
from datetime import datetime

from fastapi import APIRouter, HTTPException, status
from fastapi.responses import JSONResponse
from .graphql import client, gql

from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


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
    password: Optional[str] = None
    status: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    expired_at: Optional[datetime] = None


class SignInEndpoint(BaseModel):
    email: str
    password: str


class UpdatePasswordEndpoint(BaseModel):
    user_id: int
    old_password: str
    new_password: str


def verify(password: str, hashed: str):
    salt = hashed[7:29]
    return hashed == pwd_context.hash(password, salt=salt)


@router.post("/signin", response_class=JSONResponse)
async def signin(item: SignInEndpoint) -> Optional[User]:
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
              password
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
        variable_values={"email": item.email}
    )

    users = result["teachers"]

    if len(users) != 1:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No user by the email"
        )

    user = users[0]

    if not verify(item.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Unauthorized"
        )

    return User(**{k: v for k, v in user.items() if k != 'password'})


@router.post("/password", response_class=JSONResponse)
async def update_password(item: UpdatePasswordEndpoint) -> bool:
    """
    :return: User
    """

    query = gql(
        """
        query getPassword($user_id: bigint!) {
            teachers_by_pk(id: $user_id) {
              id
              password
            }
        }
        """
    )

    # Execute the query on the transport
    result = await client.execute_async(
        query,
        variable_values={"user_id": item.user_id}
    )

    user = result["teachers_by_pk"]

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No user by the email"
        )

    if not verify(item.old_password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Unauthorized by the old password"
        )

    encrypted_password = pwd_context.hash(item.new_password)

    query = gql(
        """
        mutation updateTeacher(
          $user_id: bigint!,
          $encrypted_password: String,
          $updated_at: timestamp,
        ) {
            update_teachers_by_pk(
              pk_columns: {id: $user_id}, 
              _set: {
                password: $encrypted_password,
                updated_at: $updated_at
              }
            ) {
              id
              password
              updated_at
            }
        }
        """
    )

    # Execute the query on the transport
    result = await client.execute_async(
        query,
        variable_values={
            "user_id": item.user_id,
            "encrypted_password": encrypted_password,
            "updated_at": datetime.now().strftime('%Y-%m-%dT%H:%M:%S.%f') + 'Z'
        }
    )

    try:
        updated_user = result["update_teachers_by_pk"]
    except:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Unauthorized by unknown reason"
        )

    return True


@router.patch("/user", response_class=JSONResponse)
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


@router.delete("/user", response_class=JSONResponse)
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
