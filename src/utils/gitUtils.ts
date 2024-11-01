import * as vscode from 'vscode';

import { vsCodeCommands } from '../core/commands';
import type { API as GitApi, GitExtension } from '../types/git';
import { checkNull, runCommand } from './utils';

export function getGitApi(): GitApi {
    const gitExtension = checkNull(
        vscode.extensions.getExtension<GitExtension>('vscode.git')?.exports,
        'Git extension not found !',
    );
    if (!gitExtension.enabled) {
        vscode.window.showErrorMessage('Git extension is disabled !');
        throw new Error('Git extension is disabled !');
    }
    const gitApi = checkNull(gitExtension.getAPI(1), 'Git API not found !');
    return gitApi;
}

export async function gitExec(repoPath: string, args: string[]): Promise<string> {
    const gitApi = getGitApi();
    const gitPath = checkNull(gitApi.git.path, 'Git path not found !');
    const repo = checkNull(gitApi.repositories, 'Git repositories not found !');
    const safeArgs = quoteArgsIfNeeded(args);
    return await runCommand(gitPath, safeArgs, repoPath);
}

function quoteArgsIfNeeded(args: string[]): string[] {
    return args.map((arg) => {
        if (arg.includes(' ')) {
            return `"${arg}"`;
        } else {
            return arg;
        }
    });
}

export function refreshVsCodeGit() {
    vscode.commands.executeCommand(vsCodeCommands.GitRefresh);
}
