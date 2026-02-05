# Nixpacks Deployment Guide

This guide covers deploying Rapper Toon Sheet using Nixpacks (commonly used by Coolify and Railway).

## Overview

The repository includes a `nixpacks.toml` configuration file that optimizes the build and deployment process for the Node.js monorepo structure.

## Configuration

### nixpacks.toml

The `nixpacks.toml` file configures:
- **Node.js 22**: Matches the version specified in package.json and Dockerfiles
- **pnpm**: Uses the pnpm package manager for workspace support
- **Optimized Build**: Builds only the shared package and API (not the web frontend)
- **Production Start**: Runs the API server directly

### Build Process

1. **Setup Phase**: Installs Node.js 22 and pnpm
2. **Install Phase**: Installs all dependencies using `pnpm install --frozen-lockfile`
3. **Build Phase**: 
   - Builds shared package: `pnpm --filter @rapper-toon-sheet/shared build`
   - Builds API: `pnpm --filter @rapper-toon-sheet/api build`
4. **Start Phase**: Runs `node apps/api/dist/index.js`

## Required Environment Variables

The following environment variables **must** be set in your deployment platform (Coolify, Railway, etc.):

### Core Configuration
```bash
NODE_ENV=production
PORT=3001
```

### API Provider (choose one)
```bash
# For OpenAI DALL-E
IMAGE_PROVIDER=openai
OPENAI_API_KEY=sk-your-openai-api-key

# OR for Replicate
IMAGE_PROVIDER=replicate
REPLICATE_API_TOKEN=r8_your-replicate-token
```

### CORS Configuration
```bash
# Set to your frontend URL or '*' for development
WEB_URL=https://your-frontend-domain.com
```

### Storage Configuration

**Local Storage (default)**:
```bash
STORAGE_MODE=local
OUTPUT_DIR=/data/outputs
```

**S3 Storage**:
```bash
STORAGE_MODE=s3
S3_ENDPOINT=https://s3.amazonaws.com
S3_BUCKET=your-bucket-name
S3_ACCESS_KEY=your-access-key
S3_SECRET_KEY=your-secret-key
S3_REGION=us-east-1
```

### Optional Settings
```bash
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=10
MAX_FILE_SIZE_MB=10
MAX_FILES=2
```

## Deployment Steps

### On Coolify

1. **Create New Application**
   - Choose "Git Repository"
   - Select your GitHub repository
   - Choose branch (e.g., `main`)

2. **Configure Build Settings**
   - Build Pack: **Nixpacks** (auto-detected)
   - Port: **3001**
   - Health Check Path: **/health**

3. **Add Environment Variables**
   - Add all required environment variables listed above
   - At minimum, you need:
     - `NODE_ENV=production`
     - `OPENAI_API_KEY=your-key` (or `REPLICATE_API_TOKEN`)
     - `WEB_URL=https://your-domain.com`

4. **Configure Persistent Storage** (for local file storage)
   - Add a volume mount:
     - Source: `/data` (or your preferred host path)
     - Destination: `/data`
   - Update `OUTPUT_DIR=/data/outputs` in environment variables

5. **Deploy**
   - Click "Deploy"
   - Monitor build logs
   - Verify health check at `https://your-domain.com/health`

### On Railway

1. **Create New Project**
   - Choose "Deploy from GitHub repo"
   - Select your repository

2. **Configure**
   - Railway auto-detects Nixpacks
   - Add environment variables in Settings → Variables
   - Railway provides a PORT variable automatically

3. **Deploy**
   - Railway deploys automatically on push

## Verification

After deployment, verify the application is running:

```bash
# Health check
curl https://your-domain.com/health

# Expected response:
{
  "status": "ok",
  "timestamp": "2024-02-05T12:00:00.000Z",
  "uptime": 123.45
}
```

## Troubleshooting

### Build Fails

**Error: `pnpm: command not found`**
- Ensure `nixpacks.toml` is in the repository root
- Nixpacks should auto-detect it and install pnpm

**Error: `Cannot find module '@rapper-toon-sheet/shared'`**
- The shared package must be built before the API
- Check build phase commands in `nixpacks.toml`

### Runtime Fails

**Error: `OPENAI_API_KEY is required`**
- Add `OPENAI_API_KEY` environment variable
- Or set `IMAGE_PROVIDER=replicate` and add `REPLICATE_API_TOKEN`

**Error: `EACCES: permission denied, mkdir '/data/outputs'`**
- Ensure the output directory has write permissions
- Use `/tmp/rapper-toon-outputs` or configure persistent storage

**CORS errors in frontend**
- Set `WEB_URL` to match your frontend domain
- Include protocol: `https://your-domain.com` (no trailing slash)

### Logs

Monitor application logs through your deployment platform:
- **Coolify**: Application → Logs
- **Railway**: Deployment → Logs

## Port Configuration

The application listens on port **3001** by default. Nixpacks and deployment platforms typically:
- Map the internal port to an external URL
- Set the `PORT` environment variable (already configured in `nixpacks.toml`)

## Production Checklist

Before going live:
- [ ] Set `NODE_ENV=production`
- [ ] Configure valid AI provider API keys
- [ ] Set `WEB_URL` to production frontend URL
- [ ] Configure persistent storage (volume mount or S3)
- [ ] Set appropriate rate limits
- [ ] Enable HTTPS (usually automatic in Coolify/Railway)
- [ ] Test health check endpoint
- [ ] Monitor logs for any startup errors

## Custom Nixpacks Configuration

To customize the build process, edit `nixpacks.toml`:

```toml
# Example: Add additional build commands
[phases.build]
cmds = [
  "pnpm --filter @rapper-toon-sheet/shared build",
  "pnpm --filter @rapper-toon-sheet/api build",
  "echo 'Custom build step here'"
]

# Example: Change Node.js version
[phases.setup]
nixPkgs = ["nodejs_22", "pnpm"]
```

## Differences from Docker Deployment

Unlike Docker Compose which runs both API and Web:
- Nixpacks deployment runs **API only**
- Frontend should be deployed separately (e.g., Vercel, Netlify)
- Or use a multi-service setup in Coolify

## Support

For deployment issues:
1. Check the Nixpacks build logs
2. Verify all environment variables are set
3. Test the health endpoint
4. Check application logs for runtime errors
5. Open a GitHub issue with sanitized logs

---

*Last Updated: February 2024*
