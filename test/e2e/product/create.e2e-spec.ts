import { HttpStatus, INestApplication } from "@nestjs/common";

import request from "supertest";
import { App } from "supertest/types";

import { Product } from "src/generated/prisma/client";

import { loginAdmin } from "../../helpers/auth-test.helper";
import { createCategory, resetDb } from "../../helpers/prisma-test.helper";
import { createTestApp } from "../../helpers/test-app.helper";
import { expectSuccessResponse } from "../../response.helper";

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
  it("should create product successfully", async () => {
    const category1 = await createCategory("category 1");
    const category2 = await createCategory("category 2");
    const token = await loginAdmin(app);
    const res = await request(app.getHttpServer())
      .post("/api/products")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Product 1",
        description: "Product 1 description",
        images: [
          "https://upload.wikimedia.org/wikipedia/en/1/13/One_Piece_Anime_Logo_International.png",
        ],
        price: 100,
        categoryIds: [category1.id, category2.id],
      });
    expectSuccessResponse<Product>(res, HttpStatus.CREATED, {
      id: expect.any(String) as string,
      name: "Product 1",
      description: "Product 1 description",
      images: [
        "https://upload.wikimedia.org/wikipedia/en/1/13/One_Piece_Anime_Logo_International.png",
      ],
      price: 100,
      status: "ACTIVE",
    });
  });
});
