import * as vscode from 'vscode';

import { FileSystemObject } from '../types/FileSystemObject';
import type { TypedDirectory } from '../types/TypedDirectory';
import { buildTypedDirectory, getConfigurationAsync, updateConfigurationAsync } from '../utils';

export class DirectoryWorker {
    readonly bookmarkedDirectoryContextValue: string = 'directlyBookmarkedDirectory';
    private bookmarkedDirectories: TypedDirectory[] = [];
    configDirUri: vscode.Uri;

    constructor(
        private extensionContext: vscode.ExtensionContext,
        private workspaceRoot: readonly vscode.WorkspaceFolder[] | undefined,
    ) {
        const workspaceRootPath = this.workspaceRoot
            ? this.workspaceRoot[0].uri
            : vscode.Uri.file('');
        this.configDirUri = vscode.Uri.joinPath(workspaceRootPath, '.vscode');
    }

    public async initAsync() {
        await this.hydrateStateAsync();
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

    public async selectItemAsync(uri: vscode.Uri | undefined, name?: string | undefined) {
        if (uri) {
            this.bookmarkedDirectories.push(await buildTypedDirectory(uri, name));
            // sort the bookmarks by name
            this.bookmarkedDirectories.sort((a, b) => a.name.localeCompare(b.name));
        }
        await this.saveBookmarksAsync();
    }

    public async removeItemAsync(uri: vscode.Uri | undefined) {
        if (uri) {
            const typedDirectory = await buildTypedDirectory(uri);
            const index = this.bookmarkedDirectories
                .map((e) => e.path)
                .indexOf(typedDirectory.path);
            if (index > -1) {
                this.bookmarkedDirectories.splice(index, 1);
            }
        }
        await this.saveBookmarksAsync();
    }

    public async removeAllItemsAsync() {
        this.bookmarkedDirectories = [];
        await this.saveBookmarksAsync();
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

    private async hydrateStateAsync(): Promise<void> {
        const config = await getConfigurationAsync(this.configDirUri);
        if (config.bookmarkedDirectories) {
            this.bookmarkedDirectories = config.bookmarkedDirectories;
        }
    }

    private async saveBookmarksAsync() {
        const config = await getConfigurationAsync(this.configDirUri);
        config.bookmarkedDirectories = this.bookmarkedDirectories;
        await updateConfigurationAsync(config, this.configDirUri);
    }
}
