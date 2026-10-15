/**
 * Ponto de entrada do back-node: valida a configuração, sobe o servidor e trata o shutdown.
 *
 * @packageDocumentation
 */
import { buildApp } from './app.js';
import { loadConfig } from './config/env.js';

const config = loadConfig();
const app = buildApp(config);

const shutdown = async (signal: string): Promise<void> => {
  app.log.info({ signal }, 'encerrando');
  await app.close();
  process.exit(0);
};
process.on('SIGTERM', () => void shutdown('SIGTERM'));
process.on('SIGINT', () => void shutdown('SIGINT'));

try {
  await app.listen({ host: '0.0.0.0', port: config.PORT });
} catch (error) {
  app.log.error(error);
  process.exit(1);
}
