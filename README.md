# Rapper Toon Sheet 🎨

Generate stylized cartoon-realism character reference sheets from your photos for animated rap music videos.

## Features

- **Multiple Style Presets**: Cartoon Realism, Anime-ish, Comic Ink, Clean Cell-shade
- **Complete Reference Sheets**: Head turnarounds (front/3-4/side), full body turnarounds (front/side/back), action poses
- **Face Consistency Lock**: Advanced AI maintains facial identity across all views
- **Customizable Layouts**: Single poster or two-poster compositions
- **Background Options**: Neon city blur, plain studio grey, or transparent
- **Client-side Image Processing**: Automatic compression and resizing before upload
- **Generation History**: Track all your previous generations with thumbnails
- **Download Options**: Export high-resolution PNG files

## Tech Stack

### Frontend
- React 18 + TypeScript
- Vite
- TailwindCSS
- React Router
- Axios

### Backend
- Node.js + Express
- TypeScript
- Multer (file uploads)
- Sharp (image processing)
- AWS S3 SDK (optional cloud storage)
- Pino (logging)

### AI Integration
- OpenAI DALL-E (placeholder)
- Replicate API (placeholder)
- Extensible provider interface for custom integrations

## Project Structure

```
rapper-toon-sheet/
├── apps/
│   ├── api/              # Express backend
│   │   ├── src/
│   │   │   ├── routes/   # API endpoints
│   │   │   ├── services/ # Business logic
│   │   │   ├── providers/# Storage & AI providers
│   │   │   ├── middleware/
│   │   │   ├── utils/
│   │   │   ├── promptTemplates.ts
│   │   │   └── index.ts
│   │   ├── Dockerfile
│   │   └── package.json
│   └── web/              # React frontend
│       ├── src/
│       │   ├── components/
│       │   ├── pages/
│       │   ├── lib/
│       │   ├── App.tsx
│       │   └── main.tsx
│       ├── Dockerfile
│       └── package.json
├── packages/
│   └── shared/           # Shared TypeScript types
│       └── src/
│           └── types.ts
├── docker-compose.yml
├── .env.example
├── pnpm-workspace.yaml
└── package.json
```

## Quick Start

### Prerequisites

- Node.js 22+
- pnpm 8+
- OpenAI API key or Replicate API token

### Installation

1. Clone the repository:
```bash
git clone https://github.com/iboss21/Rapper-Toon-Sheet.git
cd Rapper-Toon-Sheet
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your API keys
```

4. Build shared package:
```bash
pnpm --filter @rapper-toon-sheet/shared build
```

### Development

Run both frontend and backend in development mode:

```bash
pnpm dev
```

Or run them separately:

```bash
# Terminal 1 - Backend
pnpm --filter @rapper-toon-sheet/api dev

# Terminal 2 - Frontend
pnpm --filter @rapper-toon-sheet/web dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:3001
- Health check: http://localhost:3001/health

### Production Build

```bash
pnpm build
pnpm start
```

## Docker Deployment

### Using Docker Compose (Recommended for Development)

```bash
docker-compose up
```

### Building Individual Images

```bash
# Backend
docker build -f apps/api/Dockerfile -t rapper-toon-api .

# Frontend
docker build -f apps/web/Dockerfile -t rapper-toon-web .
```

## Coolify Deployment

This repository includes a `nixpacks.toml` configuration file for optimized Coolify deployments.

> **📝 Quick Start**: [COOLIFY_QUICKSTART.md](./COOLIFY_QUICKSTART.md) - 5-minute deployment guide  
> **📋 Full Guide**: [DEPLOYMENT.md](./DEPLOYMENT.md) and [NIXPACKS.md](./NIXPACKS.md)  
> **✅ Verification**: [DEPLOYMENT_VERIFICATION.md](./DEPLOYMENT_VERIFICATION.md)

**Quick Setup:**

1. Push your code to GitHub
2. In Coolify, create a new application from Git repository
3. Nixpacks will auto-detect and use the `nixpacks.toml` configuration
4. Add required environment variables (see below)
5. Add a volume mapping for persistent storage:
   - `/data` → your persistent volume
6. Deploy!

### Environment Variables for Coolify

Required:
- `NODE_ENV=production`
- `PORT=3001`
- `IMAGE_PROVIDER=openai` or `replicate`
- `OPENAI_API_KEY=your-key` (if using OpenAI)
- `REPLICATE_API_TOKEN=your-token` (if using Replicate)
- `WEB_URL=https://your-frontend-domain.com`

