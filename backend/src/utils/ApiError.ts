/**
 * ApiError — typed error with HTTP status, caught by the error middleware
 * and converted into a JSON response. Keeps controllers free of status-code
 * formatting boilerplate.
 */
export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }

  static badRequest(msg = 'Bad request'): ApiError { return new ApiError(msg, 400); }
  static unauthorized(msg = 'Unauthorized'): ApiError { return new ApiError(msg, 401); }
  static forbidden(msg = 'Forbidden'): ApiError { return new ApiError(msg, 403); }
  static notFound(msg = 'Not found'): ApiError { return new ApiError(msg, 404); }
  static conflict(msg = 'Conflict'): ApiError { return new ApiError(msg, 409); }
}
