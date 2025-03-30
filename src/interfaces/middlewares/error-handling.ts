import { AppError } from "../utils/AppError";
import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      status: "error",
      message: err.message,
    });
    return 
  }

  if (err instanceof ZodError) {
     res.status(400).json({
      status: "error",
      message: err.issues,
    });
    return 
  }

  console.error(err);

   res.status(500).json({
    status: "error",
    message: "Internal server error",
  });
  return 
}