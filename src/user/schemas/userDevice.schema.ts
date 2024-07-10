import { HydratedDocument, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiPropertyOptional } from '@nestjs/swagger';

@Schema({ versionKey: false, timestamps: false })
export class UserDevice {
  @ApiPropertyOptional({
    description: 'The user id of the owner of this device',
    example: '6679fd583a3a52c24359bd0f',
  })
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  owner: Types.ObjectId;

  @ApiPropertyOptional({
    description: 'The type of the device',
    example: 'Smartphone',
  })
  @Prop({ type: String, required: false })
  type?: string;

  @ApiPropertyOptional({
    description: 'The model of the device',
    example: 'iPhone 13',
  })
  @Prop({ type: String, required: false })
  model?: string;

  @ApiPropertyOptional({
    description: 'The operating system of the device',
    example: 'iOS 15',
  })
  @Prop({ type: String, required: false })
  os?: string;

  @ApiPropertyOptional({
    description: 'The serial number of the device',
    example: 'SN1234567890',
  })
  @Prop({ type: String, required: false })
  serialNumber?: string;

  @ApiPropertyOptional({
    description: 'The manufacturer of the device',
    example: 'Apple',
  })
  @Prop({ type: String, required: false })
  manufacturer?: string;
}

export type UserDeviceDocument = HydratedDocument<UserDevice>;

export const UserDeviceSchema = SchemaFactory.createForClass(UserDevice);
