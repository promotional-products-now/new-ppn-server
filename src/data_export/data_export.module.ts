import { Module } from '@nestjs/common';
import { UserDataExportService } from './user_data_export.service';
import { DataExportController } from './data_export.controller';
import { User, UserSchema } from '../user/schemas/user.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [DataExportController],
  providers: [UserDataExportService],
})
export class DataExportModule {}
