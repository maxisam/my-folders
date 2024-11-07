import { before } from 'node:test';
import { strictEqual, throws } from 'assert';

import sinon from 'sinon';
import * as os from 'os';
import * as vscode from 'vscode';

import {
    buildTypedDirectory,
    checkNull,
    createFileSystemObject,
    getPlatform,
    runCommand,
} from './utils';

jest.mock('os', () => {
    // Import the original module to preserve non-mocked methods
    const originalOs = jest.requireActual('os');
    return {
        ...originalOs,
        platform: jest.fn(),
    };
});

describe('Utils Tests', () => {
    describe('checkNull', () => {
        it('should return the value if not null', () => {
            const result = checkNull('test', 'Error message');
            strictEqual(result, 'test');
        });

        it('should throw an error if value is null', () => {
            throws(() => checkNull(null, 'Error message'), /Error message/);
        });
    });

    describe('buildTypedDirectory', () => {
        it('should return a typed directory object', async () => {
            const uri = vscode.Uri.file('/path/to/dir');
            const statStub = sinon.stub(vscode.workspace.fs, 'stat').resolves({
                type: vscode.FileType.Directory,
                ctime: 0,
                mtime: 0,
                size: 0,
            });
            const result = await buildTypedDirectory(uri);
            strictEqual(result.name, 'dir');
            strictEqual(result.path, '/path/to/dir');
            strictEqual(result.type, vscode.FileType.Directory);
            statStub.restore();
        });
    });

    describe('createFileSystemObject', () => {
        it('should create a FileSystemObject', () => {
            const uri = vscode.Uri.file('/path/to/file');
            const result = createFileSystemObject('folder', vscode.FileType.File, uri, true);
            strictEqual(result.resourceUri.path, '/path/to/file');
        });
    });

    describe('runCommand', () => {
        before(() => {
            vscode.window.showErrorMessage = <T>(
                message: string,
                ...items: T[]
            ): Thenable<T | undefined> => {
                console.error(message);
                return Promise.resolve(undefined);
            };
        });

        it('should return stdout on success', async () => {
            const result = await runCommand('git', ['status'], '.');
            result.startsWith('On branch');
        });
    });

    describe('getPlatform', () => {
        // Type assertion to inform TypeScript that os.platform is a Jest mock function
        const mockedPlatform = os.platform as jest.MockedFunction<typeof os.platform>;

        beforeEach(() => {
            // Clear all previous mock implementations and calls
            mockedPlatform.mockReset();
        });

        it('should return "win32" when os.platform() starts with "win"', () => {
            const windowsPlatforms = ['win32', 'win64', 'windows'];

            windowsPlatforms.forEach((winPlatform) => {
                mockedPlatform.mockReturnValue(winPlatform as any);
                expect(getPlatform()).toBe('win32');
            });
        });

        it('should return "linux" when os.platform() is "linux"', () => {
            mockedPlatform.mockReturnValue('linux');
            expect(getPlatform()).toBe('linux');
        });

        it('should return "darwin" when os.platform() is "darwin"', () => {
            mockedPlatform.mockReturnValue('darwin');
            expect(getPlatform()).toBe('darwin');
        });

        it('should return "unsupported" for unknown platforms', () => {
            const unsupportedPlatforms: Array<string | null | undefined> = [
                'freebsd',
                'sunos',
                'aix',
                'unknown',
                '',
                null,
                undefined,
            ];

            unsupportedPlatforms.forEach((platform) => {
                mockedPlatform.mockReturnValue(platform as any);
                expect(getPlatform()).toBe('unsupported');
            });
        });
    });
});
