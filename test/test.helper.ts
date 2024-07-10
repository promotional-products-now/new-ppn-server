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
    userName: params.userName ?? faker.internet.userName(),
    gender: faker.person.gender(),
    lastActive: undefined,
    password: '',
    otpSecret: speakeasy.generateSecret().base32,
    role: UserRole.USER,
    church: '',
    about: faker.lorem.sentences(3),
    nationality: Nationality.NIGERIA,
    ethnicity: 'Africa',
    height: '',
    status: UserStatus.ACTIVE,
    relationshipType: RelationshipType.Marriage,
    dob: faker.date.past(),
    location: null,
    userDevice: null,
    rooms: [],
    blockedUsers: [],
    images: [],
  };
};
