import { config } from "dotenv";

import { prismaTest } from "../helpers/prisma-test.helper";

config({ path: ".env.test" });

beforeAll(async () => {
  await prismaTest.$executeRawUnsafe(
    `SET session_replication_role = 'replica';`,
  );

  const tables = await prismaTest.$queryRaw<Array<{ tablename: string }>>`
    SELECT tablename FROM pg_tables WHERE schemaname='public';
  `;
  for (const { tablename } of tables) {
    await prismaTest.$executeRawUnsafe(
      `TRUNCATE TABLE "${tablename}" RESTART IDENTITY CASCADE;`,
    );
  }

  await prismaTest.$executeRawUnsafe(
    `SET session_replication_role = 'origin';`,
  );
  await prismaTest.$disconnect();
});
