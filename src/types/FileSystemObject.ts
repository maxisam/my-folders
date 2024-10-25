import * as vscode from 'vscode';

import { ExtensionCommands } from '../core/commands';
import { MY_FOLDER_CONTEXT_DIRECTORY, MY_FOLDER_CONTEXT_FILE } from '../core/constants';

function getCollapsibleState(fileType: vscode.FileType) {
    return fileType === vscode.FileType.File
        ? vscode.TreeItemCollapsibleState.None
        : vscode.TreeItemCollapsibleState.Collapsed;
}

export class FileSystemObject extends vscode.TreeItem {
    resourceUri: vscode.Uri;
    command?: vscode.Command;

    constructor(
        public readonly label: string,
        public readonly fileType: vscode.FileType,
        uri: vscode.Uri,
        private hideContent: boolean,
    ) {
        const collapsibleState = getCollapsibleState(fileType);
        super(label, collapsibleState);
        this.tooltip = uri.fsPath;
        this.resourceUri = uri;
        this.command = this.createCommand(fileType);
        this.iconPath = this.getIconPath(fileType);
    }

    private getIconPath(fileType: vscode.FileType) {
        if (fileType === vscode.FileType.File) {
            return new vscode.ThemeIcon('symbol-file');
        } else {
            return new vscode.ThemeIcon('symbol-folder');
        }
    }

    private createCommand(fileType: vscode.FileType) {
        // If the item is a file, return a command to open the file
        if (fileType === vscode.FileType.File) {
            return {
                arguments: [this],
                command: ExtensionCommands.OpenItem,
                title: this.label,
            };
        }
        if (!this.hideContent) {
            return;
        } else {
            return {
                arguments: [this.resourceUri],
                command: 'revealInExplorer',
                title: this.label,
            };
        }
    }

    setContextValue() {
        if (this.fileType === vscode.FileType.Directory) {
            this.contextValue = MY_FOLDER_CONTEXT_DIRECTORY;
        } else {
            this.contextValue = MY_FOLDER_CONTEXT_FILE;
        }
    }
}
