import { createMock } from 'ts-auto-mock';
import { On, method } from 'ts-auto-mock/extension';
import AddItemRpc from "../src/rpc-add-item";
import { describe, expect, beforeEach, test } from '@jest/globals';

describe('AddItemRpc', function () {
    let mockCtx: any, mockLogger: any, mockNk: any, mockLoggerError: any, mockNkStorageRead: any, mockNkStorageWrite: any, mockStorageWriteAck: any;

    beforeEach(function () {
        mockCtx = createMock<nkruntime.Context>({ userId: 'mock-user' });
        mockLogger = createMock<nkruntime.Logger>();
        mockNk = createMock<nkruntime.Nakama>();
        mockStorageWriteAck = createMock<nkruntime.StorageWriteAck>();
        mockLoggerError = On(mockLogger).get(method(function (mock) {
            return mock.error;
        }))
        mockNkStorageRead = On(mockNk).get(method(function (mock) {
            return mock.storageRead;
        }));
        mockNkStorageWrite = On(mockNk).get(method(function (mock) {
            return mock.storageWrite;
        }));
    });

    test('returns failure if payload is null', function () {
        const payload = null;
        const result = AddItemRpc(mockCtx, mockLogger, mockNk, payload);
        const resultPayload = JSON.parse(result);
        const expectedError = 'no payload provided';


        expect(resultPayload.success).toBe(false);
        expect(resultPayload.error).toBe(expectedError);
        expect(mockLoggerError).toBeCalledWith(expectedError);
    });

    test('returns failure if payload is empty string', function () {
        const payload = "";
        const result = AddItemRpc(mockCtx, mockLogger, mockNk, payload);
        const resultPayload = JSON.parse(result);
        const expectedError = 'no payload provided';

        expect(resultPayload.success).toBe(false);
        expect(resultPayload.error).toBe(expectedError);
        expect(mockLoggerError).toBeCalledWith(expectedError);
    });

    test('returns failure if payload is empty JSON object', function () {
        const payload = JSON.stringify({});
        const result = AddItemRpc(mockCtx, mockLogger, mockNk, payload);
        const resultPayload = JSON.parse(result);
        const expectedError = 'item has no name';

        expect(resultPayload.success).toBe(false);
        expect(resultPayload.error).toBe(expectedError);
        expect(mockLoggerError).toBeCalledWith(expectedError);
    });

    test('returns failure if payload has no quantity', function () {
        const payload = JSON.stringify({
            name: 'Diamond Pickaxe'
        });
        const result = AddItemRpc(mockCtx, mockLogger, mockNk, payload);
        const resultPayload = JSON.parse(result);
        const expectedError = 'item has no quantity';

        expect(resultPayload.success).toBe(false);
        expect(resultPayload.error).toBe(expectedError);
        expect(mockLoggerError).toBeCalledWith(expectedError);
    });

    test('returns failure if payload has 0 quantity', function () {
        const payload = JSON.stringify({
            name: 'Diamond Pickaxe',
            quantity: 0
        });
        const result = AddItemRpc(mockCtx, mockLogger, mockNk, payload);
        const resultPayload = JSON.parse(result);
        const expectedError = 'item has no quantity';

        expect(resultPayload.success).toBe(false);
        expect(resultPayload.error).toBe(expectedError);
        expect(mockLoggerError).toBeCalledWith(expectedError);
    });

    test('returns failure if payload has non-numeric quantity', function () {
        const payload = JSON.stringify({
            name: 'Diamond Pickaxe',
            quantity: "test"
        });
        const result = AddItemRpc(mockCtx, mockLogger, mockNk, payload);
        const resultPayload = JSON.parse(result);
        const expectedError = 'item has no quantity';

        expect(resultPayload.success).toBe(false);
        expect(resultPayload.error).toBe(expectedError);
        expect(mockLoggerError).toBeCalledWith(expectedError);
    });

    test('returns failure if payload has negative quantity', function () {
        const payload = JSON.stringify({
            name: 'Diamond Pickaxe',
            quantity: -1
        });
        const result = AddItemRpc(mockCtx, mockLogger, mockNk, payload);
        const resultPayload = JSON.parse(result);
        const expectedError = 'quantity provided must be greater than 0';

        expect(resultPayload.success).toBe(false);
        expect(resultPayload.error).toBe(expectedError);
        expect(mockLoggerError).toBeCalledWith(expectedError);
    });

    test('returns failure if nk.storageWrite returns null', function () {
        (mockNkStorageWrite as jest.Mock).mockReturnValueOnce(null);

        const payload = JSON.stringify({
            name: 'Diamond Pickaxe',
            quantity: 1
        });
        const result = AddItemRpc(mockCtx, mockLogger, mockNk, payload);
        const resultPayload = JSON.parse(result);
        const expectedError = 'error saving inventory';

        expect(resultPayload.success).toBe(false);
        expect(resultPayload.error).toBe(expectedError);
        expect(mockLoggerError).toBeCalledWith(expectedError);
    });

    test('returns failure if nk.storageWrite returns an empty array', function () {
        (mockNkStorageWrite as jest.Mock).mockReturnValueOnce([]);

        const payload = JSON.stringify({
            name: 'Diamond Pickaxe',
            quantity: 1
        });
        const result = AddItemRpc(mockCtx, mockLogger, mockNk, payload);
        const resultPayload = JSON.parse(result);
        const expectedError = 'error saving inventory';

        expect(resultPayload.success).toBe(false);
        expect(resultPayload.error).toBe(expectedError);
        expect(mockLoggerError).toBeCalledWith(expectedError);
    });

    test('returns sucess if nk.storageWrite returns an ack', function () {
        (mockNkStorageWrite as jest.Mock).mockReturnValueOnce([mockStorageWriteAck]);

        const payload = JSON.stringify({
            name: 'Diamond Pickaxe',
            quantity: 1
        });

        const result = AddItemRpc(mockCtx, mockLogger, mockNk, payload);
        const resultPayload = JSON.parse(result);

        expect(resultPayload.success).toBe(true);
        expect(resultPayload.error).toBe(undefined);
        expect(mockLoggerError).toBeCalledTimes(0);
    });

    test('calls nk.storageRead with correct arguments', function () {
        const payload = JSON.stringify({
            name: 'Diamond Pickaxe',
            quantity: 1
        });
        AddItemRpc(mockCtx, mockLogger, mockNk, payload);

        expect(mockNkStorageRead).toBeCalledWith([{
            collection: "player",
            key: "inventory",
            userId: mockCtx.userId
        }]);
    });

    test('calls nk.storageWrite with just the new item when no item already exists in inventory', function () {
        (mockNkStorageRead as jest.Mock).mockReturnValueOnce({});

        const payload = JSON.stringify({
            name: 'Diamond Pickaxe',
            quantity: 1
        });
        AddItemRpc(mockCtx, mockLogger, mockNk, payload);

        expect(mockNkStorageWrite).toBeCalledWith([{
            collection: "player",
            key: "inventory",
            userId: mockCtx.userId,
            permissionRead: 1,
            permissionWrite: 1,
            value: {
                'Diamond Pickaxe': 1
            }
        }]);
    });

    test('calls nk.storageWrite with incremented item quantity when item already exists in inventory', function () {
        (mockNkStorageRead as jest.Mock).mockReturnValueOnce([
            {
                value: {
                    'Diamond Pickaxe': 3
                }
            }
        ]);

        const payload = JSON.stringify({
            name: 'Diamond Pickaxe',
            quantity: 1
        });
        AddItemRpc(mockCtx, mockLogger, mockNk, payload);

        expect(mockNkStorageWrite).toBeCalledWith([{
            collection: "player",
            key: "inventory",
            userId: mockCtx.userId,
            permissionRead: 1,
            permissionWrite: 1,
            value: {
                'Diamond Pickaxe': 4
            }
        }]);
    });

    test('calls nk.storageWrite with incremented item quantity and other items when item already exists in inventory', function () {
        (mockNkStorageRead as jest.Mock).mockReturnValueOnce([
            {
                value: {
                    'Diamond Pickaxe': 3,
                    'Iron Sword': 1,
                    'Coal': 64
                }
            }
        ]);

        const payload = JSON.stringify({
            name: 'Diamond Pickaxe',
            quantity: 1
        });
        AddItemRpc(mockCtx, mockLogger, mockNk, payload);

        expect(mockNkStorageWrite).toBeCalledWith([{
            collection: "player",
            key: "inventory",
            userId: mockCtx.userId,
            permissionRead: 1,
            permissionWrite: 1,
            value: {
                'Diamond Pickaxe': 4,
                'Iron Sword': 1,
                'Coal': 64
            }
        }]);
    });
});