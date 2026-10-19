import { FastifyReply, FastifyRequest } from 'fastify';
import { healthService } from '../services/health.service';

export const healthController = {
  check(_req: FastifyRequest, reply: FastifyReply) {
    return reply.send(healthService.getStatus());
  },
};