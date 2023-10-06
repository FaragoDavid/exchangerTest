import { Country, Exchange, ExchangeOffice, Rate } from '@prisma/client';

function parseRateData(rawRateData: string[]) {
  const rate = { from: '', to: '', in: 0, out: 0, reserve: 0, date: '' };

  rawRateData.forEach((rawProp) => {
    const [propName, value] = rawProp.trim().split(' = ');

    if (propName === 'from') rate.from = value;
    if (propName === 'to') rate.to = value;
    if (propName === 'in') rate.in = Number(value);
    if (propName === 'out') rate.out = Number(value);
    if (propName === 'reserve') rate.reserve = Number(value);
    if (propName === 'date') rate.date = value;
  });

  return rate;
}

function parseRates(rawRates: string[]) {
  const rates: any[] = [];

  rawRates.forEach((rawRate) => {
    const rawRateData = rawRate.split('\n');

    rates.push(parseRateData(rawRateData));
  });

  return rates;
}

function parseExchangeData(rawExchangeData: string[]) {
  const exchange = { from: '', to: '', ask: -1, date: '' };

  rawExchangeData.forEach((rawProp) => {
    const [propName, value] = rawProp.trim().split(' = ');

    if (propName === 'from') exchange.from = value;
    if (propName === 'to') exchange.to = value;
    if (propName === 'ask') exchange.ask = Number(value);
    if (propName === 'date') exchange.date = value;
  });

  return exchange;
}

function parseExchanges(rawExchanges: string[]) {
  const exchanges: any[] = [];

  rawExchanges.forEach((rawExchange) => {
    const rawExchangeData = rawExchange.split('\n');

    exchanges.push(parseExchangeData(rawExchangeData));
  });

  return exchanges;
}

function parseOfficeData(rawOfficeData: string[]) {
  const office = { id: '', name: '', country: '', exchanges: [] as any[], rates: [] as any[] };

  rawOfficeData.forEach((rawProp) => {
    const [propName, value] = rawProp.trim().split(' = ');

    if (propName === 'id') office.id = value;
    if (propName === 'name') office.name = value;
    if (propName === 'country') office.country = value;
  });

  return office;
}

function parseOffices(rawOffices: string[]) {
  const exchangeOffices: any[] = [];

  rawOffices.forEach((rawExchangeOffice) => {
    let rawOfficeData, rawExchanges, rawRates;

    if (rawExchangeOffice.includes('    exchanges\n')) {
      rawOfficeData = rawExchangeOffice.split('    exchanges\n')[0];
      [rawExchanges, rawRates] = rawExchangeOffice.split('    exchanges\n')[1].split('    rates\n');
    } else {
      [rawOfficeData, rawRates] = rawExchangeOffice.split('    rates\n');
    }

    const rawOfficeDataRows = rawOfficeData.split('\n');
    const rawExchangeRows = rawExchanges?.split('      exchange\n') || [];
    const rawRateRows = rawRates.split('      rate\n');

    rawOfficeDataRows.pop();
    rawExchangeRows.shift();
    rawRateRows.shift();

    const office = parseOfficeData(rawOfficeDataRows);

    exchangeOffices.push(office);
    office.exchanges = parseExchanges(rawExchangeRows);
    office.rates = parseRates(rawRateRows);
  });

  return exchangeOffices;
}

function parseCountryData(rawCountryData: string[]) {
  const country: Country = { code: '', name: '' };

  rawCountryData.forEach((rawProp) => {
    const [propName, value] = rawProp.trim().split(' = ');

    if (propName === 'code') country.code = value;
    if (propName === 'name') country.name = value;
  });

  return country;
}

function parseCountries(rawCountries: string) {
  const countries: Country[] = [];

  const rawCountryRows = rawCountries.split('  country\n');
  rawCountryRows.shift();

  rawCountryRows.forEach((rawCountry) => {
    const rawCountryData = rawCountry.split('\n');
    rawCountryData.pop();

    countries.push(parseCountryData(rawCountryData));
  });

  return countries;
}

export function parse(input: string) {
  const [rawOffices, rawCountries] = input.split('countries\n');
  const rawOfficeRows = rawOffices.split('  exchange-office\n');
  rawOfficeRows.shift();

  return {
    exchangeOffices: parseOffices(rawOfficeRows),
    countries: parseCountries(rawCountries),
  };
}
