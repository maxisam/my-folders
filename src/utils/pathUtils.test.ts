import * as vscode from 'vscode';
import { getRelativePath } from './pathUtils';
import { createExcludeList } from './pathUtils';

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
