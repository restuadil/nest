/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { expect } from "vitest";

import { Meta, TestingResponse } from "src/types/web.type";
export function expectSuccessResponse<T>(
  res: TestingResponse<T>,
  statusCode: number,
  data: Partial<T> | T,
) {
  expect(res.status).toBe(statusCode);
  expect(res.body).toMatchObject({
    statusCode,
    status: true,
    data,
    message: expect.any(String),
    error: null,
  });

  expect(res.body.timestamp).toEqual(expect.any(String));
  expect(res.body.path).toEqual(expect.any(String));
}

export function expectErrorResponse(
  res: any,
  statusCode: number,
  error: string,
  message?: string,
) {
  expect(res.status).toBe(statusCode);
  expect(res.body).toMatchObject({
    statusCode,
    status: false,
    data: null,
    error: error,
    message: message ?? expect.any(String),
  });

  // Fields yang dinamis kita validate tipe saja
  expect(res.body.timestamp).toEqual(expect.any(String));
  expect(res.body.path).toEqual(expect.any(String));
}
export function expectPaginationResponse(res: any) {
  expect.any(res.body.meta) as unknown as Meta;
}
