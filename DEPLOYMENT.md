# Deployment Guide

This document provides detailed instructions for deploying Rapper Toon Sheet to various platforms.

## Table of Contents

1. [Local Development](#local-development)
2. [Docker Deployment](#docker-deployment)
3. [Coolify Deployment](#coolify-deployment)
4. [Manual Server Deployment](#manual-server-deployment)
5. [Environment Configuration](#environment-configuration)

---

## Local Development

### Prerequisites

- Node.js 18 or higher
- pnpm 8 or higher
- OpenAI API key or Replicate API token

### Quick Start

1. Clone the repository:
```bash
git clone https://github.com/iboss21/Rapper-Toon-Sheet.git
cd Rapper-Toon-Sheet
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment:
```bash
cp .env.example .env
# Edit .env with your API keys
```

4. Build and start:
```bash
# Use the convenience script
./scripts/start.sh

# Or manually:
pnpm --filter @rapper-toon-sheet/shared build
pnpm dev
```

Access the application at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001
- Health check: http://localhost:3001/health

---

## Docker Deployment

### Using Docker Compose (Recommended)

The easiest way to run the application in production:

```bash
# Create .env file
cp .env.example .env
# Edit .env with production values

# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Building Individual Docker Images

**Backend:**
```bash
docker build -f apps/api/Dockerfile -t rapper-toon-api:latest .
docker run -d \
  -p 3001:3001 \
  -e NODE_ENV=production \
  -e OPENAI_API_KEY=your-key \
  -v /data/outputs:/data/outputs \
  rapper-toon-api:latest
```

**Frontend:**
```bash
docker build -f apps/web/Dockerfile -t rapper-toon-web:latest .
docker run -d -p 80:80 rapper-toon-web:latest
```

---

## Coolify Deployment

Coolify provides a simple way to deploy directly from GitHub.

### Step 1: Prepare Repository

1. Push your code to GitHub
2. Ensure `.env.example` has all required variables
3. Make sure your repository is public or Coolify has access

### Step 2: Create Application in Coolify

1. Log in to your Coolify dashboard
2. Click "New Resource" → "Application"
3. Choose "Git Repository"
4. Select your GitHub repository
5. Choose branch: `main` or your production branch

### Step 3: Configure Build

**Build Settings:**
- Build Pack: `nixpacks`
- Build Command: `pnpm install && pnpm build`
- Start Command: `pnpm start`
- Port: `3001`

**Or use Dockerfile:**
- Build Method: `Dockerfile`
- Dockerfile: `apps/api/Dockerfile`
- Port: `3001`

### Step 4: Add Environment Variables

Add these environment variables in Coolify:

**Required:**
```
NODE_ENV=production
PORT=3001
WEB_URL=https://your-domain.com
IMAGE_PROVIDER=openai
OPENAI_API_KEY=sk-...your-key...
```

**Optional (for S3 storage):**
```
STORAGE_MODE=s3
S3_ENDPOINT=https://s3.amazonaws.com
S3_BUCKET=rapper-toon-sheet
S3_ACCESS_KEY=your-access-key
S3_SECRET_KEY=your-secret-key
S3_REGION=us-east-1
```

### Step 5: Add Persistent Storage

For local file storage, add a volume:

1. Go to "Storages" tab
2. Click "Add Volume"
3. Source: `/data` (host path)
4. Destination: `/data` (container path)
5. Save

### Step 6: Deploy

1. Click "Deploy"
2. Wait for build to complete
3. Access your application at the provided URL

### Health Checks

Coolify will automatically use the health check endpoint at `/health`.

---

## Manual Server Deployment

### On Ubuntu/Debian Server

1. **Install dependencies:**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
npm install -g pnpm@8.15.0
```

2. **Clone and setup:**
```bash
git clone https://github.com/iboss21/Rapper-Toon-Sheet.git
cd Rapper-Toon-Sheet
pnpm install
cp .env.example .env
# Edit .env
```

3. **Build:**
```bash
pnpm build
```

4. **Run with PM2:**
```bash
npm install -g pm2
pm2 start apps/api/dist/index.js --name rapper-toon-api
pm2 startup
pm2 save
```

5. **Setup Nginx (optional):**
```bash
sudo apt-get install nginx

# Create nginx config
sudo nano /etc/nginx/sites-available/rapper-toon-sheet
```

Nginx config:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable and restart:
```bash
sudo ln -s /etc/nginx/sites-available/rapper-toon-sheet /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## Environment Configuration

### Core Settings

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NODE_ENV` | Environment mode | `development` | No |
| `PORT` | Server port | `3001` | No |
| `WEB_URL` | Frontend URL for CORS | `http://localhost:5173` | Yes |

### Storage Configuration

**Local Storage:**
```env
STORAGE_MODE=local
OUTPUT_DIR=/tmp/rapper-toon-outputs
```

**S3 Storage:**
```env
STORAGE_MODE=s3
S3_ENDPOINT=https://s3.amazonaws.com
S3_BUCKET=your-bucket-name
S3_ACCESS_KEY=your-access-key
S3_SECRET_KEY=your-secret-key
S3_REGION=us-east-1
```

### AI Provider Configuration

**OpenAI (DALL-E):**
```env
IMAGE_PROVIDER=openai
OPENAI_API_KEY=sk-...your-key...
```

**Replicate:**
```env
IMAGE_PROVIDER=replicate
REPLICATE_API_TOKEN=r8_...your-token...
```

### Rate Limiting

```env
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=10   # Max 10 requests per window
```

### Upload Limits

```env
MAX_FILE_SIZE_MB=10
MAX_FILES=2
```

---

## Production Checklist

Before deploying to production:

- [ ] Set `NODE_ENV=production`
- [ ] Use strong `JWT_SECRET`
- [ ] Configure valid AI provider API keys
- [ ] Set up proper CORS with your domain in `WEB_URL`
- [ ] Choose storage strategy (local vs S3)
- [ ] Set appropriate rate limits
- [ ] Enable HTTPS (use Nginx or Cloudflare)
- [ ] Set up monitoring and logging
- [ ] Configure automated backups (if using local storage)
- [ ] Test health check endpoint
- [ ] Review security settings

---

## Troubleshooting

### Build Fails

```bash
# Clear cache and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
pnpm build
```

### Port Already in Use

```bash
# Find process using port 3001
lsof -i :3001
# Kill the process
kill -9 <PID>
```

### Storage Permission Errors

```bash
# Ensure output directory exists and has proper permissions
mkdir -p /tmp/rapper-toon-outputs
chmod 755 /tmp/rapper-toon-outputs
```

### API Key Issues

Verify your API keys:
- OpenAI: Test at https://platform.openai.com/api-keys
- Replicate: Test at https://replicate.com/account/api-tokens

---

## Monitoring

### Health Check

```bash
curl http://localhost:3001/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-02-05T12:00:00.000Z",
  "uptime": 123.45
}
```

### Logs

**Development:**
Logs are pretty-printed to console

**Production with Docker:**
```bash
docker-compose logs -f api
```

**Production with PM2:**
```bash
pm2 logs rapper-toon-api
```

---

## Support

For deployment issues:
1. Check the logs first
2. Verify environment variables
3. Test the health endpoint
4. Open a GitHub issue with logs and configuration (remove sensitive data)

---

## Security Notes

- Never commit `.env` file to version control
- Use strong, unique API keys
- Enable HTTPS in production
- Regularly update dependencies
- Monitor for unusual activity
- Set appropriate rate limits
- Validate all user inputs
- Review CORS settings

---

*Last Updated: February 2024*
