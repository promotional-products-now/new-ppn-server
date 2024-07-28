import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { UserService } from '../src/user/user.service';
import { User, UserDocument } from '../src/user/schemas/user.schema';
import { Types } from 'mongoose';
import { CreateUserDevice } from '../src/user/dto/create-user.dto';
import { UserStatus } from '../src/user/enums/status.enum';
import { BanMultipleUsersDto } from '../src/user/dto/update-user.dto';
import { PaginationDto } from '../src/commons/dtos/pagination.dto';
import { faker } from '@faker-js/faker';
import { UserDeviceStub, UserStub } from '../src/user/user.stubs';
import { mockUserService } from './__mock__/user.service.mock';
import { UserModule } from '../src/user/user.module';
// import {
//   mockMongooseConnection,
//   mongooseMockProviders,
// } from './__mock__/mongoose.service.mock';

// jest.setTimeout(20000); // Set timeout globally

describe('UserController (e2e)', () => {
  let app: INestApplication;

  const mockUserId = new Types.ObjectId().toHexString();
  const mockUser: User = UserStub();

  beforeAll(async () => {
    jest.setTimeout(7000);
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      // providers: [mockMongooseConnection, ...mongooseMockProviders],
    })
      .overrideProvider(UserService)
      .useValue(mockUserService)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/users (GET)', async () => {
    jest.spyOn(mockUserService, 'find').mockResolvedValue({
      users: [mockUser],
      hasPrevious: false,
      hasNext: false,
      nextPage: null,
      prevPage: null,
      totalPages: 1,
    });

    return request(app.getHttpServer())
      .get('/users')
      .query({ page: 1, limit: 10 } as PaginationDto)
      .expect(200)
      .expect((res) => {
        expect(res.body.users).toEqual(expect.any(Array));
      });
  });

  // it('/users/:id (GET)', async () => {
  //   jest.spyOn(mockUserService, 'findOneById').mockResolvedValue({
  //     ...mockUser,
  //     _id: new Types.ObjectId(),
  //   } as UserDocument);

  //   return request(app.getHttpServer())
  //     .get(`/users/${mockUserId}`)
  //     .expect(200)
  //     .expect((res) => {
  //       expect(res.body).toHaveProperty('_id', mockUserId);
  //     });
  // });

  // it('/users (PATCH)', async () => {
  //   jest
  //     .spyOn(mockUserService, 'updateOne')
  //     .mockResolvedValue({ message: 'update successful' });

  //   return request(app.getHttpServer())
  //     .patch('/users')
  //     .send({
  //       userId: mockUserId,
  //       email: 'newemail@example.com',
  //       name: 'Updated Name',
  //     })
  //     .expect(200)
  //     .expect((res) => {
  //       expect(res.body.message).toBe('update successful');
  //     });
  // });

  // it('/users/device (PUT)', async () => {
  //   const newDevice: CreateUserDevice = UserDeviceStub();
  //   jest
  //     .spyOn(mockUserService, 'updateUserDevice')
  //     .mockResolvedValue({ message: 'update successful' });

  //   return request(app.getHttpServer())
  //     .put('/users/device')
  //     .send(newDevice)
  //     .expect(200)
  //     .expect((res) => {
  //       expect(res.body.message).toBe('update successful');
  //     });
  // });

  // it('/users/count-users (GET)', async () => {
  //   jest.spyOn(mockUserService, 'countUsers').mockResolvedValue({
  //     totalUsers: 100,
  //     newUsers: 10,
  //   });

  //   return request(app.getHttpServer())
  //     .get('/users/count-users')
  //     .expect(200)
  //     .expect((res) => {
  //       expect(res.body).toEqual({
  //         totalUsers: 100,
  //         newUsers: 10,
  //       });
  //     });
  // });

  // it('/users (DELETE)', async () => {
  //   jest
  //     .spyOn(mockUserService, 'deleteOne')
  //     .mockResolvedValue(mockUser as UserDocument);

  //   return request(app.getHttpServer())
  //     .delete(`/users/${mockUserId}`)
  //     .expect(200)
  //     .expect((res) => {
  //       expect(res.body).toHaveProperty('_id', mockUserId);
  //     });
  // });

  // it('/users/filter (GET)', async () => {
  //   jest.spyOn(mockUserService, 'findWithCreatedAt').mockResolvedValue({
  //     users: [mockUser],
  //     hasPrevious: false,
  //     hasNext: false,
  //     nextPage: null,
  //     prevPage: null,
  //     totalPages: 1,
  //   });

  //   return request(app.getHttpServer())
  //     .get('/users/filter')
  //     .query({ startDate: '2024-01-01', endDate: '2024-01-31' })
  //     .expect(200)
  //     .expect((res) => {
  //       expect(res.body.users).toEqual(expect.any(Array));
  //       expect(res.body.users[0]).toHaveProperty('_id', mockUserId);
  //     });
  // });

  // it('/users/ban-users (PUT)', async () => {
  //   const banDto: BanMultipleUsersDto = {
  //     usersId: [mockUserId],
  //   };
  //   jest
  //     .spyOn(mockUserService, 'banMultipleUserAccounts')
  //     .mockResolvedValue({ bannedUsers: true });

  //   return request(app.getHttpServer())
  //     .put('/users/ban-users')
  //     .send(banDto)
  //     .expect(200)
  //     .expect((res) => {
  //       expect(res.body.bannedUsers).toBe(true);
  //     });
  // });

  // it('/users/user/:id (PUT)', async () => {
  //   jest
  //     .spyOn(mockUserService, 'banUserAccount')
  //     .mockResolvedValue(mockUser as UserDocument);

  //   return request(app.getHttpServer())
  //     .put(`/users/user/${mockUserId}`)
  //     .expect(200)
  //     .expect((res) => {
  //       expect(res.body).toHaveProperty('_id', mockUserId);
  //       expect(res.body.status).toBe(UserStatus.BANNED);
  //     });
  // });

  // it('/users (DELETE multiple)', async () => {
  //   jest
  //     .spyOn(mockUserService, 'deleteMany')
  //     .mockResolvedValue({ deletedCount: 2 } as any);

  //   return request(app.getHttpServer())
  //     .delete('/users')
  //     .send({ ids: [mockUserId, new Types.ObjectId().toHexString()] })
  //     .expect(200)
  //     .expect((res) => {
  //       expect(res.body.deletedCount).toBe(2);
  //     });
  // });
});
