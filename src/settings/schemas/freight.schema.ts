import { Document, HydratedDocument, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { DestinationType, FreightType } from '../settings.interface';
import { ApiProperty } from '@nestjs/swagger';
import { Supplier } from '../../product/schemas/supplier.schema';

@Schema({
  timestamps: true,
})
export class Freight extends Document {
  @Prop({
    type: Types.ObjectId,
    ref: 'Supplier',
  })
  @ApiProperty({
    description: 'Supplier details',
  })
  supplier: Types.ObjectId;

  @Prop({
    type: String,
    enum: FreightType,
    default: FreightType.FIX,
  })
  @ApiProperty({
    description: 'Freight type',
    example: FreightType.FIX,
    enum: FreightType,
    default: FreightType.FIX,
  })
  type: FreightType;

  @Prop({
    type: Number,
    default: 100,
  })
  @ApiProperty({
    description: 'Fixed freight price',
    example: 100,
  })
  freightPrice: number;

  @Prop({
    type: String,
    enum: DestinationType,
    default: DestinationType.UN_CONDITIONAL,
  })
  @ApiProperty({
    description: 'Freight destination type',
    example: DestinationType.UN_CONDITIONAL,
    enum: DestinationType,
    default: DestinationType.UN_CONDITIONAL,
  })
  destinationType: DestinationType;

  @Prop({
    type: [Number],
  })
  @ApiProperty({
    description: 'Supplier selected destinations',
    example: [11233, 443343],
  })
  destinations: number[];
}

export type FreightDocument = HydratedDocument<Freight>;

export const FreightSchema = SchemaFactory.createForClass(Freight).set(
  'versionKey',
  false,
);
