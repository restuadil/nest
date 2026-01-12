import { Test } from "@nestjs/testing";
import { AppService } from "./app.service";
import { describe, it, expect, beforeAll } from "vitest";

describe("AppService", () => {
  let service: AppService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [AppService],
    }).compile();

    service = moduleRef.get<AppService>(AppService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should return hello message", () => {
    expect(service.getHello()).toBe("Hello World!");
  });
});
