import {
  HttpStatus,
  INestApplication,
  NotFoundException,
} from "@nestjs/common";

import request from "supertest";
import { App } from "supertest/types";

import { Category } from "src/generated/prisma/client";

import { createCategory, resetDb } from "../../helpers/prisma-test.helper";
import { flushRedis } from "../../helpers/redis-test.helper";
import { createTestApp } from "../../helpers/test-app.helper";
import {
  expectErrorResponse,
  expectSuccessResponse,
} from "../../response.helper";

describe("FindById Category E2E", () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    app = await createTestApp();
  });
  beforeEach(async () => {
    await flushRedis();
    await resetDb();
  });
  afterAll(async () => {
    await app.close();
  });

  it("should findById categories successfully", async () => {
    const category = await createCategory("category 1");
    const res = await request(app.getHttpServer()).get(
      `/api/categories/${category.id}`,
    );
    expectSuccessResponse<Category>(res, HttpStatus.OK, {
      id: category.id,
      name: category.name,
    });
  });

  it("should 400 if id is invalid", async () => {
    await createCategory("category 1");
    const res = await request(app.getHttpServer()).get(
      "/api/categories/invalid-id",
    );
    expect(res.status).toBe(HttpStatus.BAD_REQUEST);
    expectErrorResponse(res, HttpStatus.BAD_REQUEST, "VALIDATION ERROR");
  });

  it("should 404 if category not found", async () => {
    await createCategory("category 1");
    const res = await request(app.getHttpServer()).get(
      "/api/categories/cmkfo0soe0000dcval0o70g95",
    );
    expect(res.status).toBe(HttpStatus.NOT_FOUND);
    expectErrorResponse(res, HttpStatus.NOT_FOUND, NotFoundException.name);
  });
});
