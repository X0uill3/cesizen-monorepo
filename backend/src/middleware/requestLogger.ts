import type { Request, Response, NextFunction } from 'express';
import logger from '../utils/securityLogger.js';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    const ip = req.ip ?? req.socket.remoteAddress ?? 'unknown';

    res.on('finish', () => {
        const duration = Date.now() - start;
        const level = res.statusCode >= 500 ? 'error'
            : res.statusCode >= 400 ? 'warn'
            : 'info';

        logger[level]({
            event: 'HTTP_REQUEST',
            method: req.method,
            path: req.path,
            status: res.statusCode,
            duration_ms: duration,
            ip,
        });
    });

    next();
};
