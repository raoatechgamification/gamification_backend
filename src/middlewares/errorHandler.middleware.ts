import { Request, Response } from "express";
import { CustomError, ErrorType } from "./customError.middleware";

export const errorHandler = (err: CustomError, req: Request, res: Response) => {
  console.error(err); // Log the error for debugging

  if (err instanceof CustomError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        type: err.type,
        message: err.message,
        details: err.details || null,
      },
    });
  } else {
    res.status(500).json({
      success: false,
      error: {
        type: ErrorType.INTERNAL_SERVER,
        message: "An unexpected error occurred.",
      },
    });
  }
};
