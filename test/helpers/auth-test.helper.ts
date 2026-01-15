import { INestApplication } from "@nestjs/common";

import request from "supertest";
import { App } from "supertest/types";

import { TestingResponse } from "src/types/web.type";

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
