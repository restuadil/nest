import { INestApplication } from "@nestjs/common";

import request from "supertest";
import { App } from "supertest/types";

import { TestingResponse } from "src/types/web.type";

import { createAdminUser } from "./prisma-test.helper";

export async function login(
  app: INestApplication<App>,
  payload: { identifier: string; password: string },
) {
  const res: TestingResponse<{ accessToken: string }> = await request(
    app.getHttpServer(),
  )
    .post("/api/auth/login")
    .send(payload);

  return res.body.data.accessToken;
}

export async function loginAdmin(app: INestApplication<App>) {
  await createAdminUser("admin@mail", "123456");
  return login(app, { identifier: "admin@mail", password: "123456" });
}
