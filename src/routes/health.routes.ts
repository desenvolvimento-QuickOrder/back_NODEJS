import { FastifyInstance } from 'fastify';
import { healthController } from '../controllers/health.controller';

export async function healthRoutes(app: FastifyInstance) {
  app.get('/health', healthController.check);
}