import { IConfigService } from './config.service.interface';
import { DotenvConfigOutput, DotenvParseOutput } from 'dotenv';
import { inject, injectable } from 'inversify';
import { TYPES } from '../types';
import { ILogger } from '../logger/logger.interface';

@injectable()
export class ConfigService implements IConfigService {
  private readonly config: DotenvParseOutput;

  constructor(@inject(TYPES.ILogger) private logger: ILogger) {
    const result: DotenvConfigOutput = config();
    if (result.error) {
      this.logger.error('There was an error loading the .env file.');
    } else {
      this.config = result.parsed as DotenvParseOutput;
    }
  }
  get<T extends string | number>(key: string): T {
    return this.config[key] as T;
  }
}
