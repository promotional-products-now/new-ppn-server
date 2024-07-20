import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { HydratedDocument, Types } from 'mongoose';
import { User } from '../../user/schemas/user.schema';

@Schema({ versionKey: false })
export class Suspend {
  @ApiProperty({
    description: 'User ID',
    example: '60d21b4667d0d8992e610c85',
  })
  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  userId: Types.ObjectId;

  @ApiProperty({
    description: 'Reason for suspension',
    example: 'Violation of terms',
  })
  @Prop({ required: true })
  reason: string;

  @ApiProperty({
    description: 'Date of suspension',
    example: '2024-07-03T00:00:00.000Z',
  })
  @Prop({ default: Date.now })
  suspendedAt: Date;

  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  suspendedBy: Types.ObjectId;
}

export type SuspendDocument = HydratedDocument<Suspend>;

export const SuspendSchema = SchemaFactory.createForClass(Suspend);
