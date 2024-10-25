import * as vscode from 'vscode';

const workspaceFolders = vscode.workspace.workspaceFolders;
export function getRelativePath(path: vscode.Uri) {
    if (!workspaceFolders || workspaceFolders.length === 0) {
        return;
    }

    for (const workspace of workspaceFolders) {
        if (path.fsPath.startsWith(workspace.uri.fsPath)) {
            const relative = path.path.slice(workspace.uri.path.length);
            return relative.startsWith('/') ? relative.slice(1) : relative;
        }
    }
    return;
}
