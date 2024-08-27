import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  UseGuards,
  Request,
  Put,
  Req,
  Query,
} from '@nestjs/common';

import { UserService } from './user.service';
import { User, UserDocument } from './schemas/user.schema';
import { Types } from 'mongoose';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiSecurity,
} from '@nestjs/swagger';
import { LogoutUser, UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../commons/guards/roles.guard';
import { UserRole } from './enums/role.enum';
import { Roles } from '../commons/decorators/roles.decorator';
import { AuthorizationGuard } from '../commons/guards/authorization.guard';
// import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { CreateUserDevice, singleImageUploadDTO } from './dto/create-user.dto';
import { AzureBlobService } from '../commons/services/FileUploadService/azure-blob.service';
import { CountUserResDto } from './dto/count-user.dto';
import { FilterWithCreatedAt, FindUsers } from './dto/fetch-user.dto';
import { PaginationDto } from '../commons/dtos/pagination.dto';
import { Order } from 'src/order/schemas/order.schema';

@ApiTags('users')
@UseGuards(AuthorizationGuard)
@ApiSecurity('uid')
@ApiBearerAuth()
@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    // private readonly azureBlobService: AzureBlobService,
  ) {}

  @Get('/admins')
  @ApiOperation({ summary: 'Retrieve all admins' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved all admins.',
  })
  async findAllAdmin(
    @Query() paginationDto: PaginationDto,
  ): Promise<FindUsers | null> {
    return await this.userService.findAllAdmin(paginationDto);
  }

  @Patch('/')
  @ApiOperation({ summary: 'Update a user by ID' })
  @ApiBody({ type: UpdateUserDto, description: 'Updated user data' })
  async update(
    @Body() updateUserDto: UpdateUserDto,
    @Request() req,
  ): Promise<{ message: string }> {
    const { userId } = req.user;

    const user = await this.userService.updateOne(userId, {
      ...updateUserDto,
      ...(updateUserDto.email && { email: req.user.email }),
      //  ...(optionalKey8 && { optionalKey8 }),
    });
    return user;
  }

  @Patch('/:id')
  @ApiOperation({ summary: 'Update a user by ID' })
  @ApiBody({ type: UpdateUserDto, description: 'Updated user data' })
  async updateOne(
    @Body() updateUserDto: UpdateUserDto,
    @Param('id') id: string,
  ): Promise<{ message: string }> {
    console.log({ id });
    const user = await this.userService.updateOne(
      new Types.ObjectId(id),
      {
        ...updateUserDto,
        ...(updateUserDto.email && { email: { address: updateUserDto.email } }),
        //  ...(optionalKey8 && { optionalKey8 }),
      },
      true,
    );
    return user;
  }

  @Put('/device')
  @ApiOperation({ summary: 'Update user device information' })
  @ApiBody({
    description: 'The new device information',
    type: CreateUserDevice,
  })
  @ApiResponse({
    status: 200,
    description: 'The user device has been successfully updated.',
    type: User,
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async updateUserDevice(@Body() newDevice: CreateUserDevice, @Req() req) {
    const { userId } = req.user;

    return this.userService.updateUserDevice(userId, newDevice);
  }

  @Get('/count-users')
  @ApiOperation({
    summary:
      'Count the number of user and the number of new users on the platform',
  })
  @ApiResponse({
    status: 200,
    description:
      'Successfully retrieved the total number of users and the total number of new users.',
    type: CountUserResDto,
  })
  async countUsers(): Promise<CountUserResDto> {
    return await this.userService.countUsers();
  }

  @Get('/filter')
  @ApiOperation({ summary: 'Filtered all users' })
  @ApiResponse({
    status: 200,
    description: 'Successfully filtered all users.',
    type: FindUsers,
  })
  async filterUsersWithCreatedAt(@Query() filterQuery: FilterWithCreatedAt) {
    return await this.userService.findWithCreatedAt(filterQuery);
  }

  @ApiOperation({ summary: 'logout a user by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'Successfully logged out user.',
    type: User,
  })
  @Put('/user/logout/:id')
  @ApiResponse({
    status: 200,
    description: 'Successfully logged out user.',
    type: LogoutUser,
  })
  async logoutUser(@Param('id') id: string, @Request() req) {
    const { userId } = req.user;
    return await this.userService.logOutUser(id, userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a user by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved user.',
    type: User,
  })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async findOne(@Param('id') id: string): Promise<UserDocument | null> {
    return await this.userService.findOneById(new Types.ObjectId(id));
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a user by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  async delete(@Param('id') id: string): Promise<UserDocument | null> {
    return await this.userService.deleteOne(new Types.ObjectId(id));
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve all users' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved all users with pagination.',
    type: FindUsers,
  })
  async findAll(@Query() paginationDto: PaginationDto): Promise<FindUsers> {
    return await this.userService.find(paginationDto);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.SUPER_Admin)
  @Delete()
  @ApiOperation({ summary: 'Delete multiple users by IDs' })
  @ApiBody({ type: Array, description: 'array of user ids to delete' })
  async deleteMany(@Body('ids') ids: string[]): Promise<void> {
    const objectIds = ids.map((id) => new Types.ObjectId(id));
    await this.userService.deleteMany(objectIds);
  }
}
