import { describe, expect, it } from 'vitest';
import { loadConfig } from '../src/config/env.js';

describe('loadConfig', () => {
  it('falha quando falta variável obrigatória', () => {
    expect(() => loadConfig({})).toThrow(/REDIS_URL.*JWKS_URL|JWKS_URL.*REDIS_URL/);
  });

  it('aplica os padrões', () => {
    const config = loadConfig({
      REDIS_URL: 'redis://localhost:6379',
      JWKS_URL: 'http://localhost:8080/jwks',
      CORS_ORIGINS: 'http://localhost:5173, http://localhost:4173',
    });
    expect(config.PORT).toBe(3000);
    expect(config.TRUST_PROXY_HOPS).toBe(1);
    expect(config.CORS_ORIGINS).toEqual(['http://localhost:5173', 'http://localhost:4173']);
  });
});
