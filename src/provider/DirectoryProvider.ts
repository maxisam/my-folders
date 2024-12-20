import * as vscode from 'vscode';

import type { DirectoryOperator } from '../core/DirectoryOperator';
import type { FileSystemObject } from '../types/FileSystemObject';

export class DirectoryProvider implements vscode.TreeDataProvider<FileSystemObject> {
    private _onDidChangeTreeData: vscode.EventEmitter<FileSystemObject | undefined | null | void> =
        new vscode.EventEmitter<FileSystemObject | undefined | null | void>();

    readonly onDidChangeTreeData: vscode.Event<FileSystemObject | undefined | null | void> =
        this._onDidChangeTreeData.event;

    constructor(private directoryOperator: DirectoryOperator) {}

    getTreeItem(element: FileSystemObject): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return element;
    }

    async getChildren(element?: FileSystemObject): Promise<FileSystemObject[]> {
        return await this.directoryOperator.getChildren(element);
    }

    async selectItemAsync(uri: vscode.Uri | undefined, name?: string | undefined) {
        await this.directoryOperator.selectItemAsync(uri, name);
        this.refresh();
    }

    async removeItemAsync(uri: vscode.Uri | undefined) {
        await this.directoryOperator.removeItemAsync(uri);
        this.refresh();
    }

    async removeAllItemsAsync() {
        await this.directoryOperator.removeAllItemsAsync();
        this.refresh();
    }

    async renameItemAsync(element: FileSystemObject): Promise<void> {
        const newName = await vscode.window.showInputBox({
            placeHolder: `New name for ${element.label}`,
        });
        if (!newName) {
            return;
        }

        await this.directoryOperator.renameItemAsync(element, newName);
        this.refresh();
    }

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }
}
