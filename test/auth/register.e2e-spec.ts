import {
  INestApplication,
  HttpStatus,
  ConflictException,
} from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";

import request from "supertest";
import { App } from "supertest/types";
import { describe, it, beforeAll, afterAll, beforeEach } from "vitest";

import { RegisterResponseDto } from "src/api/auth/dto/register.dto";
import { AppModule } from "src/app.module";

import { expectErrorResponse, expectSuccessResponse } from "../response.helper";
import { TestModule } from "../test.module";
import { TestService } from "../test.service";

describe("REGISTER E2E", () => {
  let app: INestApplication<App>;
  let testService: TestService;
  const basePath = "/api/auth/register";

  const payload = {
    email: "admin1@gmail.com",
    password: "123456",
    username: "admin1",
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, TestModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    testService = app.get(TestService);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await testService.deleteAll();
  });

  it("should success register", async () => {
    const res = await request(app.getHttpServer()).post(basePath).send(payload);

    expectSuccessResponse<RegisterResponseDto>(res, HttpStatus.CREATED, {
      id: expect.any(String) as string,
      email: payload.email,
      username: payload.username,
      roles: ["USER"],
      status: "INACTIVE",
    });
  });

  it("should fail register if user already exists", async () => {
    await testService.createUser();
    const res = await request(app.getHttpServer()).post(basePath).send({
      email: "admin@gmail.com",
      password: "123456",
      username: "admin",
    });

    expectErrorResponse(
      res,
      HttpStatus.CONFLICT,
      ConflictException.name,
      "User already exists",
    );
  });

  it("should reject if validation error", async () => {
    const res = await request(app.getHttpServer())
      .post(basePath)
      .send({ email: "admin", password: "123456" });

    expectErrorResponse(res, HttpStatus.BAD_REQUEST);
  });
});
