This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Online OpenAPI Generator
1. Export Swagger JSON into a file on your drive. This JSON should be published on your server at the following URI: /swagger/docs/v1
1. Go to http://editor.swagger.io/#/
1. On the top left corner, select File-> Import File... Point to the local Swagger JSON file you exported in step #1 to open in the Swagger Editor

[Online OpenAPI Generator](https://api.openapi-generator.tech/index.html)


```
$ GENERATOR=
$ docker run --rm -v ${PWD}:/local openapitools/openapi-generator-cli generate -i /local/petstore.yaml -g ${GENERATOR} -o /local/out/${GENERATOR}
```
