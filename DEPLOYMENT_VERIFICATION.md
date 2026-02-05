# Deployment Verification Checklist

This document provides a comprehensive checklist to verify successful deployment of Rapper Toon Sheet to Coolify using Nixpacks.

## Pre-Deployment Checklist

### Code Readiness
- [x] All code is committed to the repository
- [x] Latest changes are pushed to GitHub
- [x] Target branch is specified (e.g., `main`)
- [x] PRD.md is created and committed
- [x] All documentation is up to date

### Build Verification
- [x] Shared package builds successfully: `pnpm --filter @rapper-toon-sheet/shared build`
- [x] API builds successfully: `pnpm --filter @rapper-toon-sheet/api build`
- [x] Web builds successfully: `pnpm --filter @rapper-toon-sheet/web build`
- [x] Full build completes: `pnpm build`
- [x] No TypeScript errors
- [x] No build warnings (critical)

### Configuration Files
- [x] `nixpacks.toml` exists in repository root
- [x] `nixpacks.toml` specifies Node.js 22
- [x] `nixpacks.toml` specifies pnpm package manager
- [x] Build commands are correct in nixpacks.toml
- [x] Start command points to `apps/api/dist/index.js`
- [x] `.env.example` contains all required variables
- [x] `.gitignore` excludes sensitive files

### API Verification
- [x] API starts successfully locally
- [x] Health endpoint responds: `GET /health`
- [x] Health endpoint returns valid JSON
- [x] API responds on configured PORT
- [x] No startup errors in logs

---

## Coolify Deployment Steps

### 1. Repository Setup in Coolify

- [ ] Log into Coolify dashboard
- [ ] Click "New Resource" → "Application"
- [ ] Select "Public Repository" or connect GitHub account
- [ ] Enter repository URL: `https://github.com/iboss21/Rapper-Toon-Sheet`
- [ ] Select branch to deploy (e.g., `main`)
- [ ] Choose a name for the application

### 2. Build Configuration

- [ ] Build Pack: **Nixpacks** (should be auto-detected)
- [ ] Verify Nixpacks configuration is recognized
- [ ] Base Directory: `/` (root)
- [ ] Port: `3001`
- [ ] Health Check Path: `/health`
- [ ] Health Check Interval: `30` seconds
- [ ] Health Check Timeout: `5` seconds

### 3. Environment Variables

Required variables (must be set):

- [ ] `NODE_ENV=production`
- [ ] `PORT=3001` (usually auto-set by Coolify)
- [ ] `WEB_URL=https://your-frontend-domain.com` (or your Coolify app URL)
- [ ] `IMAGE_PROVIDER=openai` or `replicate`
- [ ] `OPENAI_API_KEY=sk-your-actual-key` (if using OpenAI)
- [ ] `REPLICATE_API_TOKEN=r8_your-token` (if using Replicate)

Optional but recommended:

- [ ] `STORAGE_MODE=local` or `s3`
- [ ] `OUTPUT_DIR=/data/outputs` (for local storage)
- [ ] `RATE_LIMIT_WINDOW_MS=900000` (15 minutes)
- [ ] `RATE_LIMIT_MAX_REQUESTS=10`
- [ ] `MAX_FILE_SIZE_MB=10`
- [ ] `MAX_FILES=2`

For S3 storage (if using):

- [ ] `S3_ENDPOINT=https://s3.amazonaws.com`
- [ ] `S3_BUCKET=your-bucket-name`
- [ ] `S3_ACCESS_KEY=your-access-key`
- [ ] `S3_SECRET_KEY=your-secret-key`
- [ ] `S3_REGION=us-east-1`

### 4. Persistent Storage (for local storage mode)

If using `STORAGE_MODE=local`:

- [ ] Add a persistent volume
- [ ] Source: `/data` (or custom path)
- [ ] Destination: `/data`
- [ ] Ensure volume persists across deployments
- [ ] Set `OUTPUT_DIR=/data/outputs` in environment variables

### 5. Network Configuration

- [ ] Port `3001` is exposed
- [ ] Domain is configured (custom domain or Coolify subdomain)
- [ ] HTTPS is enabled (automatic with Coolify)
- [ ] DNS records are set (if using custom domain)

### 6. Deploy

- [ ] Click "Deploy" button
- [ ] Monitor build logs in Coolify
- [ ] Watch for Nixpacks detection message
- [ ] Verify pnpm installation
- [ ] Verify dependencies installation
- [ ] Verify shared package build
- [ ] Verify API build
- [ ] Check for build errors
- [ ] Wait for deployment to complete

