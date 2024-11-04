import * as vscode from 'vscode';

import type { IConfiguration } from '../types/Configuration';
import {
    createExcludeList,
    getExcludes,
    updateConfigurationAsync,
    updateExcludes,
} from '../utils/configUtils';
import { getRelativePath } from '../utils/pathUtils';
import { vsCodeCommands } from './commands';
import { CONTEXT_IS_SCOPED } from './constants';

const workspaceFolders = vscode.workspace.workspaceFolders;

function setContextScope(isScoped: boolean) {
    vscode.commands.executeCommand(vsCodeCommands.SetContext, CONTEXT_IS_SCOPED, isScoped);
}

export function initScope(config: IConfiguration) {
    setContextScope(!!config.activeScope);
}

export async function scopeToThis(
    path: vscode.Uri,
    config: IConfiguration,
    configDirUri: vscode.Uri,
) {
    try {
        const relative = getRelativePath(path, workspaceFolders);

        const excludes = getExcludes(workspaceFolders);

        if (excludes && relative) {
            const paths = createExcludeList(relative);

            paths.forEach((path) => (excludes[path] = true));

            await updateExcludes(excludes, config, workspaceFolders);

            config.activeScope = relative;
            await updateConfigurationAsync(config, configDirUri);
            setContextScope(true);
        } else {
            vscode.window.showErrorMessage('Error in reading vscode settings.');
        }
    } catch (error: any) {
        vscode.window.showErrorMessage(error.message || error);
    }
}

export async function clearScope(config: IConfiguration, configDirUri: vscode.Uri) {
    try {
        const scope = config.activeScope;
        if (scope) {
            const excludes = getExcludes();
            if (excludes) {
                const paths = createExcludeList(scope);

                paths.forEach((path) => {
                    if (path && excludes.hasOwnProperty(path)) {
                        excludes[path] = undefined;
                    }
                });

                await updateExcludes(excludes, config, workspaceFolders);

                config.activeScope = undefined;
                await updateConfigurationAsync(config, configDirUri);
                setContextScope(false);
            } else {
                vscode.window.showErrorMessage('Error in reading vscode settings.');
            }
        }
    } catch (error: any) {
        vscode.window.showErrorMessage(error.message || error);
    }
}
