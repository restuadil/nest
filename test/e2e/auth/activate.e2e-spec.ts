import {
  ConflictException,
  HttpStatus,
  INestApplication,
  NotFoundException,
} from "@nestjs/common";

import request from "supertest";
import { App } from "supertest/types";

import { RegisterResponseDto } from "src/api/auth/dto/register.dto";

import { createInactiveUser, resetDb } from "../../helpers/prisma-test.helper";
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
  it("should activate successfully", async () => {
    await createInactiveUser("activate@mail.com", "123456", "123456");
    const res = await request(app.getHttpServer())
      .get("/api/auth/activate")
      .query({
        activation_code: "123456",
      });

    expectSuccessResponse<RegisterResponseDto>(res, HttpStatus.OK, {
      id: expect.any(String) as string,
      email: "activate@mail.com",
      username: "activate",
      status: "ACTIVE",
      roles: ["USER"],
    });
  });

  it("should return 404 user not found", async () => {
    const res = await request(app.getHttpServer())
      .get("/api/auth/activate")
      .query({
        activation_code: "123456",
      });

    expectErrorResponse(res, HttpStatus.NOT_FOUND, NotFoundException.name);
  });

  it("should return 409 if activation code has expired", async () => {
    await createInactiveUser(
      "activate@mail.com",
      "123456",
      "123456",
      new Date(Date.now() - 10000),
    );
    const res = await request(app.getHttpServer())
      .get("/api/auth/activate")
      .query({
        activation_code: "123456",
      });

    expectErrorResponse(res, HttpStatus.CONFLICT, ConflictException.name);
  });
});
