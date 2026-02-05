import { PromptTemplate } from '../promptTemplates';

export interface ImageGenerationResult {
  imageUrl?: string;
  imageBuffer?: Buffer;
  error?: string;
}

export interface ImageGenerationProvider {
  generate(
    prompt: PromptTemplate,
    images: Buffer[],
    seed?: number
  ): Promise<ImageGenerationResult>;
}
