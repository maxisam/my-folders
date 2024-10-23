import * as vscode from 'vscode';

import { DirectoryProviderCommands, vsCodeCommands } from './commands/CrudCommands';
import { REGISTER_TREE_DATA_PROVIDER } from './constants';
import { DirectoryWorker } from './operator/DirectoryWorker';
import { DirectoryProvider } from './provider/DirectoryProvider';

export async function activate(context: vscode.ExtensionContext) {
    const directoryOperator = new DirectoryWorker(context, vscode.workspace.workspaceFolders);
    await directoryOperator.initAsync();
    const directoryProvider = new DirectoryProvider(directoryOperator);
    vscode.window.registerTreeDataProvider(REGISTER_TREE_DATA_PROVIDER, directoryProvider);

    context.subscriptions.push(
        vscode.commands.registerCommand(DirectoryProviderCommands.RefreshEntry, () =>
            directoryProvider.refresh(),
        ),
        vscode.commands.registerCommand(DirectoryProviderCommands.OpenItem, (file) => {
            vscode.commands.executeCommand(
                vsCodeCommands.Open,
                vscode.Uri.parse(file.resourceUri.path),
            );
        }),
        vscode.commands.registerCommand(
            DirectoryProviderCommands.SelectItem,
            async (args) => await directoryProvider.selectItemAsync(vscode.Uri.parse(args.path)),
        ),
        vscode.commands.registerCommand(DirectoryProviderCommands.RemoveItem, async (args) => {
            await directoryProvider.removeItemAsync(args.resourceUri);
        }),
        vscode.commands.registerCommand(DirectoryProviderCommands.RenameItem, async (args) => {
            await directoryProvider.renameItemAsync(args);
        }),
        vscode.commands.registerCommand(DirectoryProviderCommands.CantRemoveItem, () => {
            vscode.window.showInformationMessage(
                'You can only remove items that were directly added to the view',
            );
        }),
        vscode.commands.registerCommand(
            DirectoryProviderCommands.RemoveAllItems,
            async () => await directoryProvider.removeAllItemsAsync(),
        ),
    );
}

export function deactivate() {}