Optional:
- `STORAGE_MODE=local` (default) or `s3`
- `S3_ENDPOINT`, `S3_BUCKET`, `S3_ACCESS_KEY`, `S3_SECRET_KEY` (if using S3)
- `RATE_LIMIT_WINDOW_MS=900000`
- `RATE_LIMIT_MAX_REQUESTS=10`

## API Endpoints

### POST /api/generate
Generate a new character sheet.

**Request**: multipart/form-data
- `images`: Array of 1-2 image files (JPG/PNG, max 10MB each)
- `options`: JSON string with generation options

**Response**:
```json
{
  "id": "uuid",
  "status": "pending|processing|completed|failed",
  "outputUrl": "url-to-generated-image",
  "createdAt": "ISO-8601-timestamp"
}
```

### GET /api/generate/:id
Check generation status.

### GET /api/history
Get all previous generations.

### GET /health
Health check endpoint.

## Configuration

### Image Generation Providers

The app supports multiple AI providers through an extensible interface. Configure via `IMAGE_PROVIDER` environment variable:

**OpenAI (DALL-E)**:
```env
IMAGE_PROVIDER=openai
OPENAI_API_KEY=your-key
```

**Replicate**:
```env
IMAGE_PROVIDER=replicate
REPLICATE_API_TOKEN=your-token
```

### Storage Providers

**Local Storage** (default):
```env
STORAGE_MODE=local
OUTPUT_DIR=/data/outputs
```

**S3-Compatible Storage**:
```env
STORAGE_MODE=s3
S3_ENDPOINT=https://s3.amazonaws.com
S3_BUCKET=rapper-toon-sheet
S3_ACCESS_KEY=your-access-key
S3_SECRET_KEY=your-secret-key
S3_REGION=us-east-1
```

## Prompt Template

The AI prompt is customizable in `apps/api/src/promptTemplates.ts`. The template includes:

- Style descriptions for each preset
- Layout instructions
- Character consistency guidelines
- Safety filters and negative prompts
- Nickname/character name integration

## Security Features

- Content validation (NSFW filtering)
- File type and size validation
- Rate limiting
- Input sanitization
- CORS configuration
- Security headers

## Development Tips

1. **Hot Reload**: Both frontend and backend support hot reload in dev mode
2. **Logging**: Backend uses Pino with pretty printing in development
3. **Type Safety**: Shared types ensure consistency between frontend and backend
4. **Image Processing**: Client-side compression reduces upload times
5. **Error Handling**: Comprehensive error messages for debugging
6. **Deployment Verification**: Run `./scripts/verify-deployment-ready.sh` before deploying

## Documentation

- **[PRD.md](./PRD.md)** - Complete Product Requirements Document
- **[API.md](./API.md)** - API endpoints reference
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Comprehensive deployment guide
- **[COOLIFY_QUICKSTART.md](./COOLIFY_QUICKSTART.md)** - 5-minute Coolify deployment
- **[DEPLOYMENT_VERIFICATION.md](./DEPLOYMENT_VERIFICATION.md)** - Deployment checklist
- **[NIXPACKS.md](./NIXPACKS.md)** - Nixpacks configuration details
- **[PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)** - Implementation summary
- **[SECURITY.md](./SECURITY.md)** - Security guidelines

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## License

See LICENSE file for details.

## Support

For issues and questions, please open a GitHub issue.

---

Built with ❤️ for the rap and animation community
