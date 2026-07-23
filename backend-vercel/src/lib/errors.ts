export class HttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export class NotFoundError extends HttpError {
  constructor(message: string) {
    super(404, message);
  }
}

export class BadCredentialsError extends HttpError {
  constructor() {
    super(401, "Invalid credentials");
  }
}

export class ForbiddenError extends HttpError {
  constructor() {
    super(403, "Access denied");
  }
}

export class BadRequestError extends HttpError {
  constructor(message: string) {
    super(400, message);
  }
}
