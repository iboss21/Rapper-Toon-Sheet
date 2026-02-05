# API Documentation

Complete API reference for Rapper Toon Sheet backend.

## Base URL

- Development: `http://localhost:3001`
- Production: Your deployed domain

## Authentication

Currently, the API does not require authentication. Rate limiting is applied based on IP address.

---

## Endpoints

### Health Check

Check if the API is running.

**Endpoint:** `GET /health`

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-02-05T12:00:00.000Z",
  "uptime": 123.45
}
```

**Status Codes:**
- `200 OK` - Service is healthy
- `500 Internal Server Error` - Service is unhealthy

---

### Generate Character Sheet

Create a new character reference sheet from uploaded photos.

**Endpoint:** `POST /api/generate`

**Content-Type:** `multipart/form-data`

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `images` | File[] | Yes | 1-2 image files (JPG/PNG, max 10MB each) |
| `options` | JSON string | Yes | Generation options (see below) |

**Options Object:**

```typescript
{
  stylePreset: 'cartoon_realism' | 'anime_ish' | 'comic_ink' | 'clean_cell_shade';
  layout: 'single_poster' | 'two_posters';
  background: 'neon_city_blur' | 'plain_studio_grey' | 'transparent';
  includeTurnaround: boolean;
  includeActionPoses: boolean;
  nickname?: string;
  faceConsistencyLock?: boolean;
  seed?: number;
}
```

**Example Request (curl):**

```bash
curl -X POST http://localhost:3001/api/generate \
  -F "images=@photo1.jpg" \
  -F "images=@photo2.jpg" \
  -F 'options={"stylePreset":"cartoon_realism","layout":"single_poster","background":"neon_city_blur","includeTurnaround":true,"includeActionPoses":true,"nickname":"LIL TECH"}'
```

**Example Request (JavaScript):**

```javascript
const formData = new FormData();
formData.append('images', file1);
formData.append('images', file2);
formData.append('options', JSON.stringify({
  stylePreset: 'cartoon_realism',
  layout: 'single_poster',
  background: 'neon_city_blur',
  includeTurnaround: true,
  includeActionPoses: true,
  nickname: 'LIL TECH',
  faceConsistencyLock: false
}));

const response = await fetch('http://localhost:3001/api/generate', {
  method: 'POST',
  body: formData
});

const result = await response.json();
```

**Response:**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "pending",
  "createdAt": "2024-02-05T12:00:00.000Z"
}
```

**Status Codes:**
- `200 OK` - Generation started successfully
- `400 Bad Request` - Invalid request (missing files, invalid options, etc.)
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server error

**Error Response:**

```json
{
  "error": "ValidationError",
  "message": "At least one image is required",
  "statusCode": 400
}
```

---

### Get Generation Status

Check the status of a generation.

**Endpoint:** `GET /api/generate/:id`

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Generation ID returned from POST /api/generate |

**Response:**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "completed",
  "outputUrl": "/outputs/550e8400-e29b-41d4-a716-446655440000.png",
  "createdAt": "2024-02-05T12:00:00.000Z"
}
```

**Status Values:**
- `pending` - Generation queued
- `processing` - Currently generating
- `completed` - Generation finished successfully
- `failed` - Generation failed

**Failed Response:**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "failed",
  "error": "Generation timeout",
  "createdAt": "2024-02-05T12:00:00.000Z"
}
```

**Status Codes:**
- `200 OK` - Generation found
- `404 Not Found` - Generation ID not found
- `500 Internal Server Error` - Server error

---

### Get Generation History

Retrieve all previous generations.

**Endpoint:** `GET /api/history`

**Response:**

```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "completed",
    "outputUrl": "/outputs/550e8400-e29b-41d4-a716-446655440000.png",
    "thumbnailUrl": "/outputs/550e8400-e29b-41d4-a716-446655440000_thumb.jpg",
    "options": {
      "stylePreset": "cartoon_realism",
      "layout": "single_poster",
      "background": "neon_city_blur",
      "includeTurnaround": true,
      "includeActionPoses": true,
      "nickname": "LIL TECH"
    },
    "createdAt": "2024-02-05T12:00:00.000Z"
  }
]
```

**Status Codes:**
- `200 OK` - History retrieved
- `500 Internal Server Error` - Server error

---

## Rate Limiting

The API implements rate limiting to prevent abuse.

**Default Limits:**
- Window: 15 minutes (900,000ms)
- Max Requests: 10 per window

**Rate Limit Headers:**

```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 9
X-RateLimit-Reset: 1612540800000
```

**Rate Limit Exceeded Response:**

