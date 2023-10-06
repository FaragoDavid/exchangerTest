import prisma from '../../lib/prisma-client';
import repository from './index';

describe('Country Repository', () => {
  const country1 = { code: 'USA', name: 'Country 1' };
  const country2 = { code: 'UKR', name: 'Country 2' };

  afterEach(async () => {
    await prisma.country.deleteMany();
  });

  describe('#createBatch', () => {
    it('should create exchange office DB records', async () => {
      await repository.createBatch([country1, country2]);

      expect(await prisma.country.findMany()).toEqual([country1, country2]);
    });
  });
});
