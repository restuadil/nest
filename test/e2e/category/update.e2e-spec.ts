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
import { createCategory, resetDb } from "../../helpers/prisma-test.helper";
import { createTestApp } from "../../helpers/test-app.helper";
import {
  expectErrorResponse,
  expectSuccessResponse,
} from "../../response.helper";

describe("Update Catgory E2E", () => {
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

  it("should update category successfully", async () => {
    const token = await loginAdmin(app);
    const category = await createCategory("category 1");
    const res = await request(app.getHttpServer())
      .put(`/api/categories/${category.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "category 1 updated",
      });
    expectSuccessResponse<Category>(res, HttpStatus.OK, {
      id: expect.any(String) as string,
      name: "category 1 updated",
    });
  });

  it("should return validation error", async () => {
    const token = await loginAdmin(app);
    const category = await createCategory("category 1");
    const res = await request(app.getHttpServer())
      .put(`/api/categories/${category.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        error: "",
      });
    expectErrorResponse(res, HttpStatus.BAD_REQUEST, "Validation Error");
  });

  it("should return 401 unauthorized", async () => {
    const category = await createCategory("category 1");
    const res = await request(app.getHttpServer())
      .put(`/api/categories/${category.id}`)
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
    const category = await createCategory("category 1");
    await createCategory("category 2");
    const token = await loginAdmin(app);
    const res = await request(app.getHttpServer())
      .put(`/api/categories/${category.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "category 2",
      });

    expectErrorResponse(res, HttpStatus.CONFLICT, ConflictException.name);
  });
});
