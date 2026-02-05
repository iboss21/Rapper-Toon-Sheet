import express from 'express';
import cors from 'cors';
import path from 'path';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { GenerationService } from './services/GenerationService';
import { LocalStorageProvider } from './providers/LocalStorageProvider';
import { S3StorageProvider } from './providers/S3StorageProvider';
import { OpenAIImagesProvider } from './providers/OpenAIImagesProvider';
import { ReplicateProvider } from './providers/ReplicateProvider';
import { createGenerateRouter } from './routes/generate';
import { createHistoryRouter } from './routes/history';
import { createHealthRouter } from './routes/health';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 3001;
const WEB_URL = process.env.WEB_URL || 'http://localhost:5173';

async function createApp() {
  const app = express();

  // Middleware
  app.use(cors({
    origin: WEB_URL,
    credentials: true
  }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Rate limiting
  const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '10'),
    message: 'Too many requests, please try again later'
  });
  app.use('/api/generate', limiter);

  // Initialize storage provider
  const storageMode = process.env.STORAGE_MODE || 'local';
  let storageProvider;

  if (storageMode === 's3') {
    storageProvider = new S3StorageProvider({
      endpoint: process.env.S3_ENDPOINT!,
      bucket: process.env.S3_BUCKET!,
      accessKey: process.env.S3_ACCESS_KEY!,
      secretKey: process.env.S3_SECRET_KEY!,
      region: process.env.S3_REGION
    });
    logger.info('Using S3 storage provider');
  } else {
    const outputDir = process.env.OUTPUT_DIR || '/data/outputs';
    storageProvider = new LocalStorageProvider(outputDir, '/outputs');
    await (storageProvider as LocalStorageProvider).init();
    
    // Serve static files for local storage
    app.use('/outputs', express.static(outputDir));
    logger.info({ outputDir }, 'Using local storage provider');
  }

  // Initialize image generation provider
  const imageProvider = process.env.IMAGE_PROVIDER || 'openai';
  let generationProvider;

  if (imageProvider === 'replicate') {
    const apiToken = process.env.REPLICATE_API_TOKEN;
    if (!apiToken) {
      throw new Error('REPLICATE_API_TOKEN is required when IMAGE_PROVIDER=replicate');
    }
    generationProvider = new ReplicateProvider(apiToken);
    logger.info('Using Replicate image generation provider');
  } else {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is required when IMAGE_PROVIDER=openai');
    }
    generationProvider = new OpenAIImagesProvider(apiKey);
    logger.info('Using OpenAI image generation provider');
  }

  // Initialize services
  const generationService = new GenerationService(generationProvider, storageProvider);

  // Routes
  app.use('/health', createHealthRouter());
  app.use('/api/generate', createGenerateRouter(generationService));
  app.use('/api/history', createHistoryRouter(generationService));

  // Error handling
  app.use(errorHandler);

  return app;
}

async function start() {
  try {
    const app = await createApp();
    
    app.listen(PORT, () => {
      logger.info({ port: PORT }, 'Server started');
    });
  } catch (error) {
    logger.error({ error }, 'Failed to start server');
    process.exit(1);
  }
}

start();
