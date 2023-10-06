import app from '../../app';
import exchangeOffice from '../../repository/exchange-office';

jest.mock('../../repository/exchange-office');

describe('Exchanger Controller', () => {
  test('sends top exchangers', async () => {
    const topExchangers = [{ test: 'test' }];
    (exchangeOffice.getTopExchangers as jest.Mock).mockResolvedValue(topExchangers);

    const response = await app().inject({
      method: 'GET',
      url: `/exchangers/top`,
    });

    expect(response.json()).toEqual({ topExchangers });
  });
});
