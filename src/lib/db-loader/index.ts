import { parse } from '../dump-parser';
import country from '../../repository/country';
import exchangeOffice from '../../repository/exchange-office';

export default async function (dbDump: string) {
  const { exchangeOffices, countries } = parse(dbDump);

  await Promise.all([exchangeOffice.createBatch(exchangeOffices), country.createBatch(countries)]);
}
