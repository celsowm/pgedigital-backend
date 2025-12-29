import type { Request as ExpressRequest } from 'express';
import type { OrmSession } from 'metal-orm';

/**
 * Base interface for controllers that need ORM session access
 */
export interface AdornController {
  requireSession: (request: ExpressRequest) => OrmSession;
}

/**
 * Controller factory to inject ORM session dependency
 * This will be used with createAdornExpressApp
 */
export function createOrmControllerFactory() {
  return (ctor: any, req: ExpressRequest) => {
    const controller = new ctor();
    
    // Add session requirement method to all controllers
    if (!controller.requireSession) {
      controller.requireSession = (request: ExpressRequest): OrmSession => {
        if (!request.ormSession) {
          throw new Error('Orm session is missing from the request');
        }
        return request.ormSession;
      };
    }
    
    return controller;
  };
}