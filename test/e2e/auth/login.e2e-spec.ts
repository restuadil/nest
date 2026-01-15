import {
  ConflictException,
  HttpStatus,
  INestApplication,
} from "@nestjs/common";

import request from "supertest";
import { App } from "supertest/types";

import { LoginResponseDto } from "src/api/auth/dto/login.dto";

import { createActiveUser, resetDb } from "../../helpers/prisma-test.helper";
import { createTestApp } from "../../helpers/test-app.helper";
import {
  expectErrorResponse,
  expectSuccessResponse,
} from "../../response.helper";

describe("Login E2E", () => {
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
  it("should login successfully", async () => {
    await createActiveUser("login@mail.com", "123456");
    const res = await request(app.getHttpServer())
      .post("/api/auth/login")
      .send({
        identifier: "login@mail.com",
        password: "123456",
      });

    expectSuccessResponse<LoginResponseDto>(res, HttpStatus.OK, {
      accessToken: expect.any(String) as string,
    });
    const cookies = res.headers["set-cookie"];
    expect(cookies).toBeDefined();
    expect(Array.isArray(cookies)).toBe(true);
  });
  it("should return 409 user not found", async () => {
    const res = await request(app.getHttpServer())
      .post("/api/auth/login")
      .send({
        identifier: "login@mail.com",
        password: "123456",
      });

    expectErrorResponse(res, HttpStatus.CONFLICT, ConflictException.name);
  });
});
