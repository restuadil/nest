import { INestApplication, HttpStatus } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";

import request from "supertest";
import { App } from "supertest/types";
import { describe, it, beforeAll, afterAll, beforeEach } from "vitest";

import { AppModule } from "src/app.module";

import { expectErrorResponse, expectSuccessResponse } from "../response.helper";
import { TestModule } from "../test.module";
import { TestService } from "../test.service";

describe("LOGIN E2E", () => {
  let app: INestApplication<App>;
  let testService: TestService;

  const payload = {
    identifier: "admin@gmail.com",
    password: "123456",
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

  it("should success login", async () => {
    await testService.createUser();

    const res = await request(app.getHttpServer())
      .post("/api/auth/login")
      .send(payload);

    expectSuccessResponse<{ accessToken: string }>(res, HttpStatus.OK, {
      accessToken: expect.any(String) as string,
    });
    const cookies = res.headers["set-cookie"];
    expect(cookies).toBeDefined();
    expect(Array.isArray(cookies)).toBe(true);
  });
  it("should reject if validation error", async () => {
    await testService.createUser();
    const res = await request(app.getHttpServer())
      .post("/api/auth/login")
      .send({ identifier: "a", password: "123456" });

    expectErrorResponse(res, HttpStatus.CONFLICT);
  });
  it("should reject if user not found", async () => {
    await testService.createUser();
    const res = await request(app.getHttpServer())
      .post("/api/auth/login")
      .send({
        identifier: "wrong@gmail.com",
        password: "123456",
      });

    expectErrorResponse(res, HttpStatus.CONFLICT);
  });
  it("should reject if password not match", async () => {
    await testService.createUser();

    const res = await request(app.getHttpServer())
      .post("/api/auth/login")
      .send({
        identifier: "admin@gmail.com",
        password: "wrong",
      });

    expectErrorResponse(res, HttpStatus.CONFLICT);
  });
});
