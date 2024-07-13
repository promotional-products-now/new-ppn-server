import { faker } from '@faker-js/faker';
import { DestinationType, FreightType } from '../settings.interface';

export function createFreightMock() {
  return {
    id: faker.database.mongodbObjectId(),
    type: faker.helpers.enumValue(FreightType),
    freightPrice: faker.helpers.rangeToNumber(200),
    vendor: faker.database.mongodbObjectId(),
    destinationType: faker.helpers.enumValue(DestinationType),
    destinations: Array(5).fill(faker.number.int({ max: 30000 })),
  };
}
