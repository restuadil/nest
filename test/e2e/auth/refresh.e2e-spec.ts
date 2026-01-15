import { HttpStatus, INestApplication } from "@nestjs/common";

import request from "supertest";
import { App } from "supertest/types";

import { createActiveUser, resetDb } from "../../helpers/prisma-test.helper";
import { createTestApp } from "../../helpers/test-app.helper";
import { expectSuccessResponse } from "../../response.helper";

describe("Refresh Token E2E", () => {
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

  it("should refresh token successfully", async () => {
    await createActiveUser("refresh@mail.com", "123456");

    const loginRes = await request(app.getHttpServer())
      .post("/api/auth/login")
      .send({ identifier: "refresh@mail.com", password: "123456" })
      .expect(200);

    const cookies = loginRes.headers["set-cookie"];
    expect(cookies).toBeDefined();
    expect(cookies.length).toBeGreaterThan(0);

    const res = await request(app.getHttpServer())
      .get("/api/auth/refresh-token")
      .set("Cookie", cookies)
      .expect(200);

    expectSuccessResponse<{ accessToken: string }>(res, HttpStatus.OK, {
      accessToken: expect.any(String) as string,
    });

    const newCookies = res.headers["set-cookie"];
    expect(newCookies).toBeDefined();
    expect(newCookies.length).toBeGreaterThan(0);
  });
});