---

## Post-Deployment Verification

### Basic Health Checks

- [ ] Application shows as "Running" in Coolify
- [ ] No restart loops (check Coolify logs)
- [ ] Health check passes (green indicator)
- [ ] Access application URL in browser

### API Endpoint Tests

**Test 1: Health Check**
```bash
curl https://your-domain.com/health
```
Expected response:
```json
{
  "status": "ok",
  "timestamp": "2026-02-05T...",
  "uptime": 123.45
}
```
- [ ] Health endpoint returns 200 OK
- [ ] Response is valid JSON
- [ ] Status is "ok"
- [ ] Timestamp is recent

**Test 2: CORS Check**
```bash
curl -H "Origin: https://your-frontend-domain.com" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     https://your-domain.com/api/generate
```
- [ ] CORS headers are present
- [ ] Access-Control-Allow-Origin matches WEB_URL
- [ ] OPTIONS request succeeds

**Test 3: API Route Existence**
```bash
curl https://your-domain.com/api/history
```
- [ ] History endpoint responds (even if empty)
- [ ] No 404 errors
- [ ] Returns valid JSON

### Log Verification

In Coolify → Application → Logs:

- [ ] Application started successfully
- [ ] No error messages on startup
- [ ] Storage provider initialized (local or s3)
- [ ] Image generation provider initialized (openai or replicate)
- [ ] Port binding successful
- [ ] No uncaught exceptions

Look for these log messages:
```json
{"level":30,"msg":"Using local storage provider"}
{"level":30,"msg":"Using OpenAI image generation provider"}
{"level":30,"port":"3001","msg":"Server started"}
```

### Performance Checks

- [ ] Health endpoint responds in < 500ms
- [ ] No memory leaks (check Coolify metrics)
- [ ] CPU usage is reasonable (< 50% idle)
- [ ] Application doesn't crash under load

### Storage Verification

**For Local Storage:**
- [ ] `/data/outputs` directory exists (check via Coolify SSH)
- [ ] Directory is writable
- [ ] Files persist across deployments

**For S3 Storage:**
- [ ] S3 bucket is accessible
- [ ] Credentials are valid
- [ ] Bucket permissions allow read/write
- [ ] Files are uploaded successfully (test with generation)

---

## Frontend Deployment (Optional)

If deploying the frontend separately:

### Vercel / Netlify Deployment

1. **Build Settings:**
   - Framework: Vite
   - Build Command: `cd apps/web && npm run build`
   - Output Directory: `apps/web/dist`
   - Install Command: `npm install -g pnpm && pnpm install`

2. **Environment Variables:**
   - `VITE_API_URL=https://your-api-domain.com`

3. **Verification:**
   - [ ] Frontend loads successfully
   - [ ] Can navigate to all pages (/, /create, /history)
   - [ ] No console errors
   - [ ] API calls work (check Network tab)

### Coolify Multi-Service Setup

1. **Create second application for frontend:**
   - Same repository
   - Build command: `pnpm --filter @rapper-toon-sheet/web build`
   - Start command: Static file serving (Nginx)
   - Output: `apps/web/dist`

2. **Nginx Configuration:**
   - Serve static files from `dist/`
   - Reverse proxy API calls to backend

---

## Troubleshooting Guide

### Build Fails

**Error: `pnpm: command not found`**
- **Cause:** Nixpacks didn't detect `nixpacks.toml`
- **Fix:** Ensure `nixpacks.toml` is in repository root and committed

**Error: `Cannot find module '@rapper-toon-sheet/shared'`**
- **Cause:** Shared package not built before API
- **Fix:** Check build phase order in `nixpacks.toml`:
  ```toml
  [phases.build]
  cmds = [
    "pnpm --filter @rapper-toon-sheet/shared build",  # MUST be first
    "pnpm --filter @rapper-toon-sheet/api build"
  ]
  ```

**Error: TypeScript compilation errors**
- **Cause:** Type errors in code
- **Fix:** Run `pnpm build` locally to find errors

### Runtime Fails

**Error: `OPENAI_API_KEY is required`**
- **Cause:** Environment variable not set
- **Fix:** Add `OPENAI_API_KEY` in Coolify environment variables

