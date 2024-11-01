import { before } from 'node:test';
import { strictEqual, throws } from 'assert';

import promiseSpawn from '@npmcli/promise-spawn';
import sinon from 'sinon';
import * as vscode from 'vscode';

import {
    buildTypedDirectory,
    checkNull,
    createFileSystemObject,
    focusFileExplorer,
    runCommand,
} from './utils';

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

    describe('focusFileExplorer', () => {
        it('should execute revealInExplorer command', () => {
            const uri = vscode.Uri.file('/path/to/file');
            const executeCommandStub = sinon.stub(vscode.commands, 'executeCommand');
            focusFileExplorer(uri);
            strictEqual(executeCommandStub.calledWith('revealInExplorer', uri), true);
            executeCommandStub.restore();
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
});
