import { Inject, Injectable } from "@nestjs/common";

import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { Logger } from "winston";

import { RedisService } from "src/common/redis/redis.service";
import { User } from "src/generated/prisma/client";
import { UserCreateInput } from "src/generated/prisma/models";

import { UsersRepository } from "./users.repository";

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly redisService: RedisService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  async create(data: UserCreateInput): Promise<User> {
    this.logger.info(`UsersService.create`);
    return await this.usersRepository.create(data);
  }
  async findByKey(key: keyof User, value: string): Promise<User | null> {
    this.logger.info(`UsersService.findByKey`);
    return await this.usersRepository.findByKey(key, value);
  }
  async findByIdentifier(
    username: string,
    email: string,
  ): Promise<User | null> {
    this.logger.info(`UsersService.findByIdentifier`);
    return await this.usersRepository.findByIdentifier(username, email);
  }
}
