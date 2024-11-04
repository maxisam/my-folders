import * as vscode from 'vscode';
import { getRelativePath } from './pathUtils';

describe('getRelativePath', () => {
    const workspaceFolders: vscode.WorkspaceFolder[] = [
        { uri: vscode.Uri.file('C:\\workspace\\folder1'), name: 'folder1', index: 0 },
        { uri: vscode.Uri.file('C:\\workspace\\folder2'), name: 'folder2', index: 1 },
    ];

    it('should return the relative path within a workspace folder', () => {
        const path = vscode.Uri.file('C:\\workspace\\folder1\\subfolder\\file.txt');
        const relativePath = getRelativePath(path, workspaceFolders);

        expect(relativePath).toBe('subfolder/file.txt');
    });

    it('should return undefined if path is outside all workspace folders', () => {
        const path = vscode.Uri.file('C:\\outside\\folder\\file.txt');
        const relativePath = getRelativePath(path, workspaceFolders);

        expect(relativePath).toBeUndefined();
    });

    it('should return undefined if no workspace folders are defined', () => {
        const path = vscode.Uri.file('C:\\workspace\\folder1\\subfolder\\file.txt');
        const relativePath = getRelativePath(path, []);

        expect(relativePath).toBeUndefined();
    });
});
