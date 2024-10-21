import * as vscode from 'vscode';

import { FileSystemObject } from '../types/FileSystemObject';
import type { TypedDirectory } from '../types/TypedDirectory';
import { buildTypedDirectory } from '../types/TypedDirectory';

export class DirectoryWorker {
    readonly vsCodeExtensionConfigurationKey: string = 'my-folders';
    readonly saveWorkspaceConfigurationSettingKey: string = 'saveWorkspace';
    readonly storedBookmarksContextKey: string = 'storedBookmarks';
    readonly bookmarkedDirectoryContextValue: string = 'directlyBookmarkedDirectory';

    private bookmarkedDirectories: TypedDirectory[] = [];
    private saveWorkspaceSetting: boolean | undefined = false;

    constructor(
        private extensionContext: vscode.ExtensionContext,
        private workspaceRoot: readonly vscode.WorkspaceFolder[] | undefined,
    ) {
        this.hydrateState();
    }

    public async getChildren(element?: FileSystemObject): Promise<FileSystemObject[]> {
        if (element) {
            return this.directorySearch(element.resourceUri);
        } else {
            return this.bookmarkedDirectories.length > 0
                ? this.createEntries(this.bookmarkedDirectories)
                : Promise.resolve([]);
        }
    }

    public async selectItem(uri: vscode.Uri | undefined, name?: string | undefined) {
        if (uri) {
            this.bookmarkedDirectories.push(await buildTypedDirectory(uri, name));
        }
        this.saveBookmarks();
    }

    public async removeItem(uri: vscode.Uri | undefined) {
        if (uri) {
            const typedDirectory = await buildTypedDirectory(uri);
            const index = this.bookmarkedDirectories
                .map((e) => e.path)
                .indexOf(typedDirectory.path);
            if (index > -1) {
                this.bookmarkedDirectories.splice(index, 1);
            }
        }
        this.saveBookmarks();
    }

    public removeAllItems() {
        this.bookmarkedDirectories = [];
        this.saveBookmarks();
    }

    private async directorySearch(uri: vscode.Uri) {
        const entries = await vscode.workspace.fs.readDirectory(uri);
        return entries
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map((item) => {
                const [name, type] = item;
                const isDirectory =
                    type === vscode.FileType.Directory
                        ? vscode.TreeItemCollapsibleState.Collapsed
                        : vscode.TreeItemCollapsibleState.None;

                return new FileSystemObject(
                    name,
                    isDirectory,
                    vscode.Uri.file(`${uri.path}/${name}`),
                );
            });
    }

    private async createEntries(bookmarkedDirectories: TypedDirectory[]) {
        const fileSystem: FileSystemObject[] = [];

        for (const dir of bookmarkedDirectories) {
            const { path: filePath, type: type, name: folderName } = dir;
            const file = vscode.Uri.file(filePath);

            fileSystem.push(
                new FileSystemObject(
                    `${folderName}`,
                    type === vscode.FileType.File
                        ? vscode.TreeItemCollapsibleState.None
                        : vscode.TreeItemCollapsibleState.Collapsed,
                    file,
                ).setContextValue(this.bookmarkedDirectoryContextValue),
            );
        }

        return fileSystem;
    }

    private hydrateState(): void {
        this.saveWorkspaceSetting = vscode.workspace
            .getConfiguration(this.saveWorkspaceConfigurationSettingKey)
            .get(this.saveWorkspaceConfigurationSettingKey);
        this.bookmarkedDirectories =
            (this.workspaceRoot
                ? this.extensionContext.workspaceState.get(this.storedBookmarksContextKey)
                : this.extensionContext.globalState.get(this.storedBookmarksContextKey)) || [];
    }

    private saveBookmarks() {
        if (this.workspaceRoot) {
            this.extensionContext.workspaceState.update(
                this.storedBookmarksContextKey,
                this.bookmarkedDirectories,
            );
        } else {
            this.extensionContext.globalState.update(
                this.storedBookmarksContextKey,
                this.bookmarkedDirectories,
            );
        }
    }
}
