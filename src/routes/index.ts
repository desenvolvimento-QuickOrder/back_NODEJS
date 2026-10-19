import { FastifyInstance } from 'fastify';
import { healthRoutes } from './health.routes';

export async function routes(app: FastifyInstance) {
  await app.register(healthRoutes);
}