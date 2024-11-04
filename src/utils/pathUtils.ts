import * as vscode from 'vscode';

export function getRelativePath(
    path: vscode.Uri,
    workspaceFolders?: readonly vscode.WorkspaceFolder[],
) {
    if (!workspaceFolders || workspaceFolders.length === 0) {
        return;
    }

    for (const workspace of workspaceFolders) {
        if (path.fsPath.startsWith(workspace.uri.fsPath)) {
            // use path instead of fsPath so glob patterns is consistent with slashes
            const relative = path.path.slice(workspace.uri.path.length);
            return relative.startsWith('/') ? relative.slice(1) : relative;
        }
    }
    return;
}
