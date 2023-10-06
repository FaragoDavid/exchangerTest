import prisma from '../../lib/prisma-client';
import { ExchangeOffice } from '@prisma/client';

type Office = ExchangeOffice & {
  exchanges: any[];
  rates: any[];
};

export default {
  async createBatch(exchangeOffices: Office[]) {
    for (const exchangeOffice of exchangeOffices) {
      const { exchanges, rates, ...office } = exchangeOffice;

      await prisma.exchangeOffice.create({ data: office });

      const exchangesWithId = exchanges.map((exchange) => ({ ...exchange, exchangeOfficeId: office.id }));
      await prisma.exchange.createMany({ data: exchangesWithId });

      const ratesWithId = rates.map((rate) => ({ ...rate, exchangeOfficeId: office.id }));
      await prisma.rate.createMany({ data: ratesWithId });
    }
  },
  async getTopExchangers(lastMonthStartDay: string, currentMonthStartDay: string) {
    return prisma.$queryRaw`
        WITH
        exchange_profits AS (
        SELECT office, SUM(profit) AS profit FROM (
          SELECT
              ask_bid_rate."exchangeOfficeId" AS office,
              ask_bid_rate.date,
              ask / (ask_usd_rate.out / ask_usd_rate.in) - (ask / (ask_bid_rate.out / ask_bid_rate.in)) / (bid_usd_rate.out / bid_usd_rate.in) AS profit
          FROM "Exchange" AS e
          INNER JOIN "Rate" AS ask_bid_rate ON 
              e."exchangeOfficeId" = ask_bid_rate."exchangeOfficeId" AND
              e.date = ask_bid_rate.date AND 
              e.from = ask_bid_rate.from AND 
              e.to = ask_bid_rate.to
          INNER JOIN "Rate" AS bid_usd_rate ON 
              e."exchangeOfficeId" = bid_usd_rate."exchangeOfficeId" AND
              e.date = bid_usd_rate.date AND
              e.from = bid_usd_rate.to AND
              bid_usd_rate.from = 'USD'
          INNER JOIN "Rate" AS ask_usd_rate ON 
              e."exchangeOfficeId" = ask_usd_rate."exchangeOfficeId" AND
              e.date = ask_usd_rate.date AND 
              e.to = ask_usd_rate.to AND 
              ask_usd_rate.from = 'USD' ) exchanges
        WHERE 
            date > CONCAT(${lastMonthStartDay}, ' 00:00:00') AND
            date < CONCAT(${currentMonthStartDay}, ' 00:00:00')
        GROUP BY office
      ),
      ranked_profits AS (
        SELECT 
          id, country, profit,
          RANK() OVER (PARTITION BY country ORDER BY profit DESC) AS office_rank
        FROM "ExchangeOffice" AS eo
        INNER JOIN exchange_profits
        ON eo.id = exchange_profits.office
      ),
      country_profits AS (
        SELECT 
          country, 
          ARRAY_AGG(id) AS ids, 
          SUM(profit) AS profit
        FROM ranked_profits
        WHERE office_rank <= 3
        GROUP BY country
      )
      
      SELECT * FROM country_profits
      ORDER BY profit desc
      LIMIT 3
      `;
  },
};
