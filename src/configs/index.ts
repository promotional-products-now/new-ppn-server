import { Algorithm } from 'jsonwebtoken';
import * as dotenv from 'dotenv';
import {
  EnvironmentKeys,
  Environments,
  environments,
} from '../commons/types/environments.types';

dotenv.config();

// fetch secret from doppler
const secrets = process.env;

// console.log({ secrets: secrets.DATABASE_URI })

const NODE_ENV: Environments =
  environments[
    (secrets?.DOPPLER_ENVIRONMENT as EnvironmentKeys) ||
      secrets.NODE_ENV ||
      'dev'
  ];

const PORT = parseInt(secrets.API_PORT, 10) || 3010;

export const isProduction = (environment: string): boolean =>
  ['production', 'prd', 'prod'].includes(environment);

export const isDevelopment = (environment: string): boolean =>
  ['dev', 'development'].includes(environment);

console.log({
  doppler_env: secrets.DOPPLER_ENVIRONMENT,
  app_env: NODE_ENV,
  NODE_ENV,
});

export type DatabaseConfig = {
  uri: string;
};

export type OtpConfigs = {
  secret: string;
  size: number;
  algorithm: string;
};

export type AccessToken = {
  access_token_public_key: string;
  access_token_private_key: string;
  access_token_ttl: string;
  algorithm: string;
};
export type refreshToken = {
  refresh_token_private_key: string;
  refresh_token_public_key: string;
  refresh_token_ttl: string;
};

export type sessionKey = {
  session_secret: string;
  session_resave: string;
  session_save_uninitialized: string;
  session_cookie_max_age: string;
};

export type sendGrid = {
  apiKey: string;
  sender_address: string;
  template: {
    otp: string;
    passwordChange: string;
    welcome: string;
    newAdmin: string;
  };
};

export type AzureBlobStorage = {
  azure_storage_connection_string: string;
  azure_container_name: string;
};

export type CloudinaryConfig = {
  apiKey: string;
  apiSecret: string;
  cloudName: string;
};

export type StripeConfig = {
  secretKey: string;
  publishableKey: string;
  webhookSecret: string;
  webhookEndpoint?: string;
};

export type AppConfig = {
  appEnv: Environments;
  port: number;
  appName: string;
  PromoDataAuthToken: string;
  promoDataProductApi: string;
  domain: string;
  database: DatabaseConfig;
  otp: OtpConfigs;
  sessionKey: sessionKey;
  accessToken: AccessToken;
  refreshToken: refreshToken;
  sendGrid: sendGrid;
  storage: AzureBlobStorage;
  cloudinary: CloudinaryConfig;
  stripe: StripeConfig;
};

const env = (): AppConfig => {
  return {
    appEnv: NODE_ENV,
    port: PORT,
    appName: `promotionalproductsnow_${NODE_ENV}`,
    domain: 'promotionalproductsnow.au',
    promoDataProductApi: secrets.PROMO_PRODUCT_API,
    PromoDataAuthToken: secrets.PROMO_DATA_AUTHTOKEN,
    database: {
      uri: 'mongodb+srv://production_spiderMonkey:ZldLi0VKCrJZFMdO@ppn.hfq7y.mongodb.net/ppn?retryWrites=true&w=majority',
    },
    otp: {
      secret: secrets.OTP_SECRET,
      size: parseInt(secrets.OTP_SIZE) || 6,
      algorithm: secrets.OTP_ALGORITHM || 'SHA1',
    },

    refreshToken: {
      refresh_token_ttl: secrets.REFRESH_TOKEN_TTL,
      refresh_token_public_key: secrets.REFRESH_TOKEN_PUBLIC_KEY,
      refresh_token_private_key: secrets.REFRESH_TOKEN_PRIVATE_KEY,
    },

    accessToken: {
      access_token_ttl: secrets.ACCESS_TOKEN_TTL,
      access_token_public_key: secrets.ACCESS_TOKEN_PUBLIC_KEY,
      access_token_private_key: `${secrets.ACCESS_TOKEN_PRIVATE_KEY}__${NODE_ENV}`,
      algorithm: secrets.JWT_ALGORITHM as Algorithm,
    },

    sessionKey: {
      session_secret: secrets.SESSION_SECRET,
      session_resave: secrets.SESSION_RESAVE,
      session_save_uninitialized: secrets.SESSION_SAVE_UNINITIALIZED,
      session_cookie_max_age: secrets.SESSION_COOKIE_MAX_AGE,
    },
    storage: {
      azure_storage_connection_string: secrets.AZURE_STORAGE_CONNECTION_STRING,
      azure_container_name: secrets.AZURE_CONTAINER_NAME,
    },
    sendGrid: {
      apiKey: secrets.SENDGRID_API_KEY,
      sender_address: secrets.SENDGRID_MAIL_SENDER_ADDRESS,
      template: {
        otp: secrets.SENDGRID_OTP_TEMPLATE_ID,
        passwordChange: secrets.SENDGRID_PASSWORD_CHANGE_TEMPLATE_ID,
        welcome: secrets.SENDGRID_OTP_WELCOME_TEMPLATE_ID,
        newAdmin:
          secrets.SENDGRID_NEW_ADMIN_TEMPLATE ||
          'd-439b352f30184254aa038ffc382d9204',
      },
    },
    cloudinary: {
      apiKey: secrets.CLOUDINARY_API_KEY,
      apiSecret: secrets.CLOUDINARY_API_SECRET,
      cloudName: secrets.CLOUDINARY_CLOUD_NAME,
    },
    stripe: {
      secretKey:
        secrets.STRIPE_SECRET_KEY ||
        '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',
      publishableKey: secrets.STRIPE_PUBLISHABLE_KEY,
      webhookSecret: secrets.STRIPE_WEBHOOK_SECRET,
      webhookEndpoint:
        secrets.STRIPE_WEBHOOK_ENDPOINT ||
        'https://promotionalproductsnow.au/webhook/success',
    },
  };
};

export default env;
