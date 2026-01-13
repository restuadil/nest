import { Injectable } from "@nestjs/common";

import * as bcrypt from "bcrypt";

import { PrismaService } from "src/common/prisma/prisma.service";
@Injectable()
export class TestService {
  constructor(private prismaService: PrismaService) {}

  async deleteAll() {
    const tableNames = await this.prismaService.$queryRaw<
      Array<{ tablename: string }>
    >`SELECT tablename FROM pg_tables WHERE schemaname='public';`;

    // Disable FK constraints if needed (postgres)
    await this.prismaService.$executeRawUnsafe(
      `SET session_replication_role = 'replica';`,
    );

    for (const { tablename } of tableNames) {
      await this.prismaService.$executeRawUnsafe(
        `TRUNCATE TABLE "${tablename}" RESTART IDENTITY CASCADE;`,
      );
    }

    // Re-enable FK
    await this.prismaService.$executeRawUnsafe(
      `SET session_replication_role = 'origin';`,
    );
  }

  async createUser() {
    await this.prismaService.user.create({
      data: {
        email: "admin@gmail.com",
        password: bcrypt.hashSync("123456", 10),
        username: "admin",
        status: "ACTIVE",
        roles: ["USER"],
      },
    });
  }
}
