import { Document, HydratedDocument, Types } from 'mongoose';
import { Schema, SchemaFactory, Prop, raw } from '@nestjs/mongoose';
import { BasePrice } from './baseprice.schema';
import { Addition } from './addition.schema';
import { Supplier } from './supplier.schema';
import { ApiProperty } from '@nestjs/swagger';
import { ProductCategory } from '../../product-category/schemas/category.schema';
import { ProductSubCategory } from '../../product-category/schemas/subCategory.schema';
import { STATUS_ENUM } from '../product.interface';

@Schema({
  timestamps: true,
})
export class Product extends Document {
  @Prop({
    type: {
      id: String,
      country: String,
      dataSource: String,
      discontinued: Boolean,
      discontinuedAt: { type: String, required: false },
      canCheckStock: Boolean,
      firstListedAt: Date,
      lastChangedAt: Date,
      pricesCurrencies: [String],
      priceChangedAt: String,
      discontinuedReason: {
        type: String,
        required: false,
      },
      sourceDateChangedAt: Date,
      pricesChangedAt: Date,
    },
  })
  meta: {
    id: string;
    country: string;
    dataSource: string;
    discontinued: boolean;
    discontinuedAt: string;
    canCheckStock: boolean;
    firstListedAt: Date;
    lastChangedAt: Date;
    priceCurrencies: string[];
    priceChangedAt: Date;
    discontinuedReason: string;
    sourceDateChangedAt: Date;
  };

  @Prop({
    type: Types.ObjectId,
    ref: Supplier.name,
  })
  supplier: Types.ObjectId;

  @Prop({
    type: {
      name: String,
      code: String,
      supplier: String,
      heroImage: String,
      minQty: Number,
      displayPrices: Object,
    },
  })
  overview: {
    name: string;
    code: string;
    supplier: string;
    heroImage: string;
    minQty: number;
    displayPrices: object;
  };

  @Prop({
    type: {
      code: String,
      name: { type: String, index: true },
      details: [{ name: String, detail: String }],
      description: String,
      discontinued: Boolean,
      supplierBrand: { type: String, required: false },
      supplierLabel: { type: String, required: false },
      supplierCatalogue: { type: String, required: false },
      supplierWebsitePage: String,
      images: [String],
      videos: [String],
      lineArt: [String],
      colours: {
        list: [
          {
            for: String,
            name: String,
            image: {
              type: String,
              required: false,
            },
            swatch: [String],
            colours: [String],
            appColours: [String],
          },
        ],
        supplierText: [{ name: String, detail: String }],
      },
      categorisation: {
        productType: {
          typeId: String,
          typeName: String,
          typeGroupId: String,
          typeNameText: String,
          typeGroupName: String,
        },
        appaAtributies: Object,
        appaProductType: {
          healthAndPersonal: [String],
        },
        supplierCategory: String,
        supplierSubCategory: {
          type: String,
          required: false,
        },
      },
      prices: {
        addons: [String],
        priceTags: {
          leadTime: [String],
          decoration: [String],
        },
        priceGroups: [
          {
            additions: [
              {
                type: Types.ObjectId,
                ref: Addition.name,
              },
            ],
            basePrice: {
              type: Types.ObjectId,
              ref: BasePrice.name,
            },
          },
        ],
        currencyOptions: String,
      },
    },
  })
  product: {
    code: string;
    name: string;
    details: { name: string; details: string }[];
    description: string;
    discontinued: boolean;
    supplierBrand?: string;
    supplierLabel?: string;
    supplierCatalogue?: string;
    supplierWebsitePage: string;
    image: string[];
    prices: {
      addons: string[];
      priceTags: {
        leadTime: string[];
        decoration: string[];
      };
      priceGroups: {
        additions: [Types.ObjectId];
        basePrice: Types.ObjectId;
      }[];
      currencyOptions: string;
    };
    videos: string[];
    lineArt: string[];
    colours: {
      list: {
        for: string;
        name: string;
        image?: string;
        swatch: string[];
        colours: string[];
        appColours: string[];
      }[];
      supplierText: { name: string; detail: string }[];
    };
    categorisation: {
      productType: {
        typeId: string;
        typeName: string;
        typeGroupId: string;
        typeNameText: string;
        typeGroupName: string;
      };
      appaAtributies: Record<string, string[]>;
      appaProductType: {
        healthAndPersonal: string[];
      };
      supplierCategory: string;
      supplierSubCategory?: string;
    };
  };

  @ApiProperty({ type: 'string', example: '666d98ab565f924157e31c54' })
  @Prop({ type: { type: Types.ObjectId, ref: ProductCategory.name } })
  category: Types.ObjectId;

  @ApiProperty({ type: 'string', example: '666d98ab565f924157e31c54' })
  @Prop({ type: { type: Types.ObjectId, ref: ProductSubCategory.name } })
  subCategory: Types.ObjectId;

  @Prop({
    type: Boolean,
    default: true,
  })
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
      diamondRule: {
        total: Number,
        reducedMarkup: Number,
        expiryDate: Date,
      },
      goldRule: {
        total: Number,
        reducedMarkup: Number,
        expiryDate: Date,
      },
      regularRule: {
        total: Number,
        reducedMarkup: Number,
        expiryDate: Date,
      },
    },
  })
  discounts: {
    diamondRule: {
      total: number;
      reducedMarkup: number;
      expiryDate: Date;
    };
    goldRule: {
      total: number;
      reducedMarkup: number;
      expiryDate: Date;
    };
    regularRule: {
      total: number;
      reducedMarkup: number;
      expiryDate: Date;
    };
  };
}

export type ProductDocument = HydratedDocument<Product>;

export const ProductSchema = SchemaFactory.createForClass(Product).set(
  'versionKey',
  false,
);

ProductSchema.index({ 'product.name': 'text' });
