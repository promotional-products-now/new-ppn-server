import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { STATUS_ENUM } from '../product.interface';
import { ApiProperty } from '@nestjs/swagger';

@Schema({
  timestamps: true,
  versionKey: false,
})
export class Supplier extends Document {
  @Prop({ type: String })
  @ApiProperty()
  name: string;

  @Prop({ type: String, index: true })
  @ApiProperty()
  supplierId: string;

  @Prop({ type: String })
  @ApiProperty()
  country: string;

  @Prop({ type: String })
  @ApiProperty()
  appaMemberNumber: string;

  @Prop({ type: Boolean, default: true })
  @ApiProperty({ type: 'boolean', example: true })
  isActive: boolean;

  @Prop({ type: String, enum: STATUS_ENUM, default: STATUS_ENUM.BUY_NOW })
  @ApiProperty({
    type: 'string',
    enum: STATUS_ENUM,
    example: STATUS_ENUM.BUY_NOW,
  })
  status: string;

  @Prop({
    type: {
      abn: { type: String },
      fax: { type: String },
      email: { type: String },
      brands: { type: String },
      phone_1: { type: String },
      phone_2: { type: String },
      website: { type: String },
      contacts: [
        {
          name: { type: String },
          email: { type: String },
          phone_1: { type: String },
          phone_2: { type: String },
          position: { type: String },
        },
      ],
      addresses: [
        {
          type: { type: String },
          state: { type: String },
          suburb: { type: String },
          address: { type: String },
          country: { type: String },
          postcode: { type: String },
        },
      ],
      appaName: { type: String },
      appaNotes: { type: String },
      appaProfile: { type: String },
      appaIdentifier: { type: String },
    },
  })
  details: {
    abn: string;
    fax: string;
    email: string;
    brands: string;
    phone_1: string;
    phone_2: string;
    website: string;
    contacts: {
      name: string;
      email: string;
      phone_1: string;
      phone_2: string;
      position: string;
    }[];
    addresses: {
      type: string;
      state: string;
      suburb: string;
      address: string;
      country: string;
      postcode: string;
    }[];
    appaName: string;
    appaNotes: string;
    appaProfile: string;
    appaIdentifier: string;
  };

  @Prop({ type: Boolean, default: false })
  @ApiProperty({ type: 'boolean', example: false })
  pricesAud: boolean;

  @Prop({ type: Boolean, default: false })
  @ApiProperty({ type: 'boolean', example: false })
  pricesNzd: boolean;

  @Prop({ type: Boolean, default: false })
  @ApiProperty({ type: 'boolean', example: false })
  removedFromPromodata: boolean;
}

export type SupplierDocument = HydratedDocument<Supplier>;

export const SupplierSchema = SchemaFactory.createForClass(Supplier).set(
  'versionKey',
  false,
);
