import repository from './index';
import dbLoader from '../../lib/db-loader';
import prisma from '../../lib/prisma-client';

describe('Exchange Office Repository', () => {
  afterEach(async () => {
    await prisma.$transaction([prisma.rate.deleteMany(), prisma.exchange.deleteMany(), prisma.exchangeOffice.deleteMany()]);
  });

  describe('#createBatch', () => {
    const office1 = { id: '1', name: 'Exchange 1', country: 'USA' };
    const office2 = { id: '2', name: 'Exchange 2', country: 'USA' };
    const exchange1 = { from: 'EUR', to: 'USD', ask: 110, date: '2023-04-24 22:55:33' };
    const exchange2 = { from: 'USD', to: 'EUR', ask: 400, date: '2023-04-24 22:55:33' };
    const rate1 = { from: 'EUR', to: 'USD', in: 1.1, out: 1, reserve: 120000, date: '2023-04-24 22:55:33' };
    const rate2 = { from: 'USD', to: 'UAH', in: 1, out: 40, reserve: 150000, date: '2023-04-24 22:55:33' };
    const rate3 = { from: 'AUD', to: 'CAD', in: 1, out: 2, reserve: 150000, date: '2023-04-24 22:55:33' };

    beforeEach(async () => {
      await repository.createBatch([
        { ...office1, exchanges: [exchange1, exchange2], rates: [rate1, rate2] },
        { ...office2, exchanges: [], rates: [rate3] },
      ]);
    });

    it('should create exchange office DB records', async () => {
      expect(await prisma.exchangeOffice.findMany()).toEqual([office1, office2]);
    });

    it('should create exchange DB records', async () => {
      expect(await prisma.exchange.findMany()).toEqual([
        { ...exchange1, exchangeOfficeId: '1' },
        { ...exchange2, exchangeOfficeId: '1' },
      ]);
    });

    it('should create rate DB records', async () => {
      expect(await prisma.rate.findMany()).toEqual([
        { ...rate1, exchangeOfficeId: '1' },
        { ...rate2, exchangeOfficeId: '1' },
        { ...rate3, exchangeOfficeId: '2' },
      ]);
    });
  });

  describe('#getTopExchangers', () => {
    it('returns top exchangers', async () => {
      const RATES = `rates
      rate
        out = 4000
        to = UAH
        in = 100
        from = EUR
        reserve = 150000
        date = 2023-04-25 21:00:00
      rate
        out = 100
        to = EUR
        in = 110
        from = USD
        reserve = 150000
        date = 2023-04-25 21:00:00
      rate
        out = 4000
        to = UAH
        in = 112
        from = USD
        reserve = 150000
        date = 2023-04-25 21:00:00
      rate
        out = 50
        to = EUR
        in = 1900
        from = UAH
        reserve = 150000
        date = 2023-04-25 22:00:00
      rate
        out = 50
        to = EUR
        in = 61
        from = USD
        reserve = 150000
        date = 2023-04-25 22:00:00
      rate
        out = 1900
        to = UAH
        in = 60
        from = USD
        reserve = 150000
        date = 2023-04-25 22:00:00`;
      const SELL_EUR = `exchange
        ask = 50
        to = EUR
        from = UAH
        date = 2023-04-25 22:00:00`;
      const BUY_META = `to = UAH
        from = EUR
        date = 2023-04-25 21:00:00`;
      const OFFICES = {
        UKR: `exchange-office
    id = 11
    name = Exchanger 1
    country = UKR
    exchanges
      exchange
        ask = 4000
        ${BUY_META}
      ${SELL_EUR}
    ${RATES}
  exchange-office
    id = 12
    name = Exchanger 2
    country = UKR
    exchanges
      exchange
        ask = 2000
        ${BUY_META}
      ${SELL_EUR}
    ${RATES}
  exchange-office
    id = 13
    name = Exchanger 3
    country = UKR
    exchanges
      exchange
        ask = 1000
        ${BUY_META}
      ${SELL_EUR}
    ${RATES}
  exchange-office
    id = 14
    name = Exchanger 4
    country = UKR
    exchanges
      exchange
        ask = 8000
        ${BUY_META}
      ${SELL_EUR}
    ${RATES}`,
        USA: `exchange-office
    id = 21
    name = Exchanger 5
    country = USA
    exchanges
      exchange
        ask = 10000
        ${BUY_META}
      ${SELL_EUR}
    ${RATES}
  exchange-office
    id = 22
    name = Exchanger 6
    country = USA
    exchanges
      exchange
        ask = 11000
        ${BUY_META}
      ${SELL_EUR}
    ${RATES}
  exchange-office
    id = 23
    name = Exchanger 7
    country = USA
    exchanges
      exchange
        ask = 112000
        ${BUY_META}
      ${SELL_EUR}
    ${RATES}
  exchange-office
    id = 24
    name = Exchanger 8
    country = USA
    exchanges
      exchange
        ask = 2000
        ${BUY_META}
      ${SELL_EUR}
    ${RATES}`,
        BYZ: `exchange-office
    id = 31
    name = Exchanger 5
    country = BYZ
    exchanges
      exchange
        ask = 10000
        ${BUY_META}
      ${SELL_EUR}
    ${RATES}
  exchange-office
    id = 32
    name = Exchanger 6
    country = BYZ
    exchanges
      exchange
        ask = 12000
        ${BUY_META}
      ${SELL_EUR}
    ${RATES}
  exchange-office
    id = 33
    name = Exchanger 7
    country = BYZ
    exchanges
      exchange
        ask = 13000
        ${BUY_META}
      ${SELL_EUR}
    ${RATES}
  exchange-office
    id = 34
    name = Exchanger 8
    country = BYZ
    exchanges
      exchange
        ask = 4000
        ${BUY_META}
      ${SELL_EUR}
    ${RATES}`,
        BOH: `exchange-office
    id = 41
    name = Exchanger 5
    country = BOH
    exchanges
      exchange
        ask = 1234
        ${BUY_META}
      ${SELL_EUR}
    ${RATES}
  exchange-office
    id = 42
    name = Exchanger 6
    country = BOH
    exchanges
      exchange
        ask = 2345
        ${BUY_META}
      ${SELL_EUR}
    ${RATES}
  exchange-office
    id = 43
    name = Exchanger 7
    country = BOH
    exchanges
      exchange
        ask = 44561
        ${BUY_META}
      ${SELL_EUR}
    ${RATES}
  exchange-office
    id = 44
    name = Exchanger 8
    country = BOH
    exchanges
      exchange
        ask = 4567
        ${BUY_META}
      ${SELL_EUR}
    ${RATES}`,
      };
      await dbLoader(`exchange-offices
  ${OFFICES.UKR}
  ${OFFICES.USA}
  ${OFFICES.BYZ}
  ${OFFICES.BOH}
countries
  country
    code = UKR
    name = Ukraine`);

      const result = await repository.getTopExchangers('2023-04-01', '2023-05-01');

      expect(result).toEqual([
        { country: 'USA', ids: ['23', '22', '21'], profit: 69.5 },
        { country: 'BOH', ids: ['43', '44', '42'], profit: 28.73649999999961 },
        { country: 'BYZ', ids: ['33', '32', '31'], profit: 20.5 },
      ]);
    });
  });
});
