import { UserRole } from '../../user/enums/role.enum';

export const JwtAction = {
  authorize: 'authorize',
  verify_otp: 'verify_otp',
} as const;

export type JwtAction = keyof typeof JwtAction;

export type JwtSigningPayload = {
  email: { address: string; isVerified: boolean };
  uid: string; // userId
  r: UserRole; // role
  did?: string; // deviceId
  action: JwtAction;
};

// standard claims https://datatracker.ietf.org/doc/html/rfc7519#section-4.1
export interface JwtPayload {
  [key: string]: any;
  iss?: string;
  sub?: string;
  aud?: string | string[];
  exp?: number;
  nbf?: number;
  iat?: number;
  jti?: string;
}
