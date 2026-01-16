import { HttpStatus, INestApplication } from "@nestjs/common";

import request from "supertest";
import { App } from "supertest/types";

import { Category } from "src/generated/prisma/client";

import { createCategory, resetDb } from "../../helpers/prisma-test.helper";
import { flushRedis } from "../../helpers/redis-test.helper";
import { createTestApp } from "../../helpers/test-app.helper";
import {
  expectErrorResponse,
  expectPaginationResponse,
  expectSuccessResponse,
} from "../../response.helper";

describe("FindAll Category E2E", () => {
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

  it("should find all categories successfully", async () => {
    await createCategory("category 1");
    await createCategory("category 2");
    const res = await request(app.getHttpServer()).get("/api/categories");
    expectSuccessResponse<Category[]>(res, HttpStatus.OK, [
      expect.any(Object) as Category,
      expect.any(Object) as Category,
    ]);
    expectPaginationResponse(res);
  });
  it("should 400 if query is invalid", async () => {
    await createCategory("category 1");
    await createCategory("category 2");
    const res = await request(app.getHttpServer()).get(
      "/api/categories?foo=bar",
    );
    expect(res.status).toBe(HttpStatus.BAD_REQUEST);
    expectErrorResponse(res, HttpStatus.BAD_REQUEST, "VALIDATION ERROR");
  });
});
