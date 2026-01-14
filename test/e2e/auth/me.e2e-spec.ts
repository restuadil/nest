import {
  HttpStatus,
  INestApplication,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";

import request from "supertest";
import { App } from "supertest/types";

import { RegisterResponseDto } from "src/api/auth/dto/register.dto";

import { login } from "../../helpers/auth-test.helper";
import { createActiveUser, resetDb } from "../../helpers/prisma-test.helper";
import { createTestApp } from "../../helpers/test-app.helper";
import {
  expectErrorResponse,
  expectSuccessResponse,
} from "../../response.helper";

describe("Me E2E", () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    app = await createTestApp();
  });
  beforeEach(async () => {
    await resetDb();
  });
  afterAll(async () => {
    await app.close();
  });
  it("should return profile", async () => {
    await createActiveUser("me@mail.com", "123456");
    const token = await login(app, {
      identifier: "me@mail.com",
      password: "123456",
    });

    const res = await request(app.getHttpServer())
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${token}`);

    expectSuccessResponse<RegisterResponseDto>(res, HttpStatus.OK, {
      id: expect.any(String) as string,
      status: "ACTIVE",
      roles: ["USER"],
      email: "me@mail.com",
      username: "me",
    });
  });
  it("should return 401 no token provided", async () => {
    const res = await request(app.getHttpServer()).get("/api/auth/me");
    expectErrorResponse(
      res,
      HttpStatus.UNAUTHORIZED,
      UnauthorizedException.name,
    );
  });
  it("should return 404 user not found", async () => {
    await createActiveUser("me@mail.com", "123456");
    const token = await login(app, {
      identifier: "me@mail.com",
      password: "123456",
    });
    await resetDb();
    const res = await request(app.getHttpServer())
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${token}`);
    expectErrorResponse(res, HttpStatus.NOT_FOUND, NotFoundException.name);
  });
});
