import {
  INestApplication,
  HttpStatus,
  ConflictException,
} from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";

import request from "supertest";
import { App } from "supertest/types";
import { describe, it, beforeEach } from "vitest";

import { AppModule } from "src/app.module";

import { expectErrorResponse, expectSuccessResponse } from "../response.helper";
import { TestModule } from "../test.module";
import { TestService } from "../test.service";

describe("REGISTER E2E", () => {
  let app: INestApplication<App>;
  let testService: TestService;

  const payload = {
    email: "admin@gmail.com",
    password: "123456",
    username: "admin",
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, TestModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    testService = app.get(TestService);
  });

  describe("POST /api/auth/register", () => {
    const basePath = "/api/auth/register";

    beforeEach(async () => {
      await testService.deleteAll();
    });

    it("should success register", async () => {
      const res = await request(app.getHttpServer())
        .post(basePath)
        .send(payload);
      expectSuccessResponse(
        res,
        HttpStatus.CREATED,
        {
          email: payload.email,
          username: payload.username,
          roles: ["USER"],
          status: "INACTIVE",
        },
        "User registered successfully",
      );
    });
    it("should fail register if user already exists", async () => {
      await testService.createUser();
      const res = await request(app.getHttpServer())
        .post(basePath)
        .send(payload);
      expectErrorResponse(
        res,
        HttpStatus.CONFLICT,
        ConflictException.name,
        "User already exists",
      );
    });
    it("should reject if validataion error", async () => {
      const res = await request(app.getHttpServer())
        .post(basePath)
        .send({ email: "admin", password: "123456" });
      expectErrorResponse(res, HttpStatus.BAD_REQUEST);
    });
  });
});
