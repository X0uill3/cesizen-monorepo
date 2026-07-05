import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { checkRole, protect, softProtect } from '../../middleware/authMiddleware.js';
import { GlobalRole } from '../../constants/roles.js';
import User from '../../models/User.js';

jest.mock('jsonwebtoken', () => ({
    __esModule: true,
    default: {
        verify: jest.fn(),
    },
}));

jest.mock('../../models/User.js', () => ({
    __esModule: true,
    default: {
        findById: jest.fn(),
    },
}));

const mockedJwt = jwt as unknown as { verify: jest.Mock };
const mockedUser = User as unknown as { findById: jest.Mock };

const makeReq = (authorization?: string) =>
({
    headers: authorization ? { authorization } : {},
    user: undefined,
} as unknown as Request & { user?: any });

const makeRes = () => {
    const json = jest.fn();
    const status = jest.fn(() => ({ json }));
    return { status, json } as unknown as Response & { status: jest.Mock; json: jest.Mock };
};

describe('authMiddleware unit tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('protect should return 401 when no bearer token', async () => {
        const req = makeReq();
        const res = makeRes();
        const next = jest.fn() as NextFunction;

        await protect(req as any, res as any, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(next).not.toHaveBeenCalled();
    });

    it('protect should return 401 for invalid token', async () => {
        const req = makeReq('Bearer bad-token');
        const res = makeRes();
        const next = jest.fn() as NextFunction;

        mockedJwt.verify.mockImplementation(() => {
            throw new Error('bad token');
        });

        await protect(req as any, res as any, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(next).not.toHaveBeenCalled();
    });

    it('protect should return 401 when user not found', async () => {
        const req = makeReq('Bearer valid-token');
        const res = makeRes();
        const next = jest.fn() as NextFunction;

        mockedJwt.verify.mockReturnValue({ id: 'abc' });
        mockedUser.findById.mockReturnValue({
            select: jest.fn().mockResolvedValue(null),
        });

        await protect(req as any, res as any, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(next).not.toHaveBeenCalled();
    });

    it('protect should return 403 when user is disabled', async () => {
        const req = makeReq('Bearer valid-token');
        const res = makeRes();
        const next = jest.fn() as NextFunction;

        mockedJwt.verify.mockReturnValue({ id: 'abc' });
        mockedUser.findById.mockReturnValue({
            select: jest.fn().mockResolvedValue({ _id: 'abc', systemStatus: 'Disabled' }),
        });

        await protect(req as any, res as any, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(next).not.toHaveBeenCalled();
    });

    it('protect should call next when token and user are valid', async () => {
        const req = makeReq('Bearer valid-token');
        const res = makeRes();
        const next = jest.fn() as NextFunction;

        mockedJwt.verify.mockReturnValue({ id: 'abc' });
        mockedUser.findById.mockReturnValue({
            select: jest.fn().mockResolvedValue({ _id: 'abc', systemStatus: 'Enabled', role: 'USER' }),
        });

        await protect(req as any, res as any, next);

        expect(next).toHaveBeenCalledTimes(1);
        expect((req as any).user).toBeDefined();
    });

    it('softProtect should set guest role without token', async () => {
        const req = makeReq();
        const res = makeRes();
        const next = jest.fn() as NextFunction;

        await softProtect(req as any, res as any, next);

        expect((req as any).user.role).toBe(GlobalRole.GUEST);
        expect(next).toHaveBeenCalledTimes(1);
    });

    it('softProtect should set guest role if token verification fails', async () => {
        const req = makeReq('Bearer invalid-token');
        const res = makeRes();
        const next = jest.fn() as NextFunction;

        mockedJwt.verify.mockImplementation(() => {
            throw new Error('bad token');
        });

        await softProtect(req as any, res as any, next);

        expect((req as any).user.role).toBe(GlobalRole.GUEST);
        expect(next).toHaveBeenCalledTimes(1);
    });

    it('softProtect should return 403 for disabled account', async () => {
        const req = makeReq('Bearer valid-token');
        const res = makeRes();
        const next = jest.fn() as NextFunction;

        mockedJwt.verify.mockReturnValue({ id: 'abc' });
        mockedUser.findById.mockReturnValue({
            select: jest.fn().mockResolvedValue({ _id: 'abc', systemStatus: 'Disabled' }),
        });

        await softProtect(req as any, res as any, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(next).not.toHaveBeenCalled();
    });

    it('checkRole should block forbidden role with 403', () => {
        const middleware = checkRole([GlobalRole.ADMIN]);
        const req = { user: { role: GlobalRole.USER } } as any;
        const res = makeRes();
        const next = jest.fn() as NextFunction;

        middleware(req, res as any, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(next).not.toHaveBeenCalled();
    });

    it('checkRole should allow role in allowlist', () => {
        const middleware = checkRole([GlobalRole.ADMIN, GlobalRole.USER]);
        const req = { user: { role: GlobalRole.USER } } as any;
        const res = makeRes();
        const next = jest.fn() as NextFunction;

        middleware(req, res as any, next);

        expect(next).toHaveBeenCalledTimes(1);
    });
});
