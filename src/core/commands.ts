import * as vscode from 'vscode';

import type { DirectoryProvider } from '../provider/DirectoryProvider';
import type { IConfiguration } from '../types/Configuration';
import type { FileSystemObject } from '../types/FileSystemObject';
import { EXTENSION_NAME } from './constants';
import { clearScope, scopeToThis } from './scope';
import { vscodeCommands } from '../utils/vscodeCommands';

export enum ExtensionCommands {
    SelectItem = `${EXTENSION_NAME}.selectItem`,
    OpenItem = `${EXTENSION_NAME}.openItem`,
    RefreshEntry = `${EXTENSION_NAME}.refreshEntry`,
    CantRemoveItem = `${EXTENSION_NAME}.cantRemoveItem`,
    RemoveItem = `${EXTENSION_NAME}.removeItem`,
    RemoveAllItems = `${EXTENSION_NAME}.removeAllItems`,
    RenameItem = `${EXTENSION_NAME}.renameItem`,
    FocusInExplorer = `${EXTENSION_NAME}.focusInExplorer`,
    ClearFocusScope = `${EXTENSION_NAME}.clearFocusScope`,
}

export function registerCommands(
    context: vscode.ExtensionContext,
    directoryProvider: DirectoryProvider,
    config: IConfiguration,
    configDirUri: vscode.Uri,
) {
    context.subscriptions.push(
        registerRefreshEntryCommand(directoryProvider),
        registerOpenItemCommand(),
        registerSelectItemCommand(directoryProvider),
        registerRemoveItemCommand(directoryProvider),
        registerRenameItemCommand(directoryProvider),
        registerCantRemoveItemCommand(),
        registerRemoveAllItemsCommand(directoryProvider),
        registerFocusInExplorerCommand(config, configDirUri),
        registerClearFocusScopeCommand(config, configDirUri),
    );
}

function registerRefreshEntryCommand(directoryProvider: DirectoryProvider) {
    return vscode.commands.registerCommand(ExtensionCommands.RefreshEntry, () =>
        directoryProvider.refresh(),
    );
}

function registerOpenItemCommand() {
    return vscode.commands.registerCommand(ExtensionCommands.OpenItem, (file) => {
        vscode.commands.executeCommand(
            vscodeCommands.Open,
            vscode.Uri.parse(file.resourceUri.path),
        );
    });
}

function registerSelectItemCommand(directoryProvider: DirectoryProvider) {
    return vscode.commands.registerCommand(
        ExtensionCommands.SelectItem,
        async (args) => await directoryProvider.selectItemAsync(vscode.Uri.parse(args.path)),
    );
}

function registerRemoveItemCommand(directoryProvider: DirectoryProvider) {
    return vscode.commands.registerCommand(ExtensionCommands.RemoveItem, async (args) => {
        await directoryProvider.removeItemAsync(args.resourceUri);
    });
}

function registerRenameItemCommand(directoryProvider: DirectoryProvider) {
    return vscode.commands.registerCommand(ExtensionCommands.RenameItem, async (args) => {
        await directoryProvider.renameItemAsync(args);
    });
}

function registerCantRemoveItemCommand() {
    return vscode.commands.registerCommand(ExtensionCommands.CantRemoveItem, () => {
        vscode.window.showInformationMessage(
            'You can only remove items that were directly added to the view',
        );
    });
}

function registerRemoveAllItemsCommand(directoryProvider: DirectoryProvider) {
    return vscode.commands.registerCommand(
        ExtensionCommands.RemoveAllItems,
        async () => await directoryProvider.removeAllItemsAsync(),
    );
}

function registerFocusInExplorerCommand(config: IConfiguration, configDirUri: vscode.Uri) {
    return vscode.commands.registerCommand(
        ExtensionCommands.FocusInExplorer,
        async (element: FileSystemObject) => {
            const path = element.resourceUri;
            if (!path) {
                vscode.window.showInformationMessage(
                    'Use this command from the Explorer context menu.',
                );
                return;
            }
            await clearScope(config, configDirUri);
            await scopeToThis(path, config, configDirUri);
        },
    );
}

function registerClearFocusScopeCommand(config: IConfiguration, configDirUri: vscode.Uri) {
    return vscode.commands.registerCommand(ExtensionCommands.ClearFocusScope, async () => {
        await clearScope(config, configDirUri);
    });
}
