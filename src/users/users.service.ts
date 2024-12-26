import { IUsersService } from './users.service.interface';
import { User } from './user.entity';
import { UserLoginDto } from './dto/user-login.dto';
import { inject, injectable } from 'inversify';
import { UserRegisterDto } from './dto/user-register.dto';
import { TYPES } from '../types';
import { IConfigService } from '../config/config.service.interface';
import { IUsersRepository } from './users.repository.interface';
import { UserModel } from '@prisma/client';

@injectable()
export class UsersService implements IUsersService {
  constructor(
    @inject(TYPES.ConfigService) private configService: IConfigService,
    @inject(TYPES.UsersRepository) private usersRepository: IUsersRepository,
  ) {}
  async createUser({ name, email, password }: UserRegisterDto): Promise<UserModel | null> {
    const newUser = new User(email, name);
    const salt = this.configService.get('SALT');
    await newUser.setPassword(password, Number(salt));
    const existedUser = await this.usersRepository.find(email);
    if (existedUser) {
      return null;
    }
    return this.usersRepository.create(newUser);
  }

  async validateUser(dto: UserLoginDto): Promise<boolean> {
    return true;
  }
}
