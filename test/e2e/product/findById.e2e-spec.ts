import {
  HttpStatus,
  INestApplication,
  NotFoundException,
} from "@nestjs/common";

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
  expectSuccessResponse,
} from "../../response.helper";

describe("FindById Product E2E", () => {
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

  it("should findById products successfully", async () => {
    const category = await createCategory("category 1");
    const product = await createProduct("product 1", [category.id]);
    const res = await request(app.getHttpServer()).get(
      `/api/products/${product.id}`,
    );
    expectSuccessResponse<Product>(res, HttpStatus.OK, {
      id: product.id,
      name: product.name,
    });
  });

  it("should 400 if id is invalid", async () => {
    const category = await createCategory("category 1");
    await createProduct("product 1", [category.id]);
    const res = await request(app.getHttpServer()).get(
      "/api/products/invalid-id",
    );
    expect(res.status).toBe(HttpStatus.BAD_REQUEST);
    expectErrorResponse(res, HttpStatus.BAD_REQUEST, "VALIDATION ERROR");
  });

  it("should 404 if product not found", async () => {
    const category = await createCategory("category 1");
    await createProduct("product 1", [category.id]);
    const res = await request(app.getHttpServer()).get(
      "/api/products/cmkfo0soe0000dcval0o70g95",
    );
    expect(res.status).toBe(HttpStatus.NOT_FOUND);
    expectErrorResponse(res, HttpStatus.NOT_FOUND, NotFoundException.name);
  });
});
