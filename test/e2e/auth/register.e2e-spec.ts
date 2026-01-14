import {
  ConflictException,
  HttpStatus,
  INestApplication,
} from "@nestjs/common";

import request from "supertest";
import { App } from "supertest/types";

import { RegisterResponseDto } from "src/api/auth/dto/register.dto";

import { createActiveUser, resetDb } from "../../helpers/prisma-test.helper";
import { createTestApp } from "../../helpers/test-app.helper";
import {
  expectErrorResponse,
  expectSuccessResponse,
} from "../../response.helper";

describe("Register E2E", () => {
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
  it("should register successfully", async () => {
    const res = await request(app.getHttpServer())
      .post("/api/auth/register")
      .send({
        email: "test@mail.com",
        password: "123456",
        username: "test",
      });

    expectSuccessResponse<RegisterResponseDto>(res, HttpStatus.CREATED, {
      id: expect.any(String) as string,
      status: "INACTIVE",
      roles: ["USER"],
      email: "test@mail.com",
      username: "test",
    });
  });
  it("should return validation error", async () => {
    const res = await request(app.getHttpServer())
      .post("/api/auth/register")
      .send({
        email: "test@mail.com",
        password: "123456",
        username: "",
      });

    expectErrorResponse(res, HttpStatus.BAD_REQUEST, "Validation Error");
  });
  it("should return conflict error", async () => {
    await createActiveUser("test@mail.com", "123456");
    const res = await request(app.getHttpServer())
      .post("/api/auth/register")
      .send({
        email: "test@mail.com",
        password: "123456",
        username: "test",
      });
    expectErrorResponse(res, HttpStatus.CONFLICT, ConflictException.name);
  });
});
