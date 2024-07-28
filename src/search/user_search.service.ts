import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { UserSearchDto } from './dto/user-search.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../user/schemas/user.schema';
import { Model } from 'mongoose';
import { UserStatus } from '../user/enums/status.enum';
import { FindUsers } from '../user/dto/fetch-user.dto';

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
      let { page = 1, limit = 10, searchTerm } = searchData;

      if (!page || page <= 0) {
        page = 1;
      }
      if (!limit || limit <= 0) {
        limit = 10;
      }

      const skip = (page - 1) * limit;

      const formattedString = this.formatSearchTerm(searchTerm).toLowerCase();

      const users = await this.userModel.find(
        {
          status: { $ne: UserStatus.DELETED },
          $or: [
            {
              'email.address': {
                $regex: searchTerm.toLowerCase(),
              },
            },
            { firstName: { $regex: formattedString } },
            { lastName: { $regex: formattedString } },
          ],
        },
        { password: 0, otpSecret: 0 },
        { skip, limit: limit + 1 },
      );

      const total = await this.userModel.countDocuments({
        status: { $ne: UserStatus.DELETED },
        $or: [
          {
            'email.address': {
              $regex: searchTerm.toLowerCase(),
            },
          },
          { firstName: { $regex: formattedString } },
          { lastName: { $regex: formattedString } },
        ],
      });

      const hasPrevious = skip === 0 ? false : true;
      const hasNext = users.length > limit ? true : false;
      const nextPage = hasNext ? page + 1 : null;
      const prevPage = hasPrevious ? page - 1 : null;

      if (users.length > limit) {
        users.pop();
      }
      return {
        users,
        hasPrevious,
        hasNext,
        nextPage,
        prevPage,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      throw new InternalServerErrorException('Error retrieving users', error);
    }
  }
}
