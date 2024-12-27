import 'reflect-metadata';
import { UserModel } from '@prisma/client';
import { Container } from 'inversify';
import { IConfigService } from '../config/config.service.interface';
import { TYPES } from '../types';
import { User } from './user.entity';
import { IUsersRepository } from './users.repository.interface';
import { UsersService } from './users.service';
import { IUsersService } from './users.service.interface';

const ConfigServiceMock: IConfigService = {
  get: jest.fn(),
};

const UsersRepositoryMock: IUsersRepository = {
  find: jest.fn(),
  create: jest.fn(),
};

const container = new Container();
let configService: IConfigService;
let usersRepository: IUsersRepository;
let usersService: IUsersService;

beforeAll(() => {
  container.bind<IUsersService>(TYPES.UsersService).to(UsersService);
  container.bind<IConfigService>(TYPES.ConfigService).toConstantValue(ConfigServiceMock);
  container.bind<IUsersRepository>(TYPES.UsersRepository).toConstantValue(UsersRepositoryMock);

  configService = container.get<IConfigService>(TYPES.ConfigService);
  usersRepository = container.get<IUsersRepository>(TYPES.UsersRepository);
  usersService = container.get<IUsersService>(TYPES.UsersService);
});

let createdUser: UserModel | null;

describe('User Service', () => {
  it('createUser', async () => {
    configService.get = jest.fn().mockReturnValueOnce('1');
    usersRepository.create = jest.fn().mockImplementationOnce(
      (user: User): UserModel => ({
        name: user.name,
        email: user.email,
        password: user.password,
        id: 1,
      }),
    );
    createdUser = await usersService.createUser({
      email: 'a@a.ru',
      name: 'Test',
      password: '1',
    });
    expect(createdUser?.id).toEqual(1);
    expect(createdUser?.password).not.toEqual('1');
  });

  it('validateUser existed', async () => {
    usersRepository.find = jest.fn().mockReturnValueOnce(createdUser);
    const isValidUser = await usersService.validateUser({
      email: 'a@a.ru',
      password: '1',
    });
    expect(isValidUser).toBeTruthy();
  });

  it('validateUser password is not valid', async () => {
    usersRepository.find = jest.fn().mockReturnValueOnce(createdUser);
    const isValidUser = await usersService.validateUser({
      email: 'a@a.ru',
      password: '2',
    });
    expect(isValidUser).toBeFalsy();
  });

  it('validateUser user does not exist', async () => {
    usersRepository.find = jest.fn().mockReturnValueOnce(null);
    const isValidUser = await usersService.validateUser({
      email: 'a@a.ru',
      password: '2',
    });
    expect(isValidUser).toBeFalsy();
  });

  it('validateUser fails with invalid email', async () => {
    usersRepository.find = jest.fn().mockReturnValueOnce(null); // Simulate no user found
    const isValidUser = await usersService.validateUser({
      email: 'invalid@invalid.com',
      password: 'randompassword',
    });
    expect(isValidUser).toBeFalsy();
  });

  it('createUser hashes password correctly', async () => {
    configService.get = jest.fn().mockReturnValueOnce('10'); // Mock salt rounds configuration
    usersRepository.create = jest.fn().mockImplementationOnce(
      async (user: User): Promise<UserModel> => ({
        id: 2,
        name: user.name,
        email: user.email,
        password: user.password, // Mocked hashed password
      }),
    );

    const newUser = await usersService.createUser({
      email: 'test@create.com',
      name: 'HashTestUser',
      password: 'securePassword123',
    });

    expect(newUser?.password).not.toBe('securePassword123');
  });
});
