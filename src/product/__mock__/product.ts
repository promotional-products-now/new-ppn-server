import { faker } from '@faker-js/faker';

const getProductMock = () => {
  return {
    meta: {
      id: faker.string.uuid(),
      country: faker.location.country(),
      dataSource: 'API',
      discontinued: faker.helpers.arrayElement([true, false]),
      canCheckStock: faker.helpers.arrayElement([true, false]),
      discontinuedAt: faker.helpers.arrayElement([new Date(), null]),
      firstListedAt: faker.date.past({ years: 2 }),
      lastChangedAt: faker.date.past({ years: 2 }),
      priceCurrencies: faker.helpers.arrayElements(['AUD', 'NZD']),
      pricesChangedAt: faker.date.past({ years: 1 }),
      discontinuedReason: faker.lorem.lines(),
      sourcesDataChangedAt: faker.date.past(),
      verifiedLast3months: faker.helpers.arrayElement([true, false]),
      changedComparisonTimestamp: faker
    },
  };
};
