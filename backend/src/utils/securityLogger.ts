import pino from 'pino';

// Logger structuré JSON — compatible SIEM (Azure Monitor, ELK, Wazuh)
const logger = pino({
    level: process.env.LOG_LEVEL || 'info',
    // Masquage automatique des champs sensibles (OWASP A09 - Security Logging)
    redact: {
        paths: ['password', 'token', 'secret', '*.password', '*.token', '*.secret'],
        censor: '[REDACTED]',
    },
    base: { service: 'cesizen-api' },
    timestamp: pino.stdTimeFunctions.isoTime,
});

export const logAuthSuccess = (userId: string, email: string, ip: string) =>
    logger.info({ event: 'AUTH_SUCCESS', userId, email, ip });

export const logAuthFailure = (email: string, ip: string, reason: string) =>
    logger.warn({ event: 'AUTH_FAILURE', email, ip, reason });

export const logAccessDenied = (userId: string | undefined, resource: string, ip: string) =>
    logger.warn({ event: 'ACCESS_DENIED', userId, resource, ip });

export const logRateLimit = (ip: string, path: string) =>
    logger.warn({ event: 'RATE_LIMIT_HIT', ip, path });

export const logSecurityError = (message: string, context: Record<string, unknown> = {}) =>
    logger.error({ event: 'SECURITY_ERROR', message, ...context });

export default logger;
