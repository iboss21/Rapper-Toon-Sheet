import { Router, Request, Response } from 'express';
import { GenerationService } from '../services/GenerationService';
import { logger } from '../utils/logger';

export function createHistoryRouter(generationService: GenerationService): Router {
  const router = Router();

  router.get('/', async (req: Request, res: Response) => {
    try {
      const history = generationService.getHistory();
      res.json(history);
    } catch (error: any) {
      logger.error({ error }, 'History endpoint error');
      res.status(500).json({
        error: 'ServerError',
        message: error.message || 'Failed to fetch history',
        statusCode: 500
      });
    }
  });

  return router;
}
