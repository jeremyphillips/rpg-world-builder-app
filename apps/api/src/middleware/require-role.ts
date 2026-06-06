import type { NextFunction, Request, Response } from "express";
import type { Role } from "@rpg/contracts";

import { HttpError } from "../lib/http-error";

/**
 * Allow only the listed roles. Must run after `requireAuth`. Responds 403 when
 * an authenticated user lacks a permitted role.
 */
export function requireRole(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      next(HttpError.unauthorized());
      return;
    }
    if (!roles.includes(req.user.role)) {
      next(HttpError.forbidden("Insufficient role"));
      return;
    }
    next();
  };
}
