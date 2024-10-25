import * as vscode from 'vscode';

import { FileSystemObject } from './types/FileSystemObject';
import { TypedDirectory } from './types/TypedDirectory';

export async function buildTypedDirectory(uri: vscode.Uri, name?: string | undefined) {
    const type = (await vscode.workspace.fs.stat(uri)).type;
    return new TypedDirectory(uri.path, type, name);
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
