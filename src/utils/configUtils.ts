import * as vscode from 'vscode';

import type { ExcludeObject, IConfiguration } from '../types/Configuration';

const workspaceFolders = vscode.workspace.workspaceFolders;

export function getExcludes() {
    if (!workspaceFolders || workspaceFolders.length === 0) {
        return;
    }

    try {
        const config = vscode.workspace.getConfiguration('files', null);
        return config.get<ExcludeObject>('exclude', {});
    } catch (error: any) {
        vscode.window.showErrorMessage(error.message || error);
        return;
    }
}

export async function updateExcludes(excludes: ExcludeObject, config: IConfiguration) {
    if (!workspaceFolders || workspaceFolders.length === 0) {
        return;
    }
    if (!config.privateSettingsPath || config.privateSettingsPath === '.vscode/settings.json') {
        try {
            const config = vscode.workspace.getConfiguration('files', null);
            const target = vscode.ConfigurationTarget.Workspace || null;
            return await config.update('exclude', excludes, target);
        } catch (error: any) {
            vscode.window.showErrorMessage(error.message || error);
        }
    } else {
        // not implemented
    }
}

export function createExcludeList(path: string) {
    const excludes: string[] = [];

    const dirs = path.split('/');
    dirs.forEach((dir, dirI) => {
        const dirsSoFar = dirs.slice(0, dirI).join('/') + (dirI > 0 ? '/' : '');
        for (let i = 0; i < dir.length; i++) {
            excludes.push(`${dirsSoFar}${dir.slice(0, i)}[!${dir[i]}]*/**`);
        }
    });

    return excludes;
}
