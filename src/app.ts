/**
 * Montagem da aplicação Fastify: logger, proxy confiável, plugins e rotas de saúde.
 *
 * Separada do `server.ts` para ser testada com `app.inject()` sem abrir porta.
 *
 * @packageDocumentation
 */
import Fastify, { type FastifyInstance } from 'fastify';
import type { Config } from './config/env.js';
import { registerRedis } from './plugins/index.js';

export function buildApp(config: Config): FastifyInstance {
  const app = Fastify({
    logger: { level: config.LOG_LEVEL },
    trustProxy:
      config.TRUST_PROXY_HOPS === 0 ? false : (_address, hop) => hop < config.TRUST_PROXY_HOPS,
  });

  registerRedis(app, config.REDIS_URL);

  app.get('/health', async () => ({ status: 'UP' }));

  app.get('/ready', async (_request, reply) => {
    try {
      if (app.redis.status === 'wait') await app.redis.connect();
      await app.redis.ping();
      return { status: 'UP' };
    } catch {
      return reply.code(503).send({ status: 'DOWN' });
    }
  });

  return app;
}
