To push hasura image to GCR
```bash
gcloud auth configure-docker us-central1-docker.pkg.dev
docker pull hasura/graphql-engine:v2.19.0.ubuntu.amd64
docker tag hasura/graphql-engine:v2.19.0.ubuntu.amd64 us-central1-docker.pkg.dev/synergy-matching/graphql/graphql-engine
docker push us-central1-docker.pkg.dev/synergy-matching/graphql/graphql-engine
```
