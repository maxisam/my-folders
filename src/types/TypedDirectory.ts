import type * as vscode from 'vscode';

export interface ITypedDirectory {
    name: string;
    path: string;
    type: vscode.FileType;
}
