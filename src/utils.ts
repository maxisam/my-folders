import { Buffer } from 'buffer';

import * as vscode from 'vscode';

import { configFileName as CONFIG_FILE_NAME } from './constants';
import type { IConfiguration } from './types/Configuration';
import { TypedDirectory } from './types/TypedDirectory';

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
        return JSON.parse(configData.toString());
    } catch {
        return { bookmarkedDirectories: [], hideContent: false };
    }
}

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

export async function buildTypedDirectory(uri: vscode.Uri, name?: string | undefined) {
    const type = (await vscode.workspace.fs.stat(uri)).type;
    return new TypedDirectory(uri.path, type, name);
}
