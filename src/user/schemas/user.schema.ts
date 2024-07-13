import { HydratedDocument, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Email, Location } from '../user.interface';
import { UserRole } from '../enums/role.enum';
import { UserStatus } from '../enums/status.enum';

@Schema({ versionKey: false, timestamps: true })
export class User {
  @ApiProperty({
    description: 'Email object containing address and verification status',
    example: { address: 'example@example.com', isVerified: true },
    required: true,
  })
  @Prop({
    type: {
      address: { type: String, required: true, unique: true },
      isVerified: { type: Boolean, default: false, required: false },
    },
    required: true,
    _id: false,
  })
  email: Email;

  phone: string;

  @ApiProperty({
    description: 'First Name',
    example: 'john',
  })
  @Prop({ required: true })
  firstName: string;

  @ApiProperty({
    description: 'Last name',
    example: 'doe',
  })
  @Prop({ required: true })
  lastName: string;

  @ApiProperty({
    description: 'User status',
    enum: UserStatus,
    default: UserStatus.ACTIVE,
  })
  @Prop({
    type: String,
    enum: UserStatus,
    default: UserStatus.ACTIVE,
    required: false,
  })
  status: UserStatus;

  @ApiProperty({
    description: 'Encrypted password',
    example: 'encrypted_password',
  })
  @Prop({ required: true })
  password: string;

  @ApiPropertyOptional({
    description: 'OTP secret for two-factor authentication',
    example: 'secret_otp',
  })
  @Prop()
  otpSecret: string;

  @ApiProperty({
    description: 'User role',
    enum: UserRole,
    default: UserRole.USER,
  })
  @Prop({ type: String, enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @ApiPropertyOptional({
    description: 'admin id',
    example: 'jnfafj88u03',
  })
  @Prop({ required: false })
  adminId: string;

  @ApiPropertyOptional({
    description: 'Location details of the user',
    example: {
      address: '123 Main St',
      city: 'Anytown',
      state: 'CA',
      country: 'australia',
      timeZone: 'PST',
      postCode: '09934049',
    },
  })
  @Prop({
    type: {
      address: { type: String },
      city: { type: String, required: false },
      state: { type: String },
      country: { type: String, default: 'Australia' },
      timeZone: { type: String, required: false },
      postCode: { type: String, required: false },
    },
    required: false,
  })
  location: Location;

  @Prop([String])
  images: string[];

  @ApiPropertyOptional({
    description: 'device imformation',
  })
  @Prop({ type: Types.ObjectId, ref: 'UserDevice', required: false })
  userDevice: Types.ObjectId;

  @ApiPropertyOptional({ description: 'Last active date', type: Date })
  @Prop()
  lastActive: Date;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
  // @Prop({ default: null })
  // refreshToken: string | null;
}

export type UserDocument = HydratedDocument<User>;

export const UserSchema = SchemaFactory.createForClass(User);
