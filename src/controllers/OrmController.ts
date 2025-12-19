import type { Request as ExpressRequest } from 'express';
import { Controller } from 'tsoa';
import type { OrmSession } from 'metal-orm';

export abstract class OrmController extends Controller {
  protected requireSession(request: ExpressRequest): OrmSession {
    if (!request.ormSession) {
      throw new Error('Orm session is missing from the request');
    }
    return request.ormSession;
  }
}

