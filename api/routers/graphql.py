import os
from gql import Client, gql
from gql.transport.aiohttp import AIOHTTPTransport

# Select your transport with a defined url endpoint
transport = AIOHTTPTransport(
    url=os.environ.get("GRAPHQL_API_ENDPOINT"),
    headers={
        "x-hasura-admin-secret": os.environ.get("HASURA_GRAPHQL_ADMIN_SECRET"),
        'content-type': 'application/json',
    }
)

# Create a GraphQL client using the defined transport
client = Client(
    transport=transport,
    fetch_schema_from_transport=True,
)

gql = gql
