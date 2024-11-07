import * as path from 'path';

import * as vscode from 'vscode';

import { gitExec, refreshVsCodeGit } from '../utils/gitUtils';
import { IConfiguration } from '../types/Configuration';
import { extractFsPaths, extractPaths } from '../utils/pathUtils';

const GIT_SKIP_WORKTREE = '--skip-worktree';
const GIT_NO_SKIP_WORKTREE = '--no-skip-worktree';

export async function skipAsync(
    isSkip: boolean,
    fileUris: vscode.Uri[],
    config: IConfiguration,
): Promise<void> {
    const fsPaths = extractFsPaths(fileUris);
    const paths = extractPaths(fileUris);
    await gitSkipWorktreeAsync(isSkip, fsPaths);
    // use path instead of fsPath, since \\ will be converted to / during the json serialization
    if (isSkip) {
        config.gitSkipWorktreeFiles.push(...paths);
    } else {
        config.gitSkipWorktreeFiles = config.gitSkipWorktreeFiles.filter((f) => !paths.includes(f));
    }
}

export async function gitSkipWorktreeAsync(isSkip: boolean, fsFilePaths: string[]): Promise<void> {
    const flag = isSkip ? GIT_SKIP_WORKTREE : GIT_NO_SKIP_WORKTREE;
    const promises = fsFilePaths.map((file) => {
        const repoPath = path.dirname(file);
        return gitExec(repoPath, ['update-index', flag, file]);
    });
    await Promise.all(promises);
    refreshVsCodeGit();
}
