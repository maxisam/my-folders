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

export function createExcludeList(path: string) {
    const excludes: string[] = [];

    const dirs = path.split('/').filter(Boolean); // Handle consecutive slashes
    dirs.forEach((dir, dirI) => {
        const dirsSoFar = dirs.slice(0, dirI).join('/') + (dirI > 0 ? '/' : '');
        for (let i = 0; i < dir.length; i++) {
            excludes.push(`${dirsSoFar}${dir.slice(0, i)}[!${dir[i]}]*/**`);
        }
    });

    return excludes;
}
