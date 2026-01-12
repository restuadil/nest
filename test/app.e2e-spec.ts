import { Test } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { AppModule } from "../src/app.module";
import { describe, it, expect, beforeAll, afterAll } from "vitest";

describe("App E2E", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("/GET /", async () => {
    const res = await request(app.getHttpServer()).get("/");
    expect(res.status).toBe(200);
  });
});
