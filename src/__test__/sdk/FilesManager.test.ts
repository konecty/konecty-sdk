import { KonectyClient, KonectyClientOptions } from '@konecty/sdk/Client';
import { KonFiles } from '@konecty/sdk/types/files';
import { KonectyResult } from '@konecty/sdk/types/konectyReturn';
import NodeFormData from 'form-data';
import fetch from 'isomorphic-fetch';
import { FilesManager } from '../../sdk/FilesManager';
import verifyResponseStatus from '../../utils/verifyResponseStatus';

jest.mock('isomorphic-fetch');
jest.mock('../../utils/verifyResponseStatus');

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
            ok: true,
            json: jest.fn().mockResolvedValue(mockResponse),
        });

        (verifyResponseStatus as jest.Mock).mockResolvedValue(fileConfig);

        const result = await filesManager.upload(mockFormData);

        expect(result.success).toBe(true);

        if (result.success) {
            expect(result.data).toEqual(fileConfig);
        } else {
            throw new Error('Upload failed unexpectedly');
        }
    });
});

  describe('deleteFile', () => {
    it('should delete a file successfully', async () => {
      const mockResponse: KonectyResult<'no-data'> = { success: true };

      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      (verifyResponseStatus as jest.Mock).mockResolvedValue(undefined);

      const result = await filesManager.deleteFile('testFile.txt');

      expect(result.success).toBe(true);
      expect(filesManager['files']).toHaveLength(0);
    });
  });

  describe('reorder', () => {
    it('should reorder files using push mode', async () => {
        const mockUpdateResult: KonectyResult<'no-data'> = { success: true };

        jest.spyOn(KonectyClient.prototype, 'update').mockResolvedValue(mockUpdateResult);

        filesManager = new FilesManager(konectyClientOpts, [
            { ...fileConfig, key: 'fileKey123' },
            { ...fileConfig, key: 'fileKey456', name: 'anotherFile.txt' },
        ], recordData);

        const result = await filesManager.reorder('anotherFile.txt', 0, 'push');

       
        expect(result.success).toBe(true);

        expect(filesManager['files']).toHaveLength(2);
        expect(filesManager['files'][0].name).toBe('anotherFile.txt');
    });
});
})