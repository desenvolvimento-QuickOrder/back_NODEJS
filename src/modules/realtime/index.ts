/**
 * Módulo realtime: notificações em tempo real via Socket.IO.
 *
 * - Consome os Redis Streams do core (`events:pedido`, `events:mesa`) no consumer group
 *   `realtime`, criado na subida de forma idempotente (`XGROUP CREATE ... MKSTREAM`).
 * - Consumidor idempotente por `eventId`.
 * - Rooms por tenant: `tenant:{id}:copa` e `tenant:{id}:salao`. Todo `pedido.*` vai para as
 *   duas; `mesa.status_alterado` vai para `salao`.
 * - Nunca altera estado: o core é o único dono do pedido. Eventos são dicas e o front
 *   reconcilia pelo REST ao conectar e reconectar.
 *
 * @packageDocumentation
 */
export {};
