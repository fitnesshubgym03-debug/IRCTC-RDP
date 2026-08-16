export class ApiError extends Error {
  statusCode: number;
  code: string;

  constructor(statusCode: number, message: string, code = "ERROR") {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}

export const Errors = {
  unauthorized: () => new ApiError(401, "Unauthorized", "UNAUTHORIZED"),
  forbidden: () => new ApiError(403, "Forbidden", "FORBIDDEN"),
  notFound: (what = "Resource") => new ApiError(404, `${what} not found`, "NOT_FOUND"),
  conflict: (message: string) => new ApiError(409, message, "CONFLICT"),
  unprocessable: (message: string) => new ApiError(422, message, "UNPROCESSABLE_ENTITY"),
  paymentsNotConfigured: () =>
    new ApiError(503, "Payments are not configured. Contact support.", "PAYMENTS_NOT_CONFIGURED"),
};