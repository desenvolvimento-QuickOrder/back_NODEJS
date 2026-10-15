import { afterAll, describe, expect, it } from 'vitest';
import { buildApp } from '../src/app.js';
import { loadConfig } from '../src/config/env.js';

const app = buildApp(
  loadConfig({ REDIS_URL: 'redis://localhost:6379', JWKS_URL: 'http://localhost:8080/jwks' }),
);

afterAll(async () => {
  await app.close();
});

describe('GET /health', () => {
  it('responde 200 sem depender do Redis', async () => {
    const response = await app.inject({ method: 'GET', url: '/health' });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ status: 'UP' });
  });
});
