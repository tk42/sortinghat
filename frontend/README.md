This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app). Cretate with tailwind, daisyui & typescript 

Sample page fetching my medium feed rss to json, by creatig custom hooks 
<img width="1439" alt="Screenshot 2022-10-29 at 12 25 13" src="https://user-images.githubusercontent.com/43211197/198815505-41c1f50c-2381-490b-89cc-dd3de2d1d243.png">


## Getting Started
```bash
yarn create next-app -e https://github.com/skipfortoday/next13-tailwind-typescript-starter
```

First, run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.tsx`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/api-routes/introduction) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.ts`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

## TroubleShooting
### Azure AD secret key expired
```
AADSTS7000222: The provided client secret keys for app are expired
```

Read this [FAQ](https://learn.microsoft.com/en-us/answers/questions/1423875/aadsts7000222-the-provided-client-secret-keys-for)

Visit [here](https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps/ApplicationMenuBlade/~/Credentials/appId/bedd69c5-b865-4990-ac13-ac6548f93204/defaultBlade/Branding)


### Add user to Azure AD

[here](https://portal.azure.com/#view/Microsoft_AAD_IAM/ManagedAppMenuBlade/~/Users/objectId/b1d14f49-49c5-4c69-aa5d-428c07ef6421/appId/bedd69c5-b865-4990-ac13-ac6548f93204/preferredSingleSignOnMode~/null/servicePrincipalType/Application/fromNav/)
