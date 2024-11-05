import * as vscode from 'vscode';

import type { IConfiguration } from '../types/Configuration';
import { getExcludes, updateConfigurationAsync, updateExcludes } from '../utils/configUtils';
import { createExcludeList, getRelativePath } from '../utils/pathUtils';
import { vsCodeCommands } from './commands';
import { CONTEXT_IS_SCOPED } from './constants';
import { getFileGitStatus } from '../utils/gitUtils';
import { skipAsync } from './skipWorktree';
import { Status } from '../types/git.d';

const workspaceFolders = vscode.workspace.workspaceFolders;

function setContextScope(isScoped: boolean) {
    vscode.commands.executeCommand(vsCodeCommands.SetContext, CONTEXT_IS_SCOPED, isScoped);
}

export function initScope(config: IConfiguration) {
    setContextScope(!!config.scope.activeScope);
}

async function skipUserSettingsChanges(configDirUri: vscode.Uri, isSkip: boolean = true) {
    var userSettingsPath = vscode.Uri.joinPath(configDirUri, 'settings.json');
    var userSettingsStatus = getFileGitStatus(userSettingsPath);
    let isUserSettingsModified =
        userSettingsStatus === Status.MODIFIED || userSettingsStatus === Status.UNTRACKED;
    if (!isUserSettingsModified) {
        await skipAsync(isSkip, userSettingsPath);
    }
}

export async function scopeToThis(
    path: vscode.Uri,
    config: IConfiguration,
    configDirUri: vscode.Uri,
) {
    if (!workspaceFolders || workspaceFolders.length === 0) {
        return;
    }
    try {
        const relative = getRelativePath(path, workspaceFolders);
        const excludesConfig = getExcludes();
        if (excludesConfig && relative) {
            await skipUserSettingsChanges(configDirUri, true);
            const paths = createExcludeList(relative);
            paths.forEach((p) => (excludesConfig[p] = true));
            config.scope.activeScope = relative;
            config.scope.excludePaths = paths;
            await updateConfigurationAsync(config, configDirUri);
            await updateExcludes(excludesConfig, config);
            setContextScope(true);
        } else {
            vscode.window.showErrorMessage('Error in reading vscode settings.');
        }
    } catch (error: any) {
        vscode.window.showErrorMessage(error.message || error);
    }
}

export async function clearScope(config: IConfiguration, configDirUri: vscode.Uri) {
    if (!workspaceFolders || workspaceFolders.length === 0) {
        return;
    }
    try {
        if (!config.scope.activeScope) {
            return;
        }
        const excludesConfig = getExcludes();
        if (excludesConfig) {
            await skipUserSettingsChanges(configDirUri, false);
            const paths = config.scope.excludePaths;
            paths.forEach((path) => {
                if (excludesConfig.hasOwnProperty(path)) {
                    // can't use delete or it will throw error, because of proxy object
                    excludesConfig[path] = undefined;
                }
            });
            await updateExcludes(excludesConfig, config);
            config.scope.activeScope = undefined;
            config.scope.excludePaths = [];
            await updateConfigurationAsync(config, configDirUri);
            setContextScope(false);
        } else {
            vscode.window.showErrorMessage('Error in reading vscode settings.');
        }
    } catch (error: any) {
        vscode.window.showErrorMessage(error.message || error);
    }
}
