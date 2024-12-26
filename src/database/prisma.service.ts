import { inject, injectable } from 'inversify';
import { PrismaClient } from '@prisma/client';
import { TYPES } from '../types';
import { ILogger } from '../logger/logger.interface';

@injectable()
export class PrismaService {
  client: PrismaClient;

  constructor(@inject(TYPES.ILogger) private logger: ILogger) {
    this.client = new PrismaClient();
  }

  async connect(): Promise<void> {
    try {
      await this.client.$connect();
      this.logger.log('[PrismaService] Connected to database');
    } catch (err) {
      if (err instanceof Error) {
        this.logger.error('[PrismaService] Error connecting to database' + err.message);
      }
    }
  }

  async disConnect(): Promise<void> {
    await this.client.$disconnect();
    this.logger.log('[PrismaService] Disconnected from database');
  }
}
