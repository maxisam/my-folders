import * as vscode from 'vscode';

import type { IConfiguration } from '../types/Configuration';
import type { FileSystemObject } from '../types/FileSystemObject';
import type { ITypedDirectory } from '../types/TypedDirectory';
import { getConfigurationAsync, updateConfigurationAsync } from '../utils/configUtils';
import { buildTypedDirectory, createFileSystemObject, focusFileExplorer } from '../utils/utils';

export class DirectoryOperator {
    private bookmarkedDirectories: ITypedDirectory[] = [];
    private hideContent: boolean = false;

    constructor(
        private extensionContext: vscode.ExtensionContext,
        private config: IConfiguration,
        private configDirUri: vscode.Uri,
    ) {
        this.hydrateState();
    }

    public async renameItemAsync(element: FileSystemObject, value: string) {
        if (!value) {
            return;
        }
        const index = this.bookmarkedDirectories.findIndex(
            (item) => item.path === element.resourceUri.path,
        );

        if (index > -1) {
            this.bookmarkedDirectories[index].name = value;
            this.bookmarkedDirectories.sort((a, b) => a.name.localeCompare(b.name));
            await this.saveBookmarksAsync();
        }
    }

    public async getChildren(element?: FileSystemObject): Promise<FileSystemObject[]> {
        if (element) {
            if (this.hideContent) {
                focusFileExplorer(element.resourceUri);
                return [];
            } else {
                return this.directorySearch(element.resourceUri);
            }
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
        if (!uri) {
            return;
        }

        const index = this.bookmarkedDirectories.findIndex((dir) => dir.path === uri.path);
        if (index !== -1) {
            this.bookmarkedDirectories.splice(index, 1);
            await this.saveBookmarksAsync();
        }
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
                return createFileSystemObject(
                    name,
                    type,
                    vscode.Uri.file(`${uri.path}/${name}`),
                    this.hideContent,
                );
            });
    }

    private async createEntries(bookmarkedDirectories: ITypedDirectory[]) {
        const fileSystem: FileSystemObject[] = [];
        for (const dir of bookmarkedDirectories) {
            const { path: filePath, type: type, name: folderName } = dir;
            const fileUri = vscode.Uri.file(filePath);
            fileSystem.push(
                createFileSystemObject(folderName, type, fileUri, this.hideContent, true),
            );
        }
        return fileSystem;
    }

    private hydrateState() {
        if (this.config.bookmarkedDirectories) {
            this.bookmarkedDirectories = this.config.bookmarkedDirectories;
        }
        this.hideContent = this.config.hideContent;
    }

    private async saveBookmarksAsync() {
        // in case users running 2 instances of the vscode.
        const config = await getConfigurationAsync(this.configDirUri);
        config.bookmarkedDirectories = this.bookmarkedDirectories;
        await updateConfigurationAsync(this.config, this.configDirUri);
    }
}
