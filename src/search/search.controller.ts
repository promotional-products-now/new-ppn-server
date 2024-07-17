import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { UserSearchService } from './user_search.service';
import { UserSearchDto } from './dto/user-search.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FindUsers } from 'src/user/dto/fetch-user.dto';

@ApiTags('search')
@Controller('search')
export class SearchController {
  constructor(private readonly userSearchService: UserSearchService) {}

  @Get('/user')
  @ApiOperation({ summary: 'Retrieve user search' })
  @ApiResponse({
    status: 200,
    description: 'Successfully searched users.',
    type: FindUsers,
  })
  async searchUser(@Query() userSearchDto: UserSearchDto) {
    return this.userSearchService.userSearch(userSearchDto);
  }
}
