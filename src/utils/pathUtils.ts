import * as vscode from 'vscode';

export function getRelativePath(
    path: vscode.Uri,
    workspaceFolders: readonly vscode.WorkspaceFolder[],
) {
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

export function extractFsPaths(...args: any[]): string[] {
    const files: any[] = getArray(args);
    if (files[0] instanceof vscode.Uri || (files[0] instanceof Object && files[0].fsPath)) {
        return files.filter((f) => !!f).map((f) => f.fsPath);
    } else if (files[0] instanceof Object && files[0].resourceUri) {
        return files.map((f) => f.resourceUri.fsPath);
    } else if (typeof files[0] === 'string') {
        return files;
    } else {
        vscode.window.showErrorMessage(`Unknown arg type: ${typeof files[0]}`);
        throw new Error(`Unknown arg type: ${typeof files[0]}`);
    }
}

export function extractPaths(...args: any[]): string[] {
    const files: any[] = getArray(args);
    if (files[0] instanceof vscode.Uri || (files[0] instanceof Object && files[0].path)) {
        return files.filter((f) => !!f).map((f) => f.path);
    } else if (files[0] instanceof Object && files[0].resourceUri) {
        return files.map((f) => f.resourceUri.path);
    } else if (typeof files[0] === 'string') {
        return files;
    } else {
        vscode.window.showErrorMessage(`Unknown arg type: ${typeof files[0]}`);
        throw new Error(`Unknown arg type: ${typeof files[0]}`);
    }
}

function getArray(args: any[]) {
    if (args.length > 1 && Array.isArray(args[1])) {
        return args[1];
    } else if (Array.isArray(args[0])) {
        return args[0];
    } else {
        return [args[0]];
    }
}