```json
{
  "error": "TooManyRequests",
  "message": "Too many requests, please try again later",
  "statusCode": 429
}
```

---

## File Requirements

### Supported Formats
- JPG/JPEG
- PNG

### Size Limits
- Maximum file size: 10MB per file
- Maximum files: 2 files per request

### Recommendations
- Use front-facing photos for best results
- High resolution images (at least 512x512)
- Clear, well-lit photos
- Neutral or simple backgrounds

---

## Generation Options Guide

### Style Presets

**cartoon_realism** (Default)
- High-quality stylized cartoon realism
- Cinematic lighting
- Detailed face and features
- Best for music videos

**anime_ish**
- Anime-inspired character design
- Vibrant colors
- Expressive features
- Cell-shaded style

**comic_ink**
- Bold comic book style
- Strong ink lines
- Dramatic shadows
- Halftone textures

**clean_cell_shade**
- Clean cell-shaded style
- Flat colors
- Crisp edges
- Modern vector aesthetic

### Layout Options

**single_poster** (Default)
- All elements on one poster
- Comprehensive view
- Recommended for most uses

**two_posters**
- Split into two separate compositions
- More space per element
- Better for detailed views

### Background Options

**neon_city_blur** (Default)
- Blurred neon city night
- Purple and blue tones
- Urban aesthetic

**plain_studio_grey**
- Neutral grey background
- Professional look
- Focus on character

**transparent**
- Transparent or white background
- Easy to composite
- Maximum flexibility

### Advanced Options

**includeTurnaround**
- When `true`: Includes head and body turnarounds (front/side/back)
- When `false`: Front views only
- Default: `true`

**includeActionPoses**
- When `true`: Includes 2 action poses
- When `false`: No action poses
- Default: `true`

**faceConsistencyLock**
- When `true`: Generates reference headshot first for better consistency
- When `false`: Standard generation
- Default: `false`
- Note: Increases generation time but improves quality

**seed**
- Optional number for reproducible results
- Use same seed to get similar outputs
- Leave empty for random generation

---

## Error Handling

### Common Errors

**400 Bad Request**
```json
{
  "error": "ValidationError",
  "message": "At least one image is required",
  "statusCode": 400
}
```

**404 Not Found**
```json
{
  "error": "NotFound",
  "message": "Generation not found",
  "statusCode": 404
}
```

**500 Internal Server Error**
```json
{
  "error": "ServerError",
  "message": "Failed to process generation",
  "statusCode": 500
}
```

### Safety Filters

The API includes content safety filters that reject:
- NSFW content
- Explicit content requests
- Inappropriate nicknames
- Violence or weapons
- Illegal content

Rejected requests return:
```json
{
  "error": "ValidationError",
  "message": "Inappropriate content detected",
  "statusCode": 400
}
```

---

## Integration Examples

### React/TypeScript

```typescript
import axios from 'axios';

async function generateSheet(images: File[], options: GenerateOptions) {
  const formData = new FormData();
  images.forEach(img => formData.append('images', img));
  formData.append('options', JSON.stringify(options));

  const { data } = await axios.post('/api/generate', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });

  return data;
}

async function checkStatus(id: string) {
  const { data } = await axios.get(`/api/generate/${id}`);
  return data;
}
```

### Python

```python
import requests

def generate_sheet(image_paths, options):
    files = [('images', open(path, 'rb')) for path in image_paths]
    data = {'options': json.dumps(options)}
    
    response = requests.post(
        'http://localhost:3001/api/generate',
        files=files,
        data=data
    )
    
    return response.json()

def check_status(generation_id):
    response = requests.get(
        f'http://localhost:3001/api/generate/{generation_id}'
    )
    return response.json()
```

### Node.js

```javascript
const FormData = require('form-data');
const fs = require('fs');
const axios = require('axios');

async function generateSheet(imagePaths, options) {
  const form = new FormData();
  
  imagePaths.forEach(path => {
    form.append('images', fs.createReadStream(path));
  });
  
  form.append('options', JSON.stringify(options));
  
  const response = await axios.post(
    'http://localhost:3001/api/generate',
    form,
    { headers: form.getHeaders() }
  );
  
  return response.data;
}
```

---

## CORS Configuration

The API is configured to accept requests from:
- Development: `http://localhost:5173`
- Production: Value of `WEB_URL` environment variable

If you need to call the API from a different origin, update the `WEB_URL` environment variable.

---

## Webhooks (Coming Soon)

Future versions will support webhooks for generation completion notifications.

---

*API Version: 1.0.0*
*Last Updated: February 2024*