**Error: `EACCES: permission denied, mkdir '/data/outputs'`**
- **Cause:** Output directory not writable
- **Fix:** 
  1. Add persistent volume in Coolify
  2. Or use `/tmp/rapper-toon-outputs`
  3. Or switch to S3 storage

**Error: `CORS error` in frontend**
- **Cause:** `WEB_URL` doesn't match frontend domain
- **Fix:** Update `WEB_URL` environment variable to match frontend URL

**Error: Application restarts constantly**
- **Cause:** Health check failing or uncaught exception
- **Fix:** 
  1. Check Coolify logs for error
  2. Verify health endpoint works
  3. Check health check settings

### Network Issues

**Cannot access application**
- [ ] Check domain DNS records
- [ ] Verify HTTPS certificate
- [ ] Check firewall rules
- [ ] Verify port 3001 is exposed

**API calls fail from frontend**
- [ ] Check CORS configuration
- [ ] Verify `WEB_URL` environment variable
- [ ] Check browser console for errors
- [ ] Test API directly with curl

---

## Production Readiness Checklist

### Security

- [ ] HTTPS is enabled (automatic with Coolify)
- [ ] Environment variables are secured
- [ ] API keys are not exposed in logs
- [ ] Rate limiting is configured
- [ ] File upload limits are enforced
- [ ] CORS is properly configured

### Performance

- [ ] Application starts in < 30 seconds
- [ ] Health check responds consistently
- [ ] No memory leaks observed
- [ ] CPU usage is stable
- [ ] Storage has adequate space

### Monitoring

- [ ] Health checks are configured
- [ ] Can access application logs in Coolify
- [ ] Error logging is working (Pino)
- [ ] Uptime is tracked
- [ ] Resource usage is monitored

### Backup & Recovery

- [ ] Know how to roll back deployment
- [ ] Persistent storage is backed up (if using local)
- [ ] S3 bucket has versioning enabled (if using S3)
- [ ] Can restore from previous deployment

---

## Success Criteria

The deployment is successful when:

✅ **Health Check Passes**
- Health endpoint returns 200 OK
- Response is valid JSON with correct structure

✅ **API is Accessible**
- Can reach all API endpoints
- CORS is working correctly
- Rate limiting is active

✅ **Storage is Working**
- Files can be written
- Files can be read
- Storage persists across deployments

✅ **No Errors in Logs**
- No startup errors
- No runtime exceptions
- No warning messages (critical)

✅ **Performance is Adequate**
- Response times < 1 second for API
- No memory leaks
- CPU usage < 50% at idle

✅ **Documentation is Complete**
- README.md is accurate
- PRD.md is comprehensive
- DEPLOYMENT.md matches actual setup

---

## Rollback Procedure

If deployment fails:

1. **Immediate Rollback:**
   - In Coolify, click "Deployments" tab
   - Select previous successful deployment
   - Click "Redeploy"

2. **Fix and Redeploy:**
   - Identify issue from logs
   - Fix code locally
   - Test build locally: `pnpm build`
   - Commit and push fix
   - Trigger new deployment in Coolify

3. **Emergency Shutdown:**
   - In Coolify, click "Stop" to halt application
   - Fix issue urgently
   - Restart when ready

---

## Next Steps After Successful Deployment

1. **Monitor for 24 hours:**
   - Check logs daily
   - Monitor resource usage
   - Watch for errors

2. **Load Testing:**
   - Test with multiple concurrent users
   - Verify rate limiting works
   - Check storage scaling

3. **Documentation:**
   - Update README with production URL
   - Document any deployment-specific changes
   - Create runbook for common issues

4. **Optimization:**
   - Enable CDN for static assets (future)
   - Implement caching (future)
   - Add analytics (future)

---

## Support

For deployment issues:

1. Check Coolify documentation: https://coolify.io/docs
2. Check Nixpacks documentation: https://nixpacks.com/docs
3. Open GitHub issue with logs: https://github.com/iboss21/Rapper-Toon-Sheet/issues
4. Contact Coolify support: https://coolify.io/support

---

## Deployment Status

Fill this out after deployment:

- **Deployment Date:** _______________
- **Deployed By:** _______________
- **Coolify Instance:** _______________
- **Application URL:** _______________
- **Health Check URL:** _______________
- **Status:** ⬜ Success ⬜ Failed ⬜ Partial
- **Notes:** _______________

---

**Last Updated:** February 5, 2026
**Version:** 1.0.0
