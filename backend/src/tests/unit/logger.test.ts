import mongoose from 'mongoose';
import Log from '../../models/Log.js';
import { saveLog } from '../../utils/logger.js';

jest.mock('../../models/Log.js', () => ({
    __esModule: true,
    default: {
        create: jest.fn(),
    },
}));

const mockedLog = Log as unknown as { create: jest.Mock };

describe('logger unit tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('saveLog should create log with optional references', async () => {
        mockedLog.create.mockResolvedValue({ _id: 'log-id' });

        const adminId = new mongoose.Types.ObjectId().toString();
        const userId = new mongoose.Types.ObjectId().toString();
        const articleId = new mongoose.Types.ObjectId().toString();

        await saveLog({
            action: 'ACTION_TEST',
            adminId,
            userId,
            articleId,
            details: 'details',
        });

        expect(mockedLog.create).toHaveBeenCalledTimes(1);
        const payload = mockedLog.create.mock.calls[0][0];
        expect(payload.action).toBe('ACTION_TEST');
        expect(payload.details).toBe('details');
        expect(payload.admin).toBeInstanceOf(mongoose.Types.ObjectId);
        expect(payload.user).toBeInstanceOf(mongoose.Types.ObjectId);
        expect(payload.article).toBeInstanceOf(mongoose.Types.ObjectId);
    });

    it('saveLog should create minimal payload when optional ids are omitted', async () => {
        mockedLog.create.mockResolvedValue({ _id: 'log-id' });

        await saveLog({ action: 'ACTION_MIN' });

        const payload = mockedLog.create.mock.calls[0][0];
        expect(payload.action).toBe('ACTION_MIN');
        expect(payload.admin).toBeUndefined();
        expect(payload.user).toBeUndefined();
        expect(payload.article).toBeUndefined();
    });

    it('saveLog should catch and log error when persistence fails', async () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
        mockedLog.create.mockRejectedValue(new Error('db error'));

        await saveLog({ action: 'ACTION_FAIL' });

        expect(consoleSpy).toHaveBeenCalledTimes(1);
        consoleSpy.mockRestore();
    });
});
