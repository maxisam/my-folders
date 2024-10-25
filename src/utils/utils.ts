import * as path from 'path';

import * as vscode from 'vscode';

import { FileSystemObject } from '../types/FileSystemObject';
import type { ITypedDirectory } from '../types/TypedDirectory';

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
    directoryContext?: string,
): FileSystemObject {
    const collapsibleState =
        type === vscode.FileType.File
            ? vscode.TreeItemCollapsibleState.None
            : vscode.TreeItemCollapsibleState.Collapsed;

    const fObj = new FileSystemObject(folderName, collapsibleState, fileUri, hideContent);
    if (directoryContext) {
        fObj.setContextValue(directoryContext);
    }
    return fObj;
}

export function focusFileExplorer(uri: vscode.Uri) {
    vscode.commands.executeCommand('revealInExplorer', uri);
}
