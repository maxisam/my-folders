import * as vscode from 'vscode';

import { ExtensionCommands } from '../core/commands';

export class FileSystemObject extends vscode.TreeItem {
    resourceUri: vscode.Uri;
    command?: vscode.Command;

    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        uri: vscode.Uri,
        private hideContent: boolean,
    ) {
        super(label, collapsibleState);
        this.tooltip = uri.fsPath;
        this.resourceUri = uri;
        this.command = this.createCommand(collapsibleState);
        this.iconPath = this.getIconPath(collapsibleState);
    }

    private getIconPath(
        collapsibleState: vscode.TreeItemCollapsibleState,
    ):
        | string
        | vscode.Uri
        | { light: string | vscode.Uri; dark: string | vscode.Uri }
        | vscode.ThemeIcon {
        if (this.isFile(collapsibleState)) {
            return new vscode.ThemeIcon('symbol-file');
        } else {
            return new vscode.ThemeIcon('symbol-folder');
        }
    }

    private createCommand(collapsibleState: vscode.TreeItemCollapsibleState) {
        // If the item is a file, return a command to open the file
        if (this.isFile(collapsibleState)) {
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

    private isFile(collapsibleState: vscode.TreeItemCollapsibleState) {
        return collapsibleState === vscode.TreeItemCollapsibleState.None;
    }

    setContextValue(value: string) {
        this.contextValue = value;
        return this;
    }
}
