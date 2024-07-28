import { faker } from '@faker-js/faker';
import { UserRole } from './enums/role.enum';
import { UserStatus } from './enums/status.enum';
import * as speakeasy from 'speakeasy';

export const UserStub = () => {
  return {
    _id: faker.database.mongodbObjectId(),
    email: {
      address: faker.internet.email(),
      isVerified: false,
    },
    lastActive: undefined,
    password: '',
    otpSecret: speakeasy.generateSecret().base32,
    role: UserRole.USER,
    status: UserStatus.ACTIVE,
    location: null,
    userDevice: null,
    images: [],
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    phone: faker.phone.number(),
    adminId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
};

export const FindUserStub = () => {
  return {
    users: [UserStub()],
    hasPrevious: false,
    hasNext: false,
    nextPage: null,
    prevPage: null,
    totalPages: 1,
  };
};

export const AdminStub = () => {
  return {
    _id: faker.database.mongodbObjectId(),
    email: {
      address: faker.internet.email(),
      isVerified: false,
    },
    lastActive: undefined,
    password: '',
    otpSecret: speakeasy.generateSecret().base32,
    role: UserRole.SUPER_Admin,
    status: UserStatus.ACTIVE,
    location: null,
    userDevice: null,
    images: [],
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    phone: faker.phone.number(),
    adminId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
};

export const FindAdminStub = () => {
  return {
    users: [AdminStub()],
    hasPrevious: false,
    hasNext: false,
    nextPage: null,
    prevPage: null,
    totalPages: 1,
  };
};

export const UserDeviceStub = () => {
  return {
    type: 'Android',
    model: 'Infinix Hot 40',
    os: 'Version 13',
    serialNumber: 'SN1234567890',
    manufacturer: 'Infinix',
  };
};

export const CountUserDtoStub = () => {
  return {
    totalUsers: 10,
    newUsers: 2,
  };
};
