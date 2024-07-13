import { UserDocument } from '../schemas/user.schema';

export class FindUsers {
  users: UserDocument[];
  hasPrevious: boolean;
  hasNext: boolean;
  nextPage: number;
  prevPage: number;
}
