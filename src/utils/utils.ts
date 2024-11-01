import * as path from 'path';

import promiseSpawn from '@npmcli/promise-spawn';
import * as vscode from 'vscode';

import { FileSystemObject } from '../types/FileSystemObject';
import type { ITypedDirectory } from '../types/TypedDirectory';

export function checkNull<T>(value: T | null | undefined, errorMessage: string): T {
    if (value == null) {
        vscode.window.showErrorMessage(errorMessage);
        throw new Error(errorMessage);
    }
    return value;
}

export async function buildTypedDirectory(
    uri: vscode.Uri,
    name?: string,
): Promise<ITypedDirectory> {
    const type = (await vscode.workspace.fs.stat(uri)).type;
    const _name = name || path.basename(uri.path) || uri.path;
    return { name: _name, path: uri.path, type };
}

export function createFileSystemObject(
    folderName: string,
    type: vscode.FileType,
    fileUri: vscode.Uri,
    hideContent: boolean,
    isMyFolderItem = false,
): FileSystemObject {
    const fObj = new FileSystemObject(folderName, type, fileUri, hideContent);
    if (isMyFolderItem) {
        fObj.setContextValue();
    }

    return fObj;
}

export function focusFileExplorer(uri: vscode.Uri) {
    vscode.commands.executeCommand('revealInExplorer', uri);
}

export async function runCommand(
    cmdPath: string,
    safeArgs: string[],
    repoPath: string,
): Promise<string> {
    try {
        const res = await promiseSpawn(cmdPath, safeArgs, { cwd: repoPath });
        return res.stdout;
    } catch (error: any) {
        vscode.window.showErrorMessage(
            `Error calling command "${cmdPath} ${safeArgs.join(' ')}" : ${error.message} - ${error.stderr}`,
        );
        throw error;
    }
}
