# Coolify Deployment Guide - Quick Start

This is a quick reference guide for deploying Rapper Toon Sheet to Coolify using Nixpacks.

## Prerequisites

- GitHub account with repository access
- Coolify instance (v4.0+)
- OpenAI API key or Replicate API token

---

## 5-Minute Deployment

### 1. Push to GitHub
```bash
git push origin main
```

### 2. Create Application in Coolify

1. Log into Coolify
2. Click **"New Resource"** → **"Application"**
3. Select **"Public Repository"**
4. Repository URL: `https://github.com/iboss21/Rapper-Toon-Sheet`
5. Branch: `main` (or your preferred branch)
6. Name: `rapper-toon-sheet-api`

### 3. Configure Settings

**Build Settings:**
- Build Pack: **Nixpacks** (auto-detected)
- Port: `3001`
- Health Check Path: `/health`

**Environment Variables (Add these):**
```bash
NODE_ENV=production
IMAGE_PROVIDER=openai
OPENAI_API_KEY=sk-your-openai-api-key-here
WEB_URL=https://your-frontend-url.com
STORAGE_MODE=local
OUTPUT_DIR=/data/outputs
```

**Persistent Storage (Required for local storage):**
- Add Volume Mount:
  - Source: `/data`
  - Destination: `/data`

### 4. Deploy

Click **"Deploy"** and wait 2-3 minutes.

### 5. Verify

Visit: `https://your-coolify-url.com/health`

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2026-02-05T...",
  "uptime": 123.45
}
```

---

## Environment Variables Reference

### Required

| Variable | Example | Description |
|----------|---------|-------------|
| `NODE_ENV` | `production` | Environment mode |
| `IMAGE_PROVIDER` | `openai` or `replicate` | AI provider |
| `OPENAI_API_KEY` | `sk-...` | OpenAI API key (if using OpenAI) |
| `REPLICATE_API_TOKEN` | `r8_...` | Replicate token (if using Replicate) |
| `WEB_URL` | `https://your-frontend.com` | Frontend URL for CORS |

### Optional

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3001` | API port (auto-set by Coolify) |
| `STORAGE_MODE` | `local` | Storage type (`local` or `s3`) |
| `OUTPUT_DIR` | `/tmp/...` | Local storage directory |
| `RATE_LIMIT_WINDOW_MS` | `900000` | Rate limit window (15 min) |
| `RATE_LIMIT_MAX_REQUESTS` | `10` | Max requests per window |

### S3 Storage (Optional)

If using `STORAGE_MODE=s3`:

| Variable | Example | Description |
|----------|---------|-------------|
| `S3_ENDPOINT` | `https://s3.amazonaws.com` | S3 endpoint URL |
| `S3_BUCKET` | `my-bucket` | Bucket name |
| `S3_ACCESS_KEY` | `AKIAIOSFODNN7EXAMPLE` | Access key |
| `S3_SECRET_KEY` | `wJalrXUtnFEMI/K7MDENG/...` | Secret key |
| `S3_REGION` | `us-east-1` | AWS region |

---

## How Nixpacks Build Works

Nixpacks automatically:

1. **Detects** the `nixpacks.toml` configuration file
2. **Installs** Node.js 22 and pnpm 8
3. **Runs** `pnpm install --frozen-lockfile`
4. **Builds** the shared package and API:
   ```bash
   pnpm --filter @rapper-toon-sheet/shared build
   pnpm --filter @rapper-toon-sheet/api build
   ```
5. **Starts** the application: `node apps/api/dist/index.js`

---

## Troubleshooting

### Build Fails: "pnpm: command not found"
- **Solution:** Ensure `nixpacks.toml` is committed to the repository root

### Build Fails: "Cannot find module '@rapper-toon-sheet/shared'"
- **Solution:** Check `nixpacks.toml` build order - shared must build first

### Runtime Fails: "OPENAI_API_KEY is required"
- **Solution:** Add environment variable in Coolify

### Runtime Fails: "EACCES: permission denied"
- **Solution:** Add persistent volume mount for `/data`

### Health Check Fails
- **Solution:** Check logs for startup errors
- Verify `PORT` environment variable is set
- Ensure health check path is `/health` (not `/api/health`)

---

## Next Steps

1. **Test the API:**
   ```bash
   curl https://your-coolify-url.com/health
   ```

2. **Deploy Frontend:**
   - Deploy `apps/web` to Vercel/Netlify
   - Or deploy as second Coolify application
   - Set `VITE_API_URL` to your API URL

3. **Monitor:**
   - Check Coolify logs regularly
   - Monitor resource usage
   - Set up alerts (optional)

---

## Additional Resources

- **Full Deployment Guide:** [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Nixpacks Details:** [NIXPACKS.md](./NIXPACKS.md)
- **Verification Checklist:** [DEPLOYMENT_VERIFICATION.md](./DEPLOYMENT_VERIFICATION.md)
- **API Documentation:** [API.md](./API.md)
- **Product Requirements:** [PRD.md](./PRD.md)

---

## Support

- **GitHub Issues:** https://github.com/iboss21/Rapper-Toon-Sheet/issues
- **Coolify Docs:** https://coolify.io/docs

---

**Last Updated:** February 5, 2026
