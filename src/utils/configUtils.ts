import { Buffer } from 'buffer';

import * as vscode from 'vscode';

import { CONFIG_FILE_NAME } from '../core/constants';
import type { ExcludeObject, IConfiguration } from '../types/Configuration';
import { defaultConfiguration } from '../types/Configuration';

const workspaceFolders = vscode.workspace.workspaceFolders;

export async function updateConfigurationAsync(config: IConfiguration, configDirUri: vscode.Uri) {
    try {
        await vscode.workspace.fs.stat(configDirUri);
    } catch {
        await vscode.workspace.fs.createDirectory(configDirUri);
    }
    const configUri = vscode.Uri.joinPath(configDirUri, CONFIG_FILE_NAME);
    const configData = Buffer.from(JSON.stringify(config, null, 4), 'utf8');
    await vscode.workspace.fs.writeFile(configUri, configData);
}
export function getConfigurationDirUri(
    workspaceRoot: readonly vscode.WorkspaceFolder[] | undefined,
): vscode.Uri {
    const workspaceRootPath = workspaceRoot ? workspaceRoot[0].uri : vscode.Uri.file('');
    return vscode.Uri.joinPath(workspaceRootPath, '.vscode');
}

export async function getConfigurationAsync(configDirUri: vscode.Uri): Promise<IConfiguration> {
    const configPath = vscode.Uri.joinPath(configDirUri, CONFIG_FILE_NAME);
    try {
        const configData = await vscode.workspace.fs.readFile(configPath);
        const origConfig = JSON.parse(configData.toString());
        return { ...defaultConfiguration, ...origConfig };
    } catch {
        return defaultConfiguration;
    }
}

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
