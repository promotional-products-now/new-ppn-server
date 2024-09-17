export const AXIOS_INSTANCE_TOKEN = 'AXIOS_INSTANCE_TOKEN';

export enum PRODUCT_FILTER {
  ITEMS_WITH_DETAILS = 'Items with details', //done
  ITEMS_WITH_DESCRIPTION = 'Items with description', //done
  NON_DISCOUNTED_PRODUCTS = 'Non-Discontinued Products', //done
  NEW_ZEALAND_REGION = 'New Zealand Region', //done
  ITEMS_WITH_IMAGE = 'Items with image', //done
  ITEMS_WITH_OUT_STOCK_CHECK = 'Products without Stock Check', //done
  ITEMS_FROM_API_SUPPLIERS = 'Items from API suppliers', //done
  NEW_ITEMS_LAST_30_DAYS = 'New items (Last 30 days)', //done
  NON_EXPIRED_DISCOUNT = 'Non-Expired Discounts', //done
  NON_DISCOUNTS_EXPIRING = 'Non-Expiring Discounts', //done
  // NON_DISCOUNTED_ITEMS = 'Non-dscounted items',
  BUY_NOW_CANDIDATE = 'Buy now candidate', //done
  ENABLE_VISIBILITY = 'Enable visibility', //done

  HOURS_DISPATCH_PRICING_24 = '24-hours dispatch pricing',
  DAY_DISPATCH_PRICING_3 = '3-day dispatch pricing',
  DAY_DISPATCH_PRICING_5 = '5-day dispatch pricing',
  DAY_DISPATCH_PRICING_7 = '7-day dispatch pricing',
  CUSTOM_ITEMS = 'Custom items',
  ITEM_WITH_PRICES = 'Items with prices',
}
