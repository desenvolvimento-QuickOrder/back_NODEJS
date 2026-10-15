/**
 * Plugins de infraestrutura do Fastify.
 *
 * - `redis`: conexão com o Redis (consumo dos streams e readiness).
 * - JWT (a criar): validação local do access token RS256 pelo JWKS do core (`jose`),
 *   no HTTP e no handshake do Socket.IO.
 * - Socket.IO (a criar): ligado direto no servidor HTTP do Fastify 5
 *   (`fastify-socket.io` só suporta Fastify 4).
 * - CORS e rate limit (a criar): `@fastify/cors` e `@fastify/rate-limit`, com o IP do
 *   cliente resolvido pelo mesmo critério do core.
 *
 * @packageDocumentation
 */
export { registerRedis } from './redis.js';
