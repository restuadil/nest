import { Inject, Injectable } from "@nestjs/common";

import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { Logger } from "winston";

import { RedisService } from "src/common/redis/redis.service";

import { CategoriesRepository } from "./categories.repository";

@Injectable()
export class CategoriesService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private readonly categoriesRepository: CategoriesRepository,
    private readonly redisService: RedisService,
  ) {}
}
