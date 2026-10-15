# QuickOrder — back-node

Serviço de tempo real do QuickOrder em Node.js 24 / TypeScript / Fastify 5 / Socket.IO.
Consome os Redis Streams publicados pelo core (`back-java`) e notifica copa e salão por
rooms de tenant. Não grava estado de pedido: o core é o único dono.

## Estrutura

```text
src/
  server.ts              entrada: valida config, sobe o servidor, shutdown gracioso
  app.ts                 montagem do Fastify (testável com app.inject)
  config/                variáveis de ambiente validadas com zod (fail fast)
  plugins/               Redis, JWT (JWKS do core), Socket.IO, CORS, rate limit
  modules/
    realtime/            consumo de events:pedido / events:mesa e broadcast por room
    cardapio/            cache do cardápio digital (fase paga)
    integracoes/         canais externos (WhatsApp, iFood), futuros
  shared/                tipos do envelope de eventos e utilitários
test/                    testes (vitest)
```

## Endpoints

- `GET /health`: liveness, não depende de nada.
- `GET /ready`: readiness, responde 503 se o Redis não responder.

## Rodando

Com Docker (depende do compose do `back-java`, que cria a rede `quickorder`, o Redis e o core):

```bash
# no back-java
docker compose up -d
# aqui
docker compose up -d --build
curl http://localhost:3000/health
curl http://localhost:3000/ready
```

Local, com Node 24 (`.nvmrc`):

```bash
npm ci
cp .env.example .env
npm run dev
```

Scripts: `dev`, `build`, `start`, `lint`, `format:check`, `typecheck`, `test`.

### Registry corporativo

O Dockerfile aceita um `.npmrc` opcional como build secret:

```bash
docker build --secret id=npmrc,src=$HOME/.npmrc -t quickorder-node:local .
```

## Convenções

- Dependências com versão exata (`.npmrc` com `save-exact`) e `npm ci` com lockfile.
- TypeScript estrito, ESM.
- Configuração só por variável de ambiente; `.env` não é versionado.
