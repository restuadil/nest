import {
  ForbiddenException,
  HttpStatus,
  INestApplication,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";

import request from "supertest";
import { App } from "supertest/types";

import { login, loginAdmin } from "../../helpers/auth-test.helper";
import {
  createActiveUser,
  createCategory,
  resetDb,
} from "../../helpers/prisma-test.helper";
import { createTestApp } from "../../helpers/test-app.helper";
import {
  expectErrorResponse,
  expectSuccessResponse,
} from "../../response.helper";

describe("Delete Catgory E2E", () => {
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

  it("should delete category successfully", async () => {
    const token = await loginAdmin(app);
    const category = await createCategory("category 1");
    const res = await request(app.getHttpServer())
      .delete(`/api/categories/${category.id}`)
      .set("Authorization", `Bearer ${token}`);
    expectSuccessResponse<null>(res, HttpStatus.OK, null);
  });

  it("should return 401 unauthorized", async () => {
    const category = await createCategory("category 1");
    const res = await request(app.getHttpServer()).delete(
      `/api/categories/${category.id}`,
    );
    expectErrorResponse(
      res,
      HttpStatus.UNAUTHORIZED,
      UnauthorizedException.name,
    );
  });

  it("should return 403 forbidden", async () => {
    await createActiveUser("delete@mail.com", "123456");
    const token = await login(app, {
      identifier: "delete@mail.com",
      password: "123456",
    });
    const category = await createCategory("category 1");
    const res = await request(app.getHttpServer())
      .delete(`/api/categories/${category.id}`)
      .set("Authorization", `Bearer ${token}`);
    expectErrorResponse(res, HttpStatus.FORBIDDEN, ForbiddenException.name);
  });

  it("should 400 if id is invalid", async () => {
    const token = await loginAdmin(app);
    await createCategory("category 1");
    const res = await request(app.getHttpServer())
      .delete("/api/categories/invalid-id")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(HttpStatus.BAD_REQUEST);
    expectErrorResponse(res, HttpStatus.BAD_REQUEST, "VALIDATION ERROR");
  });

  it("should return 404 category not found", async () => {
    const token = await loginAdmin(app);
    const res = await request(app.getHttpServer())
      .delete(`/api/categories/cmkfo0soe0000dcval0o70g95`)
      .set("Authorization", `Bearer ${token}`);
    expectErrorResponse(res, HttpStatus.NOT_FOUND, NotFoundException.name);
  });
});
