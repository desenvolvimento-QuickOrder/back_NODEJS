import Fastify from 'fastify';
import cors from '@fastify/cors';
import websocket from '@fastify/websocket';
import { routes } from './routes';
import { registerWebsocket } from './websocket';
import { env } from './utils/env';

export async function buildApp() {
  const app = Fastify({ logger: true });
  await app.register(cors, { origin: env.CORS_ORIGIN });
  await app.register(websocket);
  await app.register(routes);
  await app.register(registerWebsocket);
  return app;
}