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
  UploadedFile,
  UseInterceptors,
  Put,
  Req,
  UploadedFiles,
  NotFoundException,
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
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../commons/guards/roles.guard';
import { UserRole } from './enums/role.enum';
import { Roles } from '../commons/decorators/roles.decorator';
import { AuthorizationGuard } from '../commons/guards/authorization.guard';
// import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { CreateUserDevice, singleImageUploadDTO } from './dto/create-user.dto';
import { AzureBlobService } from '../commons/services/FileUploadService/azure-blob.service';

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

  @Get()
  @ApiOperation({ summary: 'Retrieve all users' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved all users.',
    type: [User],
  })
  async findAll(): Promise<UserDocument[]> {
    return await this.userService.find();
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

  @Get('/admins')
  @ApiOperation({ summary: 'Retrieve all admins' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved all admins.',
  })
  async findAllAdmin(): Promise<UserDocument[] | null> {
    return await this.userService.findAllAdmin();
  }

  @Patch('/')
  @ApiOperation({ summary: 'Update a user by ID' })
  @ApiBody({ type: UpdateUserDto, description: 'Updated user data' })
  async update(
    @Body() updateUserDto: UpdateUserDto,
    @Request() req,
  ): Promise<void> {
    const { userId } = req.user;
    const user = await this.userService.updateOne(userId, {
      ...updateUserDto,
      email: req.user.email,
    });
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

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a user by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  async delete(@Param('id') id: string): Promise<UserDocument | null> {
    return await this.userService.deleteOne(new Types.ObjectId(id));
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

  // @Post('/upload-single')
  // @ApiBody({
  //   type: singleImageUploadDTO,
  //   description: 'position of the image, count starts from 0',
  // })
  // @UseInterceptors(FileInterceptor('image'))
  // async uploadSingleImage(
  //   @Body('imagePosition')
  //   imagePosition: singleImageUploadDTO,
  //   @UploadedFile()
  //   file: Express.Multer.File,
  //   @Req() req,
  // ) {
  //   const { userId, email } = req.user;
  //   const user = await this.userService.findOneById(userId);
  //   if (!user) throw new NotFoundException('user not found');

  //   const uploadedUrl = await this.azureBlobService.uploadImage(
  //     file.buffer,
  //     `${user._id}/${user._id}_${imagePosition}`,
  //   );

  //   await this.userService.findOneAndUpdate(email.address, {
  //     $push: { images: uploadedUrl },
  //   });

  //   return { image: uploadedUrl };
  // }

  // @Post('/upload-multiple')
  // @UseInterceptors(FilesInterceptor('images'))
  // async uploadMultipleImages(
  //   @UploadedFiles() images: Express.Multer.File[],
  //   @Req() req,
  // ) {
  //   const { userId, email } = req.user;
  //   const user = await this.userService.findOneById(userId);
  //   if (!user) throw new NotFoundException('user not found');

  //   const uploadResults = await Promise.all(
  //     images.map((file, i) =>
  //       this.azureBlobService.uploadImage(
  //         file.buffer,
  //         `${user._id}/${user._id}_${i}`,
  //       ),
  //     ),
  //   );

  //   const _user = await this.userService.findOneAndUpdate(email.address, {
  //     images: uploadResults,
  //   });

  //   return _user;
  // }
}
