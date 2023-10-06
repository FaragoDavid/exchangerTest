import { type FastifyReply, type FastifyRequest } from 'fastify';
import exchangeOffice from '../../repository/exchange-office';

export default async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
  reply.send({ topExchangers: await exchangeOffice.getTopExchangers() });
};
