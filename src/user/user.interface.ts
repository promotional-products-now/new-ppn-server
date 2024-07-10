export interface Email {
  address: string;
  isVerified?: boolean;
}

export interface Location {
  address: string;
  city?: string;
  state?: string;
  country?: string;
  timeZone?: string;
}
