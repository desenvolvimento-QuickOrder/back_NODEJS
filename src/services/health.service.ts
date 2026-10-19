export const healthService = {
  getStatus() {
    return {
      status: 'ok',
      service: 'quickOrder-realtime-service',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  },
};