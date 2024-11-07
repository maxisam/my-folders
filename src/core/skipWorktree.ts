import * as path from 'path';

import * as vscode from 'vscode';

import { getGitApi, gitExec, refreshVsCodeGit } from '../utils/gitUtils';
import { IConfiguration } from '../types/Configuration';
import { extractFsPaths, extractPaths } from '../utils/pathUtils';
import { checkNull, getPlatform, Platform, runCommand } from '../utils/utils';
import { Repository } from '../types/git';

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

export async function listSkipWorktreeFilesAsync(isSkip: true) {
    const gitApi = getGitApi();
    const repos = checkNull(gitApi.repositories, 'Git repositories not found !');
    const platform = getPlatform();
    const command = getPlatformCommand(platform, isSkip);
    const allFiles: string[] = [];
    await Promise.all(repos.map(gatherWorktreeFiles(allFiles, command, isSkip)));
}

export function extractTrimmedLines(stdout: string, splitChar = '\n') {
    return stdout
        .split(splitChar)
        .filter((line) => line)
        .map((line) => line.substring(1).trim());
}

function getPlatformCommand(platform: Platform, isSkip: boolean) {
    const filter = isSkip ? '^S' : '^h';
    if (platform === 'linux' || platform === 'darwin') {
        return ['sh', '-c', `git ls-files -v --full-name | grep '${filter}'`];
    } else if (platform === 'win32') {
        return ['cmd.exe', '/c', `git ls-files -v --full-name | findstr "${filter}"`];
    } else {
        return [];
    }
}

function gatherWorktreeFiles(allFiles: string[], command: string[], isSkip: boolean) {
    return async (repo: Repository) => {
        const repoPath = repo.rootUri.fsPath;
        try {
            if (!command.length) {
                throw new Error('Unsupported platform');
            }
            const stdout = await runCommand(command[0], command.slice(1), repoPath);
            const files = extractTrimmedLines(stdout);
            allFiles.push(...files);
        } catch (err: any) {
            const files = await gatherWorktreeFilesFallBack(repoPath, isSkip ? 'S' : 'h');
            allFiles.push(...files);
        }
        return allFiles;
    };
}

async function gatherWorktreeFilesFallBack(repoPath: string, filter: string) {
    const stdout = await gitExec(repoPath, ['ls-files', '-v', '-z', '--full-name']);
    const files = stdout
        .split('\0')
        .filter((file) => file.startsWith(filter))
        .map((file) => file.substring(1).trim());
    return files;
}
