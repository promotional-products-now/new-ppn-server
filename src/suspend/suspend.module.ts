import { forwardRef, Module } from '@nestjs/common';
import { SuspendService } from './suspend.service';
import { SuspendController } from './suspend.controller';
import { Suspend, SuspendSchema } from './schemas/suspend.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../user/schemas/user.schema';
import { JWTModule } from '../commons/services/JWTService/JWTService.module';
import { UserActivityModule } from '../user_activity/user_activity.module';
import { AuthorizationGuard } from '../commons/guards/authorization.guard';
import { UserModule } from '../user/user.module';
import { EmailModule } from 'src/email/email.module';

@Module({
  imports: [
    JWTModule,
    UserActivityModule,
    MongooseModule.forFeature([
      { name: Suspend.name, schema: SuspendSchema },
      { name: User.name, schema: UserSchema },
    ]),
    forwardRef(() => UserModule),
    EmailModule,
  ],
  controllers: [SuspendController],
  providers: [SuspendService, AuthorizationGuard],
})
export class SuspendModule {}
