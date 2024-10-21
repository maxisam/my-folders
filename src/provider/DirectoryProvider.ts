import * as vscode from 'vscode';

import type { DirectoryWorker } from '../operator/DirectoryWorker';
import type { FileSystemObject } from '../types/FileSystemObject';

export class DirectoryProvider implements vscode.TreeDataProvider<FileSystemObject> {
    private _onDidChangeTreeData: vscode.EventEmitter<FileSystemObject | undefined | null | void> =
        new vscode.EventEmitter<FileSystemObject | undefined | null | void>();

    readonly onDidChangeTreeData: vscode.Event<FileSystemObject | undefined | null | void> =
        this._onDidChangeTreeData.event;

    constructor(private directoryOperator: DirectoryWorker) {}

    getTreeItem(element: FileSystemObject): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return element;
    }

    async getChildren(element?: FileSystemObject): Promise<FileSystemObject[]> {
        return await this.directoryOperator.getChildren(element);
    }

    async selectItem(uri: vscode.Uri | undefined, name?: string | undefined) {
        await this.directoryOperator.selectItem(uri, name);
        this.refresh();
    }

    async removeItem(uri: vscode.Uri | undefined) {
        await this.directoryOperator.removeItem(uri);
        this.refresh();
    }

    removeAllItems() {
        this.directoryOperator.removeAllItems();
        this.refresh();
    }

    async renameItem(element: FileSystemObject): Promise<void> {
        const value = await vscode.window.showInputBox({
            placeHolder: 'New name for bookmark',
        });

        if (!value) {
            return;
        }

        await this.removeItem(element.resourceUri);
        await this.selectItem(element.resourceUri, value);
    }

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }
}
