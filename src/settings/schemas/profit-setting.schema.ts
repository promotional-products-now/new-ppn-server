import { Document, HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory, raw } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';

interface ProfitMarkup {
  nonVip: number;
  goldVip: number;
  diamondVip: number;
}

@Schema({
  timestamps: true,
})
export class ProfitSetting extends Document {
  @Prop(
    raw({
      nonVip: { type: Number, required: true },
      goldVip: { type: Number, required: true },
      diamondVip: { type: Number, required: true },
    }),
  )
  @ApiProperty({
    description: 'Minimum profit setting',
    example: {
      nonVip: 100,
      goldVip: 100,
      diamondVip: 100,
    },
  })
  minimumProfit: ProfitMarkup;

  @Prop(
    raw({
      nonVip: { type: Number, required: true },
      goldVip: { type: Number, required: true },
      diamondVip: { type: Number, required: true },
    }),
  )
  @ApiProperty({
    description: 'Default profit markup',
    example: {
      nonVip: 100,
      goldVip: 100,
      diamondVip: 100,
    },
  })
  defaultProfitMarkup: ProfitMarkup;
}

export type ProfitSettingDocument = HydratedDocument<ProfitSetting>;

export const ProfitSettingSchema = SchemaFactory.createForClass(
  ProfitSetting,
).set('versionKey', false);
