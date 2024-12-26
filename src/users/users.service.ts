import { IUsersService } from './users.service.interface';
import { User } from './user.entity';
import { UserLoginDto } from './dto/user-login.dto';
import { injectable } from 'inversify';
import { UserRegisterDto } from './dto/user-register.dto';

@injectable()
export class UsersService implements IUsersService {
  async createUser({ name, email, password }: UserRegisterDto): Promise<User | null> {
    const newUser = new User(email, name);
    await newUser.setPassword(password);
    return null;
  }

  async validateUser(dto: UserLoginDto): Promise<boolean> {
    return true;
  }
}
