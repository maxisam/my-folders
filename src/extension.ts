import * as vscode from 'vscode';

import { ExtensionCommands, vsCodeCommands } from './commands/CrudCommands';
import { REGISTER_TREE_DATA_PROVIDER } from './constants';
import { DirectoryWorker } from './operator/DirectoryWorker';
import { DirectoryProvider } from './provider/DirectoryProvider';

export async function activate(context: vscode.ExtensionContext) {
    const directoryOperator = new DirectoryWorker(context, vscode.workspace.workspaceFolders);
    await directoryOperator.initAsync();
    const directoryProvider = new DirectoryProvider(directoryOperator);
    vscode.window.registerTreeDataProvider(REGISTER_TREE_DATA_PROVIDER, directoryProvider);

    context.subscriptions.push(
        vscode.commands.registerCommand(ExtensionCommands.RefreshEntry, () =>
            directoryProvider.refresh(),
        ),
        vscode.commands.registerCommand(ExtensionCommands.OpenItem, (file) => {
            vscode.commands.executeCommand(
                vsCodeCommands.Open,
                vscode.Uri.parse(file.resourceUri.path),
            );
        }),
        vscode.commands.registerCommand(
            ExtensionCommands.SelectItem,
            async (args) => await directoryProvider.selectItemAsync(vscode.Uri.parse(args.path)),
        ),
        vscode.commands.registerCommand(ExtensionCommands.RemoveItem, async (args) => {
            await directoryProvider.removeItemAsync(args.resourceUri);
        }),
        vscode.commands.registerCommand(ExtensionCommands.RenameItem, async (args) => {
            await directoryProvider.renameItemAsync(args);
        }),
        vscode.commands.registerCommand(ExtensionCommands.CantRemoveItem, () => {
            vscode.window.showInformationMessage(
                'You can only remove items that were directly added to the view',
            );
        }),
        vscode.commands.registerCommand(
            ExtensionCommands.RemoveAllItems,
            async () => await directoryProvider.removeAllItemsAsync(),
        ),
    );
}

export function deactivate() {}
