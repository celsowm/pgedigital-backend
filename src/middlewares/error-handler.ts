import type { NextFunction, Request, Response } from 'express';
import { ValidateError } from 'tsoa';
import { HttpError } from '../errors/http-error.js';
import { logger } from '../services/logger.js';

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (err instanceof HttpError) {
    res.status(err.statusCode).json({ message: err.message });
    return;
  }

  if (err instanceof ValidateError) {
    res.status(400).json({
      message: 'Validation failed',
      details: err.fields,
    });
    return;
  }

  logger.error('Unhandled error', err);
  res.status(500).json({ message: 'Internal Server Error' });
};
