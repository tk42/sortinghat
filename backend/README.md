## Quickstart
For migration (or after the volume deleted)
```
docker compose -f docker-compose.autogen.yml up
```

For demo
```
docker compose up
```

and in Hasura UI push `Track All` button twice. one for tables/views and the other for foreign-keys. See more details [here](https://hasura.io/docs/latest/schema/postgres/using-existing-database/).

## Deploy (on CloudRun)
 1. Create a Cloud SQL instance (e.g. 'hasura' in ap-northeast1)
 1. Authorize Cloud SQL
```bash
gcloud auth configure-docker us-central1-docker.pkg.dev
```
 1. Create a repository in Google Artifact
 1. Pull the image
```bash
docker pull hasura/graphql-engine:v2.19.0.ubuntu.amd64
```
 1. Tag the docker image on Local PC
```bash
docker tag hasura/graphql-engine:v2.19.0.ubuntu.amd64 us-central1-docker.pkg.dev/synergy-matching/graphql/graphql-engine
```
 1. Push the image
```bash
docker push us-central1-docker.pkg.dev/synergy-matching/graphql/graphql-engine
```
 1. Set as following based on [here](https://github.com/hasura/graphql-engine/issues/2673#issuecomment-545182529)
  ```
  postgresql://<user>:<password>@/<database>?host=/cloudsql/<project>:<region>:<instance_name>
  ```
 1. for migration, add a network temp as [here](https://cloud.google.com/sql/docs/postgres/configure-ip)
 2. Test connection
  ```
  psql -h <CloudSQL IP> -p 5432 -U <User> -d <Database>
  ```
 1. Appendix. After create the schema, to recreate a new schema
  ```
  create schema public;
  grant usage on schema public to public;
  grant create on schema public to public;
  ```

  1. Appendix. Delete the schema (with all tables)
  ```
  DROP SCHEMA public CASCADE;
  ```

## Deploy (on GCE)
 1. Create a Container-Optimized instance on VM.
 2. Added docker-compose alias as follows;
 ```
 alias docker-compose='docker run --rm \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v "$(pwd):$(pwd)" \
  -w "$(pwd)" \
  docker compose'
 ```

## Migration
```
cd ./sqlc/schema
goose create alter_table_name sql
cd ../
docker-compose -f docker-compose.autogen.yml up
```
then edit the file in sqlc/schema/YYYYMMDD_alter_table_name.sql
See for more information [here](https://github.com/pressly/goose)


## Reference
 - [Cloud SQL Auth Proxy を使用して Cloud Run から Cloud SQL に接続する](https://blog.g-gen.co.jp/entry/from-cloudrun-to-cloud-sql-with-auth-proxy)
 - [Hasuraがめちゃくちゃ便利だよという話](https://qiita.com/maaz118/items/9e198ea91ad8fc624491)
 - [Hasuraを使ってみた](https://qiita.com/kyamamoto9120/items/e0f3f15dac9ff532e202)
 - [SELECT構文：JOINを使ってテーブルを結合する](https://rfs.jp/sb/sql/s03/03_3.html)