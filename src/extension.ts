import * as vscode from 'vscode';

import { registerCommands } from './core/commands';
import { REGISTER_TREE_DATA_PROVIDER } from './core/constants';
import { DirectoryOperator } from './core/DirectoryOperator';
import { initScope } from './core/scope';
import { DirectoryProvider } from './provider/DirectoryProvider';
import { getConfigurationAsync, getConfigurationDirUri } from './utils/configUtils';

export async function activate(context: vscode.ExtensionContext) {
    const configDirUri = getConfigurationDirUri(vscode.workspace.workspaceFolders);
    const config = await getConfigurationAsync(configDirUri);
    initScope(config);
    const directoryOperator = new DirectoryOperator(context, config, configDirUri);
    const directoryProvider = new DirectoryProvider(directoryOperator);
    vscode.window.registerTreeDataProvider(REGISTER_TREE_DATA_PROVIDER, directoryProvider);
    registerCommands(context, directoryProvider, config, configDirUri);
}

export function deactivate() {}
