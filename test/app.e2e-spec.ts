import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";

import request from "supertest";
import { App } from "supertest/types";
import { describe, it, expect, beforeAll, afterAll } from "vitest";

import { AppModule } from "../src/app.module";

describe("App E2E", () => {
  let app: INestApplication<App>;

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
    expect(res.status).toBe(404);
  });
});
