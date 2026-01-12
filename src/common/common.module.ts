import { Global, Module } from "@nestjs/common";
import { APP_FILTER, APP_INTERCEPTOR } from "@nestjs/core";

import { ConfigService } from "src/config/config.service";

import { GlobalFilter } from "./filters/global.filter";
import { LoggerInterceptor } from "./interceptors/logger.interceptor";
import { ResponseInterceptor } from "./interceptors/response.interceptor";
import { MailModule } from "./mail/mail.module";
import { MailService } from "./mail/mail.service";
import { PrismaService } from "./prisma/prisma.service";
import { RedisModule } from "./redis/redis.module";
import { RedisService } from "./redis/redis.service";

@Global()
@Module({
  imports: [RedisModule, MailModule],
  providers: [
    ConfigService,
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggerInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: GlobalFilter,
    },
    RedisService,
    MailService,
    PrismaService,
  ],
  exports: [ConfigService, RedisService, MailService, PrismaService],
})
export class CommonModule {}
