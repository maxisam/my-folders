import * as filePath from 'path';

import * as vscode from 'vscode';

export class TypedDirectory {
    name: string;
    path: string;
    type: vscode.FileType;

    constructor(path: string, type: vscode.FileType, name?: string | undefined) {
        this.path = path;
        this.type = type;
        this.name = name || filePath.basename(path) || path;
    }
}

export async function buildTypedDirectory(uri: vscode.Uri, name?: string | undefined) {
    const type = (await vscode.workspace.fs.stat(uri)).type;
    return new TypedDirectory(uri.path, type, name);
}
