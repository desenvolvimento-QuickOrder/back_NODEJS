import { FastifyInstance } from 'fastify';

export async function registerWebsocket(app: FastifyInstance) {
  app.get('/ws', { websocket: true }, (socket) => {
    socket.send(JSON.stringify({ type: 'connected' }));
    socket.on('message', (raw: Buffer) => {
      socket.send(JSON.stringify({ type: 'echo', data: raw.toString() }));
    });
  });
}