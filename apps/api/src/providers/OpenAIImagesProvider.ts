import axios from 'axios';
import { ImageGenerationProvider, ImageGenerationResult } from './ImageGenerationProvider';
import { PromptTemplate } from '../promptTemplates';

export class OpenAIImagesProvider implements ImageGenerationProvider {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generate(
    prompt: PromptTemplate,
    images: Buffer[],
    seed?: number
  ): Promise<ImageGenerationResult> {
    try {
      // Note: OpenAI DALL-E 3 doesn't support image conditioning yet
      // This is a placeholder implementation
      // You would need to use a different model or service that supports image-to-image

      const fullPrompt = `${prompt.userPrompt}\n\nStyle: ${prompt.systemPrompt}`;

      const response = await axios.post(
        'https://api.openai.com/v1/images/generations',
        {
          model: 'dall-e-3',
          prompt: fullPrompt.substring(0, 4000), // DALL-E 3 has prompt limits
          n: 1,
          size: '1024x1792',
          quality: 'hd',
          style: 'vivid'
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const imageUrl = response.data.data[0]?.url;
      if (!imageUrl) {
        throw new Error('No image URL returned from OpenAI');
      }

      // Download the image
      const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
      const imageBuffer = Buffer.from(imageResponse.data);

      return { imageBuffer };
    } catch (error: any) {
      console.error('OpenAI generation error:', error.response?.data || error.message);
      return {
        error: error.response?.data?.error?.message || error.message || 'Failed to generate image'
      };
    }
  }
}
