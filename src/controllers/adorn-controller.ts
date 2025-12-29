import type { Request as ExpressRequest } from 'express';
import type { OrmSession } from 'metal-orm';
import { HttpError } from '../errors/http-error.js';

export function createOrmControllerFactory() {
  return (ctor: any, req: ExpressRequest) => {
    if (ctor.length === 0) {
      return new ctor();
    }

    const session = req.ormSession;
    if (!session) {
      throw new HttpError(500, 'Orm session is missing from the request');
    }

    return new ctor(session as OrmSession);
  };
}
