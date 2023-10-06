import { type FastifyInstance } from 'fastify';
import getTopExchangers from './get-top-exchangers';

export default async function (fastify: FastifyInstance) {
  fastify.get('/exchangers/top', getTopExchangers);
}
