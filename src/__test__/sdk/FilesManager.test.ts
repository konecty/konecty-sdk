import { KonectyClient, KonectyClientOptions } from '@konecty/sdk/Client';
import { KonFiles } from '@konecty/sdk/types/files';
import { KonectyResult } from '@konecty/sdk/types/konectyReturn';
import NodeFormData from 'form-data';
import fetch from 'isomorphic-fetch';
import { FilesManager } from '../../sdk/FilesManager';
import verifyResponseStatus from '../../utils/verifyResponseStatus';


jest.mock('isomorphic-fetch');
jest.mock('../utils/verifyResponseStatus');

describe('FilesManager', () => {
    const konectyClientOpts: KonectyClientOptions = {
        fileManager: {
            providerUrl: 'http://localhost:3000',
            origin: 'http://localhost:3000',
        },
        accessKey: 'test_access_key',
    };

    const recordData: KonFiles.RecordData = {
        metaObject: 'testObject',
        recordId: 'testRecordId',
        fieldName: 'testFieldName',
        _updatedAt: new Date(),
    };

    const fileConfig: KonFiles.FileConfig = {
        name: 'testFile.txt',
        size: 12345,
        kind: 'text/plain',
        key: 'fileKey123',
    };

    let filesManager: FilesManager;

    beforeEach(() => {
        filesManager = new FilesManager(konectyClientOpts, [fileConfig], recordData);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('upload', () => {
        it('should upload a file successfully', async () => {
            const mockFormData = new NodeFormData();
            const mockResponse: KonectyResult<KonFiles.FileConfig> = { success: true, data: fileConfig };

            (fetch as jest.Mock).mockResolvedValue({
                json: jest.fn().mockResolvedValue(mockResponse),
                ok: true,
            });

            (verifyResponseStatus as jest.Mock).mockResolvedValue(fileConfig);

            const result = await filesManager.upload(mockFormData);

            expect(result.success).toBe(true);
            expect(result.data).toEqual(fileConfig);
            expect(fetch).toHaveBeenCalledWith(
                `${konectyClientOpts.fileManager?.providerUrl}/rest/file/upload/ns/access/testObject/testRecordId/testFieldName`,
                expect.any(Object)
            );
        });

        it('should handle upload error', async () => {
            const mockFormData = new NodeFormData();
            const mockError = new Error('Upload failed');

            (fetch as jest.Mock).mockRejectedValue(mockError);

            const result = await filesManager.upload(mockFormData);

            expect(result.success).toBe(false);
            expect(result.errors).toContain('Upload failed');
        });
    });

    describe('deleteFile', () => {
        it('should delete a file successfully', async () => {
            (fetch as jest.Mock).mockResolvedValue({
                ok: true,
            });

            (verifyResponseStatus as jest.Mock).mockResolvedValue(undefined);

            const result = await filesManager.deleteFile('testFile.txt');

            expect(result.success).toBe(true);
            expect(filesManager['files']).toHaveLength(0);
            expect(fetch).toHaveBeenCalledWith(
                `${konectyClientOpts.fileManager?.providerUrl}/rest/file/delete/ns/access/testObject/testRecordId/testFieldName/testFile.txt`,
                expect.any(Object)
            );
        });

        it('should handle delete error', async () => {
            const mockError = new Error('Delete failed');

            (fetch as jest.Mock).mockRejectedValue(mockError);

            const result = await filesManager.deleteFile('testFile.txt');

            expect(result.success).toBe(false);
            expect(result.errors).toContain('Delete failed');
        });
    });

    describe('reorder', () => {
        it('should reorder files using push mode', async () => {
            const mockUpdateResult: KonectyResult<'no-data'> = { success: true };

            jest.spyOn(KonectyClient.prototype, 'update').mockResolvedValue(mockUpdateResult);

            const result = await filesManager.reorder('testFile.txt', 0, 'push');

            expect(result.success).toBe(true);
            expect(filesManager['files'][0].name).toBe('testFile.txt');
        });

        it('should reorder files using swap mode', async () => {
            const mockUpdateResult: KonectyResult<'no-data'> = { success: true };
            const newFileConfig = { ...fileConfig, name: 'newFile.txt' };

            filesManager = new FilesManager(konectyClientOpts, [fileConfig, newFileConfig], recordData);

            jest.spyOn(KonectyClient.prototype, 'update').mockResolvedValue(mockUpdateResult);

            const result = await filesManager.reorder('testFile.txt', 1, 'swap');

            expect(result.success).toBe(true);
            expect(filesManager['files'][0].name).toBe('newFile.txt');
            expect(filesManager['files'][1].name).toBe('testFile.txt');
        });

        it('should handle invalid position in reorder', async () => {
            const result = await filesManager.reorder('testFile.txt', -1);

            expect(result.success).toBe(false);
            expect(result.errors).toContain('Invalid position -1');
        });
    });
});
