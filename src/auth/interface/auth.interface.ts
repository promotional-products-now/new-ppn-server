import { User } from '../../user/schemas/user.schema';

export interface loginResponse extends Omit<User, 'password'> {
  accessToken: string;
}
