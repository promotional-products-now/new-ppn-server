import { Module } from '@nestjs/common';
import { UserSearchService } from './user_search.service';
import { SearchController } from './search.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../user/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [SearchController],
  providers: [UserSearchService],
})
export class SearchModule {}
