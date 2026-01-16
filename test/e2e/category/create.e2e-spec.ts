import {
  ConflictException,
  HttpStatus,
  INestApplication,
  UnauthorizedException,
} from "@nestjs/common";

import request from "supertest";
import { App } from "supertest/types";

import { Category } from "src/generated/prisma/client";

import { loginAdmin } from "../../helpers/auth-test.helper";
import { resetDb } from "../../helpers/prisma-test.helper";
import { createTestApp } from "../../helpers/test-app.helper";
import {
  expectErrorResponse,
  expectSuccessResponse,
} from "../../response.helper";

describe("Create Catgory E2E", () => {
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
  it("should create category successfully", async () => {
    const token = await loginAdmin(app);
    const res = await request(app.getHttpServer())
      .post("/api/categories")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "category 1",
      });
    expectSuccessResponse<Category>(res, HttpStatus.CREATED, {
      id: expect.any(String) as string,
      name: "category 1",
    });
  });
  it("should return VALIDATION ERROR", async () => {
    const token = await loginAdmin(app);
    const res = await request(app.getHttpServer())
      .post("/api/categories")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "1",
      });
    expectErrorResponse(res, HttpStatus.BAD_REQUEST, "VALIDATION ERROR");
  });
  it("should return 401 unauthorized", async () => {
    const res = await request(app.getHttpServer())
      .post("/api/categories")
      .send({
        name: "category 1",
      });
    expectErrorResponse(
      res,
      HttpStatus.UNAUTHORIZED,
      UnauthorizedException.name,
    );
  });
  it("should return 409 category already exists", async () => {
    const token = await loginAdmin(app);
    await request(app.getHttpServer())
      .post("/api/categories")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "category 1",
      });
    const res = await request(app.getHttpServer())
      .post("/api/categories")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "category 1",
      });
    expectErrorResponse(res, HttpStatus.CONFLICT, ConflictException.name);
  });
});
