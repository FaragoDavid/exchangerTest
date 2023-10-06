import { parse } from './index';

describe('Dump Parser', () => {
  const input = `exchange-offices
  exchange-office
    id = 1
    name = Exchanger 1
    country = UKR
    exchanges
      exchange
        from = EUR
        to = USD
        ask = 110
        date = 2023-04-24 22:55:33
      exchange
        from = USD
        to = UAH
        ask = 400
        date = 2023-04-24 22:55:33
    rates
      rate
        from = EUR
        to = USD
        in = 1.1
        out = 1
        reserve = 120000
        date = 2023-04-24 22:55:33
      rate
        from = USD
        to = UAH
        in = 1
        out = 40
        reserve = 150000
        date = 2023-04-24 22:55:33
  exchange-office
    id = 2
    name = Exchanger 2
    country = UKR
    rates
      rate
        from = AUD
        to = CAD
        in = 1
        out = 2
        reserve = 150000
        date = 2023-04-24 22:55:33
countries
  country
    code = UKR
    name = Ukraine
`;

  it('should parse exchange offices', () => {
    expect(parse(input).exchangeOffices).toEqual([
      {
        id: '1',
        name: 'Exchanger 1',
        country: 'UKR',
        exchanges: [
          { from: 'EUR', to: 'USD', ask: 110, date: '2023-04-24 22:55:33' },
          { from: 'USD', to: 'UAH', ask: 400, date: '2023-04-24 22:55:33' },
        ],
        rates: [
          { from: 'EUR', to: 'USD', in: 1.1, out: 1, reserve: 120000, date: '2023-04-24 22:55:33' },
          { from: 'USD', to: 'UAH', in: 1, out: 40, reserve: 150000, date: '2023-04-24 22:55:33' },
        ],
      },
      {
        id: '2',
        name: 'Exchanger 2',
        country: 'UKR',
        exchanges: [],
        rates: [{ from: 'AUD', to: 'CAD', in: 1, out: 2, reserve: 150000, date: '2023-04-24 22:55:33' }],
      },
    ]);
  });

  it('should parse countries', () => {
    expect(parse(input).countries).toEqual([{ code: 'UKR', name: 'Ukraine' }]);
  });
});
