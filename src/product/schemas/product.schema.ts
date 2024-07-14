import { Document, HydratedDocument, Types } from 'mongoose';
import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import { BasePrice } from './baseprice.schema';
import { Addition } from './addition.schema';
import { Supplier } from './supplier.schema';

@Schema({
  timestamps: true,
  toJSON: {
    transform: function (doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
    },
  },
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
      firstListedAt: String,
      lastChangedAt: String,
      pricesCurrencies: [String],
      priceChangedAt: String,
      discontinuedReason: {
        type: String,
        required: false,
      },
      sourceDateChangedAt: String,
      pricesChangedAt: String,
    },
  })
  meta: {
    id: string;
    country: string;
    dataSource: string;
    discontinued: boolean;
    discontinuedAt: string;
    canCheckStock: boolean;
    firstListedAt: string;
    lastChangedAt: string;
    priceCurrencies: string[];
    priceChangedAt: string;
    discontinuedReason: string;
    sourceDateChangedAt: string;
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
      name: String,
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

  @Prop({ type: { type: Types.ObjectId, ref: 'productCategories' } })
  category: Types.ObjectId;

  @Prop({ type: { type: Types.ObjectId, ref: 'productsubcategories' } })
  subCategory: Types.ObjectId;
}

export type ProductDocument = HydratedDocument<Product>;

export const ProductSchema = SchemaFactory.createForClass(Product).set(
  'versionKey',
  false,
);

ProductSchema.index({ 'product.name': 'text' });
