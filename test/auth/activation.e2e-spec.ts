import {
  INestApplication,
  HttpStatus,
  NotFoundException,
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

describe("AUTH ACTIVATION E2E", () => {
  let app: INestApplication<App>;
  let testService: TestService;

  const basePath = "/api/auth/activate";

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

  it("should success activate", async () => {
    const code = "abcd1234";
    const user = await testService.createInactiveUserWithCode(code);

    const res = await request(app.getHttpServer())
      .get(basePath)
      .query({ activation_code: code });

    expectSuccessResponse<RegisterResponseDto>(res, HttpStatus.OK, {
      id: user.id,
      email: user.email,
      username: user.username,
      roles: ["USER"],
      status: "ACTIVE",
    });
  });

  it("should fail if activation code not found", async () => {
    const code = "abcd1234";
    await testService.createInactiveUserWithCode(code);
    const res = await request(app.getHttpServer())
      .get(basePath)
      .query({ activation_code: "invalid" });

    expectErrorResponse(
      res,
      HttpStatus.NOT_FOUND,
      NotFoundException.name,
      "User not found",
    );
  });

  it("should fail if activation code expired", async () => {
    const code = "expired123";

    await testService.createInactiveUserWithCode(
      code,
      new Date(Date.now() - 5000),
    );

    const res = await request(app.getHttpServer())
      .get(basePath)
      .query({ activation_code: code });

    expectErrorResponse(
      res,
      HttpStatus.CONFLICT,
      ConflictException.name,
      "Activation code has expired",
    );
  });
});
