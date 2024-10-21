import * as vscode from 'vscode';

import { DirectoryProviderCommands, vsCodeCommands } from './commands/CrudCommands';
import { DirectoryWorker } from './operator/DirectoryWorker';
import { DirectoryProvider } from './provider/DirectoryProvider';

export function activate(context: vscode.ExtensionContext) {
    const directoryOperator = new DirectoryWorker(context, vscode.workspace.workspaceFolders);

    const directoryProvider = new DirectoryProvider(directoryOperator);

    vscode.window.registerTreeDataProvider('my-folders', directoryProvider);

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
        vscode.commands.registerCommand(DirectoryProviderCommands.SelectItem, (args) =>
            directoryProvider.selectItem(vscode.Uri.parse(args.path)),
        ),
        vscode.commands.registerCommand(DirectoryProviderCommands.RemoveItem, (args) => {
            directoryProvider.removeItem(args.resourceUri);
        }),
        vscode.commands.registerCommand(DirectoryProviderCommands.RenameItem, (args) => {
            directoryProvider.renameItem(args);
        }),
        vscode.commands.registerCommand(DirectoryProviderCommands.CantRemoveItem, () => {
            vscode.window.showInformationMessage(
                'You can only remove items that were directly added to the view',
            );
        }),
        vscode.commands.registerCommand(DirectoryProviderCommands.RemoveAllItems, () =>
            directoryProvider.removeAllItems(),
        ),
    );
}

export function deactivate() {}
