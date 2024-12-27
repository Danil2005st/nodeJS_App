import { NextFunction, Request, Response } from 'express';
import { BaseController } from '../common/base.controller';
import { HttpError } from '../errors/http-error.class';
import { inject, injectable } from 'inversify';
import { TYPES } from '../types';
import { ILogger } from '../logger/logger.interface';
import 'reflect-metadata';
import { IUsersController } from './users.controller.interface';
import { UserLoginDto } from './dto/user-login.dto';
import { UserRegisterDto } from './dto/user-register.dto';
import { ValidateMiddleware } from '../common/validate.middleware';
import { sign } from 'jsonwebtoken';
import { IConfigService } from '../config/config.service.interface';
import { IUsersService } from './users.service.interface';
import { AuthGuard } from '../common/auth.guard';

@injectable()
export class UsersController extends BaseController implements IUsersController {
  constructor(
    @inject(TYPES.ILogger) private loggerService: ILogger,
    @inject(TYPES.UsersService) private usersService: IUsersService,
    @inject(TYPES.ConfigService) private configService: IConfigService,
  ) {
    super(loggerService);
    this.bindRoutes([
      {
        path: '/register',
        method: 'post',
        func: this.register,
        middlewares: [new ValidateMiddleware(UserRegisterDto)],
      },
      {
        path: '/login',
        method: 'post',
        func: this.login,
        middlewares: [new ValidateMiddleware(UserLoginDto)],
      },
      {
        path: '/info',
        method: 'get',
        func: this.info,
        middlewares: [new AuthGuard()],
      },
    ]);
  }

  async login(
    req: Request<object, object, UserLoginDto>,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    const result = await this.usersService.validateUser(req.body);
    if (!result) {
      return next(new HttpError(401, 'Authorisations error', 'login'));
    }
    const jwt = await this.signJWT(req.body.email, this.configService.get('JWT_SECRET'));
    this.ok(res, { jwt });
  }
  async register(
    { body }: Request<object, object, UserRegisterDto>,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    const result = await this.usersService.createUser(body);
    if (!result) {
      return next(new HttpError(422, 'User already exists', 'register'));
    }
    this.ok(res, { email: result.email, id: result.id });
  }

  async info(
    { user }: Request<object, object, UserRegisterDto>,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    const userInfo = await this.usersService.getUserInfo(user);
    this.ok(res, { email: userInfo?.email, id: userInfo?.id });
  }

  private async signJWT(email: string, secret: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      sign(
        {
          email,
          iat: Math.floor(Date.now() / 1000),
        },
        secret,
        { algorithm: 'HS256' },
        (err, token) => {
          if (err) {
            reject(err);
          }
          resolve(token as string);
        },
      );
    });
  }
}
