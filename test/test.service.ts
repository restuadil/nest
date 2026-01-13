import { Injectable } from "@nestjs/common";

import * as bcrypt from "bcrypt";

import { PrismaService } from "src/common/prisma/prisma.service";
@Injectable()
export class TestService {
  constructor(private prismaService: PrismaService) {}

  async deleteAll() {
    await this.prismaService.user.deleteMany({
      where: { email: "admin@gmail.com" },
    });
  }

  async createUser() {
    await this.prismaService.user.create({
      data: {
        email: "admin@gmail.com",
        password: bcrypt.hashSync("123456", 10),
        username: "admin",
        status: "INACTIVE",
        roles: ["USER"],
      },
    });
  }
}
