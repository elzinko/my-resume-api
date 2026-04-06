# my-resume-api

Minimal Vercel serverless function that renders pages of [my-resume](https://github.com/elzinko/my-resume) to PDF using headless Chromium.

## Endpoint

```
GET /api/pdf?url=<encoded url>&format=A4&landscape=0
```

Only URLs hosted on `elzinko.github.io` or `localhost` are accepted.

## Deploy on Vercel

1. Go to https://vercel.com/new and import this repo (`elzinko/my-resume-api`).
2. Framework preset: **Other**.
3. Click **Deploy**. Vercel installs `@sparticuz/chromium` + `puppeteer-core` automatically.
4. The function URL will look like `https://my-resume-api.vercel.app/api/pdf`.

## Quick test

```bash
curl -o resume.pdf 'https://my-resume-api.vercel.app/api/pdf?url=https%3A%2F%2Felzinko.github.io%2Fmy-resume%2Ffr'
open resume.pdf
```

## Used by

[`job-app`](https://github.com/elzinko/job-app) calls this endpoint from `/api/offres/:id/cv-pdf-generate` and stores the resulting PDF in `public/cvs/cv-{hash}.pdf`.
