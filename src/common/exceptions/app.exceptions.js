export function BadRequestException({
  errMsg = "Bad Request",
  cause = { },
  statusCode = 400,
} = {}) {
  throw new Error(errMsg, { cause: { ...cause, statusCode } });
}

export function ConflictException({
  errMsg = "Conflict",
  cause = { statusCode: 409 },
} = {}) {
  throw new Error(errMsg, { cause });
}

export function NotFoundException({
  errMsg = "Not Found",
  cause = { statusCode: 404 },
} = {}) {
  throw new Error(errMsg, { cause });
}

export function UnAuthorizeException({
  errMsg = "UnAuthorize",
  cause = { statusCode: 401 },
} = {}) {
  throw new Error(errMsg, { cause });
}

export function ForbiddenException({
  errMsg = "Forbidden",
  cause = { statusCode: 403 },
} = {}) {
  throw new Error(errMsg, { cause });
}
