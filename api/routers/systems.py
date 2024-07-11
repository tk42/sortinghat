from fastapi import APIRouter
from fastapi.responses import JSONResponse
from .graphql import client, gql


router = APIRouter(
    prefix="/systems",
    tags=["system"],
    include_in_schema=True
)


@router.get("/test_version", response_class=JSONResponse)
async def get_test_version():
    """
    :return: List[Dict]
    [
      {
        "id": 1,
        "is_applied": true,
        "tstamp": "2024-06-29T04:22:26.976814",
        "version_id": 0
      },
      {
        "id": 2,
        "is_applied": true,
        "tstamp": "2024-06-29T04:22:28.354794",
        "version_id": 1
      }
    ]
    """

    # Provide a GraphQL query
    query = gql(
        """
        query getDbVersion {
            goose_db_version {
                id
                is_applied
                tstamp
                version_id
            }
        }
        """
    )

    # Execute the query on the transport
    result = await client.execute_async(query)
    return result["goose_db_version"]
