import * as filePath from 'path';

import type * as vscode from 'vscode';

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
