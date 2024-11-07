import * as vscode from 'vscode';

export enum vscodeCommands {
    Open = 'vscode.open',
    SetContext = 'setContext',
    GitRefresh = 'git.refresh',
    RevealInExplorer = 'revealInExplorer',
}

export function focusFileExplorer(uri: vscode.Uri) {
    vscode.commands.executeCommand(vscodeCommands.RevealInExplorer, uri);
}
