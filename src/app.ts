import fastify, { type FastifyInstance } from 'fastify';

import exchangerRoutes from './controllers/exchanger/index';

function build(opts = {}) {
  const app = fastify(opts);

  app.register(exchangerRoutes);

  return app;
}

export default build;
