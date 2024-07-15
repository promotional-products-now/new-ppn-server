import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { UserSearchDto } from './dto/user-search.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from 'src/user/schemas/user.schema';
import { Model } from 'mongoose';
import { UserStatus } from 'src/user/enums/status.enum';
import { FindUsers } from 'src/user/dto/fetch-user.dto';

@Injectable()
export class UserSearchService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  private formatSearchTerm(searchTerm: string) {
    if (!searchTerm) {
      return '';
    }

    const noSpaces = searchTerm.replace(/\s+/g, '');

    return noSpaces.charAt(0).toUpperCase() + noSpaces.slice(1).toLowerCase();
  }

  async userSearch(searchData: UserSearchDto): Promise<FindUsers> {
    try {
      const data = searchData;
      const page = data.page ? data.page : 0;
      const limit = data.limit ? data.limit : 10;
      const skip = page === 0 ? 0 : (page - 1) * limit;

      const formattedString = this.formatSearchTerm(
        searchData.searchTerm,
      ).toLowerCase();

      const users = await this.userModel.find(
        {
          status: { $ne: UserStatus.DELETED },
          $or: [
            {
              'email.address': {
                $regex: searchData.searchTerm.toLowerCase(),
              },
            },
            { firstName: { $regex: formattedString } },
            { lastName: { $regex: formattedString } },
          ],
        },
        { password: 0, otpSecret: 0 },
        { skip, limit: limit + 1 },
      );

      const hasPrevious = skip === 0 ? false : true;
      const hasNext = users.length > limit ? true : false;
      const nextPage = hasNext ? page + 1 : null;
      const prevPage = hasPrevious ? page - 1 : null;

      if (users.length > limit) {
        users.pop();
      }
      return { users, hasPrevious, hasNext, nextPage, prevPage };
    } catch (error) {
      throw new InternalServerErrorException('Error retrieving users', error);
    }
  }
}
