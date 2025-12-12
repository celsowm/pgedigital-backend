/**
 * Unit of Work middleware for automatic transaction management.
 *
 * Wraps mutating requests (POST, PUT, PATCH, DELETE) in a transaction,
 * automatically committing on success or rolling back on error.
 */
import type { Request, Response, NextFunction } from 'express';
import type { OrmSession } from 'metal-orm';
import { logger } from '../services/logger.js';

type RequestWithSession = Request & { ormSession?: OrmSession };

const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

/**
 * Unit of Work middleware that automatically handles commit/rollback.
 *
 * For GET/HEAD/OPTIONS requests, no transaction management is performed.
 * For mutating methods, the response is intercepted to commit on success
 * or rollback on error.
 */
export const unitOfWork = (
    req: RequestWithSession,
    res: Response,
    next: NextFunction,
) => {
    const session = req.ormSession;
    const isMutating = MUTATING_METHODS.has(req.method);

    if (!session || !isMutating) {
        return next();
    }

    // Wrap the response `end` to commit/rollback before sending
    const originalEnd = res.end.bind(res);

    // Track if we've already handled the transaction
    let transactionHandled = false;

    const handleTransaction = async () => {
        if (transactionHandled) return;
        transactionHandled = true;

        try {
            // Success responses: 2xx status codes trigger commit
            if (res.statusCode >= 200 && res.statusCode < 300) {
                logger.debug('uow', 'commit', {
                    method: req.method,
                    path: req.path,
                    status: res.statusCode,
                });
                await session.commit();
            } else {
                // Non-success responses trigger rollback
                logger.debug('uow', 'rollback (non-success status)', {
                    method: req.method,
                    path: req.path,
                    status: res.statusCode,
                });
                await session.rollback();
            }
        } catch (err) {
            logger.error('Transaction handling failed', err);
        }
    };

    // Override end to handle transaction before sending response
    res.end = function (...args: Parameters<Response['end']>) {
        handleTransaction()
            .finally(() => {
                originalEnd(...args);
            });
        return res;
    } as Response['end'];

    // Handle errors by rolling back
    res.once('error', async () => {
        if (!transactionHandled) {
            transactionHandled = true;
            logger.debug('uow', 'rollback (response error)', {
                method: req.method,
                path: req.path,
            });
            try {
                await session.rollback();
            } catch (err) {
                logger.error('Rollback on error failed', err);
            }
        }
    });

    next();
};
