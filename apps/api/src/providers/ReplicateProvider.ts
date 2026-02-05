import axios from 'axios';
import { ImageGenerationProvider, ImageGenerationResult } from './ImageGenerationProvider';
import { PromptTemplate } from '../promptTemplates';

export class ReplicateProvider implements ImageGenerationProvider {
  private apiToken: string;

  constructor(apiToken: string) {
    this.apiToken = apiToken;
  }

  async generate(
    prompt: PromptTemplate,
    images: Buffer[],
    seed?: number
  ): Promise<ImageGenerationResult> {
    try {
      // Using a model that supports image conditioning
      // Example: stable-diffusion with img2img or controlnet
      const model = 'stability-ai/sdxl:latest'; // Placeholder model

      const fullPrompt = `${prompt.userPrompt}`;
      
      // Convert first image to base64 for conditioning
      const imageBase64 = images[0] ? `data:image/jpeg;base64,${images[0].toString('base64')}` : undefined;

      const input: any = {
        prompt: fullPrompt,
        negative_prompt: prompt.negativePrompt,
        width: 1024,
        height: 1792,
        num_outputs: 1,
      };

      if (imageBase64) {
        input.image = imageBase64;
        input.prompt_strength = 0.8; // Keep some similarity to original
      }

      if (seed !== undefined) {
        input.seed = seed;
      }

      // Create prediction
      const response = await axios.post(
        'https://api.replicate.com/v1/predictions',
        {
          version: model,
          input
        },
        {
          headers: {
            'Authorization': `Token ${this.apiToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const predictionId = response.data.id;

      // Poll for completion
      let prediction = response.data;
      let attempts = 0;
      const maxAttempts = 60; // 5 minutes max

      while (prediction.status === 'starting' || prediction.status === 'processing') {
        if (attempts >= maxAttempts) {
          throw new Error('Generation timeout');
        }

        await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds

        const statusResponse = await axios.get(
          `https://api.replicate.com/v1/predictions/${predictionId}`,
          {
            headers: {
              'Authorization': `Token ${this.apiToken}`
            }
          }
        );

        prediction = statusResponse.data;
        attempts++;
      }

      if (prediction.status === 'failed') {
        throw new Error(prediction.error || 'Generation failed');
      }

      const outputUrl = prediction.output?.[0];
      if (!outputUrl) {
        throw new Error('No output image from Replicate');
      }

      // Download the image
      const imageResponse = await axios.get(outputUrl, { responseType: 'arraybuffer' });
      const imageBuffer = Buffer.from(imageResponse.data);

      return { imageBuffer };
    } catch (error: any) {
      console.error('Replicate generation error:', error.response?.data || error.message);
      return {
        error: error.response?.data?.detail || error.message || 'Failed to generate image'
      };
    }
  }
}
