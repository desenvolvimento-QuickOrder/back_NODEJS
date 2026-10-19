# 🟢 QuickOrder — Serviços Node.js

Microsserviço **Node.js + TypeScript** do projeto **QuickOrder** (sistema de gerenciamento para restaurantes). Ele é responsável pela comunicação em tempo real do sistema: atualização de status de pedidos e mesas, notificações internas e comunicação via WebSocket.

A regra de negócio, a autenticação e o banco de dados principal ficam no microsserviço Java (Spring Boot). Este serviço cuida apenas das partes leves, assíncronas e em tempo real.

---

## Sumário

1. [Visão geral e arquitetura](#1-visão-geral-e-arquitetura)
2. [Tecnologias](#2-tecnologias)
3. [Instalação e execução](#3-instalação-e-execução)
4. [Scripts disponíveis](#4-scripts-disponíveis)
5. [Estrutura de pastas](#5-estrutura-de-pastas)
6. [Variáveis de ambiente](#6-variáveis-de-ambiente)
7. [Endpoints](#7-endpoints)
8. [WebSocket](#8-websocket)
9. [Docker](#10-docker)
10. [Integração com o microsserviço Java](#11-integração-com-o-microsserviço-java)
11. [Branches](#12-branches)
12. [Commits](#13-commits)
13. [Regras](#14-regras)
14. [Solução de problemas](#15-solução-de-problemas)

---

## 1. Visão geral e arquitetura

```
Frontend (React + TypeScript)
        ↓
API Gateway / Comunicação HTTP
        ↓
---------------------------------
|                               |
Microsserviço Java          Microsserviço Node.js   ← este repositório
(Core do sistema)           (Serviços auxiliares)
        ↓                           ↓
           PostgreSQL
```

### Responsabilidades deste serviço

- Notificações em tempo real
- Atualização em tempo real do status dos pedidos
- Atualização em tempo real do status das mesas
- Comunicação via WebSocket
- Serviço de filas/eventos
- Logs e monitoramento de eventos

### O que este serviço NÃO faz

- Regras de negócio (ficam no Java)
- Autenticação e emissão de JWT (ficam no Java)
- Persistência de dados (o Java é o único dono do banco)

---

## 2. Tecnologias

* Node.js
* Express
* WebSocket

---

## 3. Instalação e execução

```bash
# 1. Clonar o repositório
git clone <URL_DO_REPOSITORIO>
cd back_NODEJS

# 2. Instalar as dependências
npm install

# 3. Criar o arquivo de ambiente (a partir do .env.example)
cp .env.example .env

# 4. Subir em modo desenvolvimento (com hot reload)
npm run dev
```

### Verificando se subiu

```bash
curl http://localhost:3001/health
```

Resposta esperada:

```json
{
  "status": "ok",
  "service": "ironia-realtime-service",
  "uptime": 3.2,
  "timestamp": "2026-01-01T12:00:00.000Z"
}
```

### Execução em modo produção (local)

```bash
npm run build
npm start
```

---

## 4. Scripts disponíveis

| Script | Comando | Descrição |
|---|---|---|
| `npm run dev` | `tsx watch src/server.ts` | Servidor de desenvolvimento com recarga automática |
| `npm run build` | `tsc` | Compila o TypeScript para JavaScript na pasta `dist/` |
| `npm start` | `node dist/server.js` | Executa a versão compilada (produção) |

---

## 5. Estrutura de pastas

```
back_NODEJS/
├── src/
│   ├── routes/          # Definição das rotas HTTP
│   │   ├── index.ts
│   │   └── health.routes.ts
│   ├── controllers/     # Recebem a requisição e devolvem a resposta
│   │   └── health.controller.ts
│   ├── services/        # Lógica do serviço (sem depender de HTTP)
│   │   └── health.service.ts
│   ├── websocket/       # Conexões e eventos em tempo real
│   │   └── index.ts
│   ├── utils/           # Utilitários compartilhados
│   │   └── env.ts
│   ├── app.ts           # Monta a aplicação Fastify e registra os plugins
│   └── server.ts        # Ponto de entrada: sobe o servidor
├── .env.example         # Modelo das variáveis de ambiente (vai para o Git)
├── .env                 # Variáveis reais (NÃO vai para o Git)
├── .gitignore
├── .dockerignore
├── Dockerfile
├── package.json
└── tsconfig.json
```

### Responsabilidade de cada camada

O fluxo de uma requisição HTTP segue sempre a mesma ordem:

```
route  →  controller  →  service
```

- **routes/**: apenas mapeia método + caminho para um controller. Não tem lógica.
- **controllers/**: lê dados da requisição (params, body), chama o service e monta a resposta HTTP.
- **services/**: concentra a lógica. Não conhece Fastify, o que facilita testar e reutilizar.
- **websocket/**: cuida apenas do *transporte* em tempo real (conexões, canais, broadcast). Quando um service decide que algo mudou, ele chama o broadcast daqui para avisar os clientes. Se um dia o `@fastify/websocket` for trocado por `socket.io`, só esta pasta muda.
- **utils/**: código de apoio sem relação direta com o domínio (ex.: configuração de ambiente).

### Arquivos de entrada

- **`app.ts`** exporta `buildApp()`, que cria a instância do Fastify e registra CORS, WebSocket e rotas. Separar isso do `server.ts` permite reaproveitar a aplicação em testes sem abrir uma porta de rede.
- **`server.ts`** chama `buildApp()` e executa `listen()` na porta configurada.

---

## 6. Variáveis de ambiente

As variáveis são carregadas do arquivo `.env` pelo **dotenv** e validadas pelo **zod** em `src/utils/env.ts`. Se algum valor for inválido, o serviço **encerra na inicialização** listando o problema.

### Variáveis atuais

| Variável | Tipo | Padrão | Descrição |
|---|---|---|---|
| `NODE_ENV` | `development` \| `production` \| `test` | `development` | Ambiente de execução |
| `PORT` | número inteiro positivo | `3001` | Porta do servidor |
| `HOST` | texto | `0.0.0.0` | Interface de rede onde o servidor escuta |
| `LOG_LEVEL` | `fatal` \| `error` \| `warn` \| `info` \| `debug` \| `trace` \| `silent` | `info` | Nível de log do Fastify |
| `CORS_ORIGIN` | texto | `http://localhost:5173` | Origem do front permitida pelo CORS |

### Exemplo de `.env.example`

```
NODE_ENV=development
PORT=3001
HOST=0.0.0.0
LOG_LEVEL=info
CORS_ORIGIN=http://localhost:5173
```

### Variáveis previstas para a integração (ainda não implementadas)

Estas variáveis devem ser adicionadas ao schema quando a integração com o Java começar. Ficam **sem valor padrão** de propósito, para o serviço se recusar a subir se faltarem:

| Variável | Schema sugerido | Descrição |
|---|---|---|
| `JAVA_API_URL` | `z.string().url()` | URL base da API Java |
| `JWT_SECRET` | `z.string().min(32)` | Segredo do JWT. **Deve ser idêntico ao do Java** |
| `INTERNAL_API_KEY` | `z.string().min(16)` | Chave que o Java envia ao chamar o endpoint interno de eventos |

### Boas práticas

- O arquivo `.env` real **nunca** deve ser commitado.
- Mantenha o `.env.example` sempre atualizado com os *nomes* das variáveis (sem segredos).
- Em produção/Docker, as variáveis são passadas pelo container. O dotenv simplesmente não encontra o arquivo e o zod valida o que veio do ambiente.

---

## 7. Endpoints

### `GET /health`

Verifica se o serviço está de pé. Usado por monitoramento, Docker healthcheck e testes de integração.

**Resposta `200 OK`:**

```json
{
  "status": "ok",
  "service": "ironia-realtime-service",
  "uptime": 3.2,
  "timestamp": "2026-01-01T12:00:00.000Z"
}
```

| Campo | Descrição |
|---|---|
| `status` | Sempre `"ok"` quando o serviço responde |
| `service` | Nome do serviço |
| `uptime` | Segundos desde que o processo iniciou |
| `timestamp` | Data/hora da resposta em ISO 8601 |

### Como adicionar uma nova rota

1. Crie a lógica em `src/services/<nome>.service.ts`.
2. Crie o handler em `src/controllers/<nome>.controller.ts`.
3. Crie `src/routes/<nome>.routes.ts` mapeando o caminho ao controller.
4. Registre em `src/routes/index.ts`:

```ts
await app.register(nomeRoutes);
```

---

## 8. WebSocket

### Conexão

```
ws://localhost:3001/ws
```

Para testar pelo terminal:

```bash
npx wscat -c ws://localhost:3001/ws
```

### Comportamento atual (exemplo de teste)

Ao conectar, o servidor envia:

```json
{ "type": "connected" }
```

Qualquer mensagem enviada pelo cliente é devolvida em formato de eco:

```json
{ "type": "echo", "data": "<mensagem enviada>" }
```

Esse eco existe apenas para validar que a conexão funciona e deve ser substituído pelos eventos reais do sistema.

### Eventos previstos

Estes nomes são uma sugestão e devem ser combinados com o time do Java e do front antes da implementação:

| Evento | Quando é emitido |
|---|---|
| `pedido.criado` | Um novo pedido foi registrado |
| `pedido.status_atualizado` | O status de um pedido mudou |
| `mesa.atualizada` | O status de uma mesa mudou (livre, ocupada, aguardando pedido, aguardando conta) |

Formato sugerido para as mensagens:

```json
{
  "type": "pedido.status_atualizado",
  "data": { "id": 42, "status": "PRONTO" }
}
```

### Evolução prevista da pasta `websocket/`

- Registro das conexões ativas
- Canais/salas por perfil (cozinha, garçons, administração)
- Handlers de eventos
- Função de broadcast, chamada pelos services
- Autenticação da conexão via JWT (após a Sprint 4)

---

## 9. Docker

### Dockerfile (multi-stage)

- **Estágio `build`**: instala tudo (incluindo TypeScript) e compila.
- **Estágio final**: instala só as dependências de produção e copia apenas o `dist/`, resultando em uma imagem menor.

### Build e execução

```bash
docker build -t ironia-realtime-service .

docker run -p 3001:3001 \
  -e PORT=3001 \
  -e CORS_ORIGIN=http://localhost:5173 \
  ironia-realtime-service
```

---

## 10. Integração com o microsserviço Java

O setup inicial **não depende** do Java. As informações abaixo precisam ser alinhadas entre os dois repositórios quando a integração começar.

### Valores que devem ser combinados

| Variável (Node) | Correspondente no Java | Regra |
|---|---|---|
| `JWT_SECRET` | Segredo do JWT no Spring Security | **Valor idêntico** |
| `JAVA_API_URL` | Porta do Spring Boot (provavelmente 8080) | Deve apontar para onde o Java realmente sobe |
| `CORS_ORIGIN` | CORS do Spring | Ambos devem permitir a URL do front |
| `INTERNAL_API_KEY` | Chave enviada pelo Java ao chamar o Node | **Valor idêntico** |
| `PORT` | `server.port` | **Valores diferentes** (Node 3001, Java 8080) |

### Decisões a alinhar

1. **Como o Java avisa o Node que algo mudou.** Sugestão: o Java chama um endpoint interno do Node (ex.: `POST /internal/events`), protegido por `INTERNAL_API_KEY`.
2. **Autenticação do WebSocket.** O Node valida o JWT emitido pelo Java, o que exige o mesmo segredo e o mesmo formato de claims (id do usuário, cargo).
3. **Contrato dos eventos.** Nomes e campos das mensagens, combinados com Java e front.
4. **Acesso ao banco.** Recomendação: o Node **não** acessa o PostgreSQL; recebe os dados nos eventos e o Java permanece único dono dos dados.

---

## 11. Branches

A `main` contém apenas versões estáveis.

Para iniciar uma tarefa:

```bash
git checkout main
git pull origin main
git checkout -b feature/nome-da-tarefa
```

Exemplos:

```text
feature/websocket
feature/order-status
feature/notifications
fix/order-events
```

Tipos:

* `feature/` — nova funcionalidade
* `fix/` — correção
* `refactor/` — refatoração
* `docs/` — documentação

Ao finalizar:

```bash
git add .
git commit -m "feat: implement order status events"
git push origin feature/order-status
```

Abra um **Pull Request para `main`**.

---

## 12. Commits

```text
tipo: descrição
```

Exemplo:

```text
feat: implement order status events
```

Tipos principais:

* `feat`
* `fix`
* `refactor`
* `test`
* `docs`
* `style`
* `build`
* `perf`

---

## 13. Regras

* Não realizar `push` diretamente na `main`.
* Não versionar `.env`.
* Manter o serviço focado nas responsabilidades auxiliares.
* Testar alterações antes de abrir o PR.
* Documentar alterações que afetem a comunicação com os outros serviços.

---

## 14. Solução de problemas

**O serviço encerra ao iniciar com "Variáveis de ambiente inválidas"**
Alguma variável do `.env` não passou na validação do zod. A mensagem lista qual campo e o motivo. Corrija o valor e suba novamente.

**`EADDRINUSE: address already in use`**
A porta já está ocupada por outro processo. Mude a `PORT` no `.env` ou encerre o processo que a usa.

**Erro de CORS no navegador**
Confira se `CORS_ORIGIN` é exatamente a URL do front (protocolo, host e porta, sem barra final).

**O WebSocket não conecta**
Verifique se a URL usa `ws://` (e não `http://`) e se o caminho é `/ws`.

**`Cannot find module` após o build**
Rode `npm install` e `npm run build` novamente. Em Docker, confirme que o `dist/` foi gerado no estágio de build.

**Variáveis do `.env` não são lidas**
O `import 'dotenv/config'` deve estar no topo de `src/utils/env.ts`, e o arquivo `.env` precisa estar na **raiz do projeto**, na pasta de onde o comando é executado.