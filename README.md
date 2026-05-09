# my-resume-api

Minimal Vercel serverless function that renders pages of [my-resume](https://github.com/elzinko/my-resume) to PDF using headless Chromium.

## Endpoint

```
GET /api/pdf?url=<encoded url>&format=A4&landscape=0
```

The target URL is filtered against an allowlist of hostnames. Only `http`/`https` URLs are accepted.

## Configuration

### `ALLOWED_HOSTS` (env var)

Comma-separated list of allowed hostnames. Configure it in **Vercel → Project → Settings → Environment Variables**.

```
ALLOWED_HOSTS=elzinko.fr,www.elzinko.fr,elzinko.github.io,localhost,127.0.0.1
```

Wildcards are supported as a leading label: `*.example.com` matches `sub.example.com` but **not** `example.com` itself. The protocol is always restricted to `http`/`https` regardless of the allowlist.

If `ALLOWED_HOSTS` is unset, falls back to a hardcoded safe default (`elzinko.fr`, `www.elzinko.fr`, `elzinko.github.io`, `localhost`, `127.0.0.1`). Adding a new hostname after a domain change should not require a redeploy of the code — just update the env var and Vercel re-runs the function with the new value.

## Deploy on Vercel

1. Go to https://vercel.com/new and import this repo (`elzinko/my-resume-api`).
2. Framework preset: **Other**.
3. (Optional) Set the `ALLOWED_HOSTS` env var to override the default allowlist.
4. Click **Deploy**. Vercel installs `@sparticuz/chromium` + `puppeteer-core` automatically.
5. The function URL will look like `https://my-resume-api.vercel.app/api/pdf`.

## Quick test

```bash
curl -o resume.pdf 'https://my-resume-api.vercel.app/api/pdf?url=https%3A%2F%2Felzinko.github.io%2Fmy-resume%2Ffr'
open resume.pdf
```

## Used by

[`job-app`](https://github.com/elzinko/job-app) calls this endpoint from `/api/offres/:id/cv-pdf-generate` and stores the resulting PDF in `public/cvs/cv-{hash}.pdf`.
