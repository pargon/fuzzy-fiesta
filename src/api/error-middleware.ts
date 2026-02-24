import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { DomainError } from "../domain/errors/domain.error";

export function errorMiddleware(error: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (error instanceof ZodError) {
    res.status(400).json({
      code: "VALIDATION_ERROR",
      message: "Request validation failed.",
      details: error.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message
      })),
    });
    return;
  }

  if (error instanceof DomainError) {
    res.status(400).json({
      code: error.name,
      message: error.message,
    });
    return;
  }

  console.error(error);

  res.status(500).json({
    code: "INTERNAL_ERROR",
    message: "An unexpected error occurred.",
  });
}