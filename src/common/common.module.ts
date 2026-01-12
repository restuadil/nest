import { Global, Module } from "@nestjs/common";

import { ConfigService } from "src/config/config.service";

import { PrismaService } from "./prisma/prisma.service";

@Global()
@Module({
  imports: [],
  providers: [ConfigService, PrismaService],
  exports: [ConfigService, PrismaService],
})
export class CommonModule {}
