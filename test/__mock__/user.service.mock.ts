import { Types } from 'mongoose';

import { faker } from '@faker-js/faker';
import { CountUserResDto } from '../../src/user/dto/count-user.dto';
import { FindUsers } from '../../src/user/dto/fetch-user.dto';
import { UserRole } from '../../src/user/enums/role.enum';
import { UserStatus } from '../../src/user/enums/status.enum';
import { User } from '../../src/user/schemas/user.schema';

export const mockUserService = {
  findAllAdmin: jest.fn().mockImplementation((paginationDto) => {
    return generateFakeUsers(paginationDto.limit);
  }),

  updateOne: jest.fn().mockImplementation((userId, updateUserDto) => {
    return { message: 'update successful' };
  }),

  updateUserDevice: jest.fn().mockImplementation((userId, newDevice) => {
    return { message: 'update successful' };
  }),

  countUsers: jest.fn().mockImplementation(() => {
    return {
      totalUsers: faker.number.int({ min: 100, max: 1000 }),
      newUsers: faker.number.int({ min: 1, max: 10 }),
    } as CountUserResDto;
  }),

  findWithCreatedAt: jest.fn().mockImplementation((filterQuery) => {
    return generateFakeUsers(filterQuery.limit);
  }),

  banUserAccount: jest.fn().mockImplementation((userId) => {
    return generateFakeUser(userId);
  }),

  banMultipleUserAccounts: jest.fn().mockImplementation((users) => {
    return { bannedUsers: true };
  }),

  findOneById: jest.fn().mockImplementation((id) => {
    return generateFakeUser(id);
  }),

  deleteOne: jest.fn().mockImplementation((id) => {
    return generateFakeUser(id);
  }),

  find: jest.fn().mockImplementation((paginationDto) => {
    return generateFakeUsers(paginationDto.limit);
  }),

  deleteMany: jest.fn().mockImplementation((ids) => {
    return { deletedCount: ids.length };
  }),
};

const generateFakeUser = (id: string): User => {
  return {
    _id: new Types.ObjectId(id),
    email: {
      address: faker.internet.email(),
      isVerified: faker.datatype.boolean(),
    },
    phone: faker.phone.number(),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    status: UserStatus.ACTIVE,
    password: faker.internet.password(),
    role: UserRole.USER,
    adminId: faker.string.uuid(),
    location: {
      address: faker.location.streetAddress(),
      city: faker.location.city(),
      state: faker.location.state(),
      country: faker.location.country(),
      timeZone: faker.location.timeZone(),
      postCode: faker.location.zipCode(),
    },
    images: [faker.image.avatar()],
    userDevice: new Types.ObjectId(),
    lastActive: faker.date.recent(),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    otpSecret: faker.string.alphanumeric(16),
  } as User;
};

const generateFakeUsers = (count: number): FindUsers => {
  const users = [];
  for (let i = 0; i < count; i++) {
    users.push(generateFakeUser(new Types.ObjectId().toString()));
  }
  return {
    users,
    hasPrevious: false,
    hasNext: false,
    nextPage: null,
    prevPage: null,
    totalPages: 1,
  } as FindUsers;
};
