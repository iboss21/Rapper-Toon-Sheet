import { v4 as uuidv4 } from 'uuid';
import { GenerateOptions, GenerateResponse, HistoryItem } from '@rapper-toon-sheet/shared';
import { ImageGenerationProvider } from '../providers/ImageGenerationProvider';
import { StorageProvider } from '../providers/StorageProvider';
import { buildPrompt, sanitizeNickname } from '../promptTemplates';
import { logger } from '../utils/logger';
import { createThumbnail } from '../utils/imageUtils';

interface Generation {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  outputUrl?: string;
  thumbnailUrl?: string;
  options: GenerateOptions;
  createdAt: Date;
  error?: string;
}

export class GenerationService {
  private imageProvider: ImageGenerationProvider;
  private storageProvider: StorageProvider;
  private generations: Map<string, Generation> = new Map();

  constructor(imageProvider: ImageGenerationProvider, storageProvider: StorageProvider) {
    this.imageProvider = imageProvider;
    this.storageProvider = storageProvider;
  }

  async createGeneration(
    images: Buffer[],
    options: GenerateOptions
  ): Promise<GenerateResponse> {
    const id = uuidv4();
    const generation: Generation = {
      id,
      status: 'pending',
      options,
      createdAt: new Date()
    };

    this.generations.set(id, generation);

    // Process asynchronously
    this.processGeneration(id, images, options).catch(error => {
      logger.error({ error, id }, 'Generation processing failed');
      const gen = this.generations.get(id);
      if (gen) {
        gen.status = 'failed';
        gen.error = error.message;
      }
    });

    return this.toResponse(generation);
  }

  private async processGeneration(
    id: string,
    images: Buffer[],
    options: GenerateOptions
  ): Promise<void> {
    const generation = this.generations.get(id);
    if (!generation) return;

    try {
      generation.status = 'processing';
      logger.info({ id }, 'Starting generation');

      const nickname = sanitizeNickname(options.nickname || 'CHARACTER');
      const prompt = buildPrompt(options, nickname);

      const result = await this.imageProvider.generate(prompt, images, options.seed);

      if (result.error || !result.imageBuffer) {
        throw new Error(result.error || 'No image generated');
      }

      // Save the generated image
      const filename = `${id}.png`;
      await this.storageProvider.save(result.imageBuffer, filename);
      generation.outputUrl = this.storageProvider.getUrl(filename);

      // Create and save thumbnail
      const thumbnailBuffer = await createThumbnail(result.imageBuffer);
      const thumbnailFilename = `${id}_thumb.jpg`;
      await this.storageProvider.save(thumbnailBuffer, thumbnailFilename);
      generation.thumbnailUrl = this.storageProvider.getUrl(thumbnailFilename);

      generation.status = 'completed';
      logger.info({ id, outputUrl: generation.outputUrl }, 'Generation completed');
    } catch (error: any) {
      generation.status = 'failed';
      generation.error = error.message;
      logger.error({ error, id }, 'Generation failed');
    }
  }

  getGeneration(id: string): GenerateResponse | null {
    const generation = this.generations.get(id);
    return generation ? this.toResponse(generation) : null;
  }

  getHistory(): HistoryItem[] {
    return Array.from(this.generations.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .map(gen => ({
        id: gen.id,
        status: gen.status,
        outputUrl: gen.outputUrl,
        thumbnailUrl: gen.thumbnailUrl,
        options: gen.options,
        createdAt: gen.createdAt.toISOString()
      }));
  }

  private toResponse(generation: Generation): GenerateResponse {
    return {
      id: generation.id,
      status: generation.status,
      outputUrl: generation.outputUrl,
      createdAt: generation.createdAt.toISOString(),
      error: generation.error
    };
  }
}
