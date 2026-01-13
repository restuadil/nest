/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { expect } from "vitest";

export function expectSuccessResponse(
  res: any,
  statusCode: number,
  dataMatcher?: any,
  message?: string,
) {
  expect(res.status).toBe(statusCode);
  expect(res.body).toMatchObject({
    statusCode,
    status: true,
    data: dataMatcher ?? expect.anything(),
    message: message ?? expect.any(String),
    error: null,
  });

  expect(res.body.timestamp).toEqual(expect.any(String));
  expect(res.body.path).toEqual(expect.any(String));
}

export function expectErrorResponse(
  res: any,
  statusCode: number,
  errorName?: string,
  message?: string,
) {
  expect(res.status).toBe(statusCode);
  expect(res.body).toMatchObject({
    statusCode,
    status: false,
    data: null,
    error: errorName ?? expect.any(String),
    message: message ?? expect.any(String),
  });

  // Fields yang dinamis kita validate tipe saja
  expect(res.body.timestamp).toEqual(expect.any(String));
  expect(res.body.path).toEqual(expect.any(String));
}
