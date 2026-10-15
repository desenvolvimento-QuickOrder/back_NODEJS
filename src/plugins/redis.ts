import type { FastifyInstance } from 'fastify';
import { Redis } from 'ioredis';

declare module 'fastify' {
  interface FastifyInstance {
    redis: Redis;
  }
}

/** Registra o cliente Redis na instância (conexão preguiçosa) e o fecha no shutdown. */
export function registerRedis(app: FastifyInstance, url: string): void {
  const redis = new Redis(url, { lazyConnect: true, maxRetriesPerRequest: 1 });
  app.decorate('redis', redis);
  app.addHook('onClose', async () => {
    redis.disconnect();
  });
}
