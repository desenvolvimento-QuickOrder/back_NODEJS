/**
 * Configuração do back-node a partir de variáveis de ambiente (12-factor).
 *
 * A validação roda na subida e falha rápido: qualquer variável obrigatória ausente ou
 * inválida derruba o processo com a lista de problemas.
 *
 * @packageDocumentation
 */
import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  /** Redis Streams publicados pelo core (`events:pedido`, `events:mesa`). */
  REDIS_URL: z.url(),
  /** JWKS exposto pelo core para validar o JWT RS256 localmente. */
  JWKS_URL: z.url(),
  /** Origens do front aceitas no CORS e no Socket.IO, separadas por vírgula. */
  CORS_ORIGINS: z
    .string()
    .default('')
    .transform((value) =>
      value
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean),
    ),
  /** Quantidade de proxies confiáveis à frente do serviço (Render: 1). */
  TRUST_PROXY_HOPS: z.coerce.number().int().min(0).default(1),
});

export type Config = z.infer<typeof schema>;

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  const result = schema.safeParse(env);
  if (!result.success) {
    const problems = result.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('; ');
    throw new Error(`Configuração inválida: ${problems}`);
  }
  return result.data;
}
