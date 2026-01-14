import { Injectable } from "@nestjs/common";

import { PrismaService } from "src/common/prisma/prisma.service";
import { User } from "src/generated/prisma/client";
import { UserCreateInput, UserUpdateInput } from "src/generated/prisma/models";

@Injectable()
export class UsersRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async create(data: UserCreateInput): Promise<User> {
    return await this.prismaService.user.create({ data });
  }
  async findByKey(
    key: keyof User,
    value: string | Date | number | boolean,
  ): Promise<User | null> {
    return await this.prismaService.user.findFirst({ where: { [key]: value } });
  }
  async findByIdentifier(
    username: string,
    email: string,
  ): Promise<User | null> {
    return await this.prismaService.user.findFirst({
      where: { OR: [{ username }, { email }] },
    });
  }
  async update(id: string, data: UserUpdateInput): Promise<User> {
    return await this.prismaService.user.update({ where: { id }, data });
  }
}
