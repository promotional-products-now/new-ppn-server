import { UserRole } from '../src/user/enums/role.enum';
import { User } from '../src/user/schemas/user.schema';
import { Nationality } from '../src/user/enums/nationality.enum';
import { RelationshipType } from '../src/user/enums/relationshipType.enum';
import { faker } from '@faker-js/faker';
import * as speakeasy from 'speakeasy';
import { UserStatus } from '../src/user/enums/status.enum';

export const getUser = (params: {
  email?: string;
  userName?: string;
  isVerified?: boolean;
}): User => {
  return {
    email: {
      address: params.email ?? faker.internet.email(),
      isVerified: params.isVerified ?? false,
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
