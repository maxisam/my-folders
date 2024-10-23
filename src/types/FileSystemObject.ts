import * as vscode from 'vscode';

import { ExtensionCommands } from '../commands/CrudCommands';

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
    }

    private createCommand(collapsibleState: vscode.TreeItemCollapsibleState) {
        // If the item is a file, return a command to open the file
        if (collapsibleState === vscode.TreeItemCollapsibleState.None) {
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

    setContextValue(value: string) {
        this.contextValue = value;
        return this;
    }
}
