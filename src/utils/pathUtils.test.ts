import * as vscode from 'vscode';
import { getRelativePath } from './pathUtils';
import { createExcludeList } from './pathUtils';
import { extractFilePaths } from './pathUtils';

describe('getRelativePath', () => {
    const workspaceFolders: vscode.WorkspaceFolder[] = [
        { uri: vscode.Uri.file('c:/workspace/folder1'), name: 'folder1', index: 0 },
        { uri: vscode.Uri.file('c:/workspace/folder2'), name: 'folder2', index: 1 },
    ];

    it('should return the relative path within a workspace folder', () => {
        const path = vscode.Uri.file('c:/workspace/folder1/subfolder/file.txt');
        const relativePath = getRelativePath(path, workspaceFolders);

        expect(relativePath).toBe('subfolder/file.txt');
    });

    it('should return undefined if path is outside all workspace folders', () => {
        const path = vscode.Uri.file('c:/outside/folder/file.txt');
        const relativePath = getRelativePath(path, workspaceFolders);

        expect(relativePath).toBeUndefined();
    });

    it('should return undefined if no workspace folders are defined', () => {
        const path = vscode.Uri.file('c:/workspace/folder1/subfolder/file.txt');
        const relativePath = getRelativePath(path, []);

        expect(relativePath).toBeUndefined();
    });
});

describe('createExcludeList', () => {
    it('should generate exclude patterns for a simple path', () => {
        const path = 'aa/bb/cc';
        const expected = [
            '[!a]*/**',
            'a[!a]*/**',
            'aa/[!b]*/**',
            'aa/b[!b]*/**',
            'aa/bb/[!c]*/**',
            'aa/bb/c[!c]*/**',
        ];

        const result = createExcludeList(path);
        expect(result).toEqual(expected);
    });

    it('should generate exclude patterns for a single directory', () => {
        const path = 'folder';
        const expected = [
            '[!f]*/**',
            'f[!o]*/**',
            'fo[!l]*/**',
            'fol[!d]*/**',
            'fold[!e]*/**',
            'folde[!r]*/**',
        ];

        const result = createExcludeList(path);
        expect(result).toEqual(expected);
    });

    it('should handle an empty path', () => {
        const path = '';
        const expected: string[] = [];

        const result = createExcludeList(path);
        expect(result).toEqual(expected);
    });

    it('should handle paths with trailing slashes', () => {
        const path = 'foo/bar/';
        const expected = [
            '[!f]*/**',
            'f[!o]*/**',
            'fo[!o]*/**',
            'foo/[!b]*/**',
            'foo/b[!a]*/**',
            'foo/ba[!r]*/**',
        ];

        const result = createExcludeList(path);
        expect(result).toEqual(expected);
    });

    it('should handle paths with consecutive slashes', () => {
        const path = 'a//b///c';
        const expected = ['[!a]*/**', 'a/[!b]*/**', 'a/b/[!c]*/**'];

        const result = createExcludeList(path);
        expect(result).toEqual(expected);
    });
});

describe('extractFilePaths Function', () => {
    beforeEach(() => {
        // Clear all mock instances and calls between tests
        jest.clearAllMocks();
    });

    it('should handle a single vscode.Uri', () => {
        const uri = vscode.Uri.file('c:/workspace/folder1/subfolder/file.txt');
        const result = extractFilePaths(uri);

        expect(result).toEqual([uri.fsPath]);
    });

    it('should handle an array of vscode.Uri objects', () => {
        const uris = [
            vscode.Uri.file('c:/workspace/folder1/file1.txt'),
            vscode.Uri.file('c:/workspace/folder1/file2.txt'),
        ];
        const result = extractFilePaths(uris);

        expect(result).toEqual([uris[0].fsPath, uris[1].fsPath]);
    });

    it('should handle an array of objects containing resourceUri', () => {
        const items = [
            { resourceUri: vscode.Uri.file('c:/workspace/folder2/fileA.txt') },
            { resourceUri: vscode.Uri.file('c:/workspace/folder2/fileB.txt') },
        ];
        const result = extractFilePaths(items);

        expect(result).toEqual([items[0].resourceUri.fsPath, items[1].resourceUri.fsPath]);
    });

    it('should handle an array of strings', () => {
        const paths = [
            'C:/workspace/folder1/subfolder/file1.txt',
            'C:/workspace/folder2/subfolder/file2.txt',
        ];
        const result = extractFilePaths(paths);

        expect(result).toEqual(paths);
    });

    it('should handle null and undefined values gracefully', () => {
        const uris = [
            vscode.Uri.file('c:/workspace/folder4/file1.txt'),
            null,
            undefined,
            vscode.Uri.file('c:/workspace/folder4/file2.txt'),
        ];
        const result = extractFilePaths(uris);

        expect(result).toEqual([uris[0]?.fsPath, uris[3]?.fsPath]);
    });
});
