import { HttpStatus, INestApplication } from "@nestjs/common";

import request from "supertest";
import { App } from "supertest/types";

import { Product } from "src/generated/prisma/client";

import {
  createCategory,
  createProduct,
  resetDb,
} from "../../helpers/prisma-test.helper";
import { flushRedis } from "../../helpers/redis-test.helper";
import { createTestApp } from "../../helpers/test-app.helper";
import {
  expectErrorResponse,
  expectPaginationResponse,
  expectSuccessResponse,
} from "../../response.helper";

describe("FindAll Product E2E", () => {
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

  it("should find all product successfully", async () => {
    const category = await createCategory("category 1");
    await createProduct("product 1", [category.id]);
    const res = await request(app.getHttpServer()).get("/api/products");
    console.log(res.body);
    expectSuccessResponse<Product[]>(res, HttpStatus.OK, [
      expect.any(Object) as Product,
    ]);
    expectPaginationResponse(res);
  });
  it("should 400 if query is invalid", async () => {
    const category = await createCategory("category 1");
    await createProduct("product 1", [category.id]);
    const res = await request(app.getHttpServer()).get("/api/products?foo=bar");
    expect(res.status).toBe(HttpStatus.BAD_REQUEST);
    expectErrorResponse(res, HttpStatus.BAD_REQUEST, "VALIDATION ERROR");
  });
});
