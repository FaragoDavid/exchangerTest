import prisma from '../../lib/prisma-client';
import { Country } from '@prisma/client';

export default {
  async createBatch(countries: Country[]) {
    await prisma.country.createMany({ data: countries });
  },
};
