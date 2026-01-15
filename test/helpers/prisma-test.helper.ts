import { PrismaPg } from "@prisma/adapter-pg";
import * as bcrypt from "bcrypt";
import { config } from "dotenv";
import { Pool } from "pg";

import { PrismaClient } from "src/generated/prisma/client";
config({ path: ".env.test" });

export const prismaTest = new PrismaClient({
  adapter: new PrismaPg(
    new Pool({
      connectionString: process.env.DATABASE_URL,
    }),
  ),
});

export async function createActiveUser(email: string, password: string) {
  return prismaTest.user.create({
    data: {
      email,
      password: bcrypt.hashSync(password, 10),
      username: email.split("@")[0],
      status: "ACTIVE",
      roles: ["USER"],
    },
  });
}

export async function createInactiveUser(
  email: string,
  password: string,
  activate_code: string,
  activationExpiresAt: Date = new Date(Date.now() + 900000),
) {
  return prismaTest.user.create({
    data: {
      email,
      password: bcrypt.hashSync(password, 10),
      username: email.split("@")[0],
      status: "INACTIVE",
      roles: ["USER"],
      activation_code: activate_code,
      activationExpiresAt: activationExpiresAt,
    },
  });
}

export async function resetDb() {
  const tables = await prismaTest.$queryRaw<
    Array<{ tablename: string }>
  >`SELECT tablename FROM pg_tables WHERE schemaname='public';`;

  await prismaTest.$executeRawUnsafe(
    `SET session_replication_role = 'replica';`,
  );
  for (const { tablename } of tables) {
    await prismaTest.$executeRawUnsafe(
      `TRUNCATE TABLE "${tablename}" RESTART IDENTITY CASCADE;`,
    );
  }
  await prismaTest.$executeRawUnsafe(
    `SET session_replication_role = 'origin';`,
  );
}
export async function createAdminUser(email: string, password: string) {
  return prismaTest.user.create({
    data: {
      email,
      password: bcrypt.hashSync(password, 10),
      username: email.split("@")[0],
      status: "ACTIVE",
      roles: ["ADMIN"],
    },
  });
}
