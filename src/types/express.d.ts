import type { OrmSession } from 'metal-orm';

declare global {
  namespace Express {
    interface Request {
      ormSession?: OrmSession;
    }
  }
}

export {};
