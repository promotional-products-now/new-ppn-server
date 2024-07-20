import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { HydratedDocument, Types } from 'mongoose';

@Schema({ versionKey: false, timestamps: true })
export class UserActivity {
  @ApiProperty({ example: '12345677654' })
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @ApiProperty({ example: '12345677654' })
  @Prop({ type: String, required: true })
  activity: string;

  @ApiProperty({ example: '2024-03-10' })
  @Prop({ type: Date })
  createdAt: Date;

  @ApiProperty({ example: '2024-03-10' })
  @Prop({ type: Date })
  updatedAt: Date;

  @ApiProperty({ type: Map })
  @Prop({ type: Map, of: String })
  additionalData?: Record<string, any>;
}

export type UserActivityDocument = HydratedDocument<UserActivity>;

export const UserActivitySchema = SchemaFactory.createForClass(UserActivity);
