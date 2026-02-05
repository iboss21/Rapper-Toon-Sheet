import { Router, Request, Response } from 'express';
import { GenerationService } from '../services/GenerationService';
import { upload } from '../middleware/upload';
import { validateGenerationRequest } from '../utils/validation';
import { GenerateOptions } from '@rapper-toon-sheet/shared';
import { preprocessImage } from '../utils/imageUtils';
import { logger } from '../utils/logger';

export function createGenerateRouter(generationService: GenerationService): Router {
  const router = Router();

  router.post('/', upload.array('images', 2), async (req: Request, res: Response) => {
    try {
      const files = req.files as Express.Multer.File[];
      
      // Parse options from form data
      let options: GenerateOptions;
      try {
        options = typeof req.body.options === 'string' 
          ? JSON.parse(req.body.options)
          : req.body.options;
      } catch (error) {
        return res.status(400).json({
          error: 'ValidationError',
          message: 'Invalid options format',
          statusCode: 400
        });
      }

      // Validate request
      const validation = validateGenerationRequest(options.nickname, files?.length || 0);
      if (!validation.valid) {
        return res.status(400).json({
          error: 'ValidationError',
          message: validation.error,
          statusCode: 400
        });
      }

      // Preprocess images
      const processedImages = await Promise.all(
        files.map(file => preprocessImage(file.buffer))
      );

      logger.info({ 
        filesCount: files.length,
        options: options
      }, 'Processing generation request');

      // Create generation
      const result = await generationService.createGeneration(processedImages, options);

      res.json(result);
    } catch (error: any) {
      logger.error({ error }, 'Generate endpoint error');
      res.status(500).json({
        error: 'ServerError',
        message: error.message || 'Failed to process generation',
        statusCode: 500
      });
    }
  });

  router.get('/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const generation = generationService.getGeneration(id);

      if (!generation) {
        return res.status(404).json({
          error: 'NotFound',
          message: 'Generation not found',
          statusCode: 404
        });
      }

      res.json(generation);
    } catch (error: any) {
      logger.error({ error }, 'Get generation endpoint error');
      res.status(500).json({
        error: 'ServerError',
        message: error.message || 'Failed to fetch generation',
        statusCode: 500
      });
    }
  });

  return router;
}
