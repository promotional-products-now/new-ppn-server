import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Types } from 'mongoose';
import { Supplier } from '../../product/schemas/supplier.schema';
import { ApiProperty } from '@nestjs/swagger';
import { STATUS_ENUM } from '../../product/product.interface';

@Schema({
  timestamps: false,
  versionKey: false,
})
export class ProductCategory extends Document {
  @Prop({ type: String })
  @ApiProperty({ type: 'string', example: 'Electronics' })
  name: string;

  @Prop({ type: Types.ObjectId, ref: Supplier.name })
  @ApiProperty({ type: 'string', example: '666d98ab565f924157e31c54' })
  supplier: Types.ObjectId;

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
      regular: {
        profitMarkup: {
          type: Number,
          default: 10,
        },
        markupExpiryDate: Date,
        salesPitch: String,
      },
      gold: {
        profitMarkup: {
          type: Number,
          default: 0,
        },
        markupExpiryDate: Date,
        salesPitch: String,
      },
      diamond: {
        profitMarkup: {
          type: Number,
          default: 0,
        },
        markupExpiryDate: Date,
        salesPitch: String,
      },
    },
  })
  advancedMarkup: {
    regular: {
      profitMarkup: number;
      markupExpiryDate: Date;
      salesPitch: string;
    };
    gold: {
      profitMarkup: number;
      markupExpiryDate: Date;
      salesPitch: string;
    };
    diamond: {
      profitMarkup: number;
      markupExpiryDate: Date;
      salesPitch: string;
    };
  };
}

export type ProductCategoryDocument = HydratedDocument<ProductCategory>;

export const ProductCategorySchema =
  SchemaFactory.createForClass(ProductCategory);
