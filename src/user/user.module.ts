import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { JWTModule } from '../commons/services/JWTService/JWTService.module';
import { UserDevice, UserDeviceSchema } from './schemas/userDevice.schema';
import { UserActivityModule } from '../user_activity/user_activity.module';
// import { FileUploadModule } from '../commons/services/FileUploadService/file-upload.module';

@Module({
  imports: [
    JWTModule,
    UserActivityModule,
    // FileUploadModule,
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: UserDevice.name, schema: UserDeviceSchema },
    ]),
  ],
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
