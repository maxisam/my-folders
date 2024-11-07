import * as vscode from 'vscode';

import type { API as GitApi, GitExtension } from '../types/git';
import { checkNull, runCommand } from './utils';
import { vscodeCommands } from './vscodeCommands';

let _GitApi: GitApi | undefined = undefined;

export function getGitApi(): GitApi {
    if (_GitApi) {
        return _GitApi;
    }
    const gitExtension = checkNull(
        vscode.extensions.getExtension<GitExtension>('vscode.git')?.exports,
        'Git extension not found !',
    );
    if (!gitExtension.enabled) {
        vscode.window.showErrorMessage('Git extension is disabled !');
        throw new Error('Git extension is disabled !');
    }
    _GitApi = checkNull(gitExtension.getAPI(1), 'Git API not found !');
    return _GitApi;
}

export async function gitExec(repoPath: string, args: string[]): Promise<string> {
    const gitApi = getGitApi();
    const gitPath = checkNull(gitApi.git.path, 'Git path not found !');
    const repo = checkNull(gitApi.repositories, 'Git repositories not found !');
    const safeArgs = quoteArgsIfNeeded(args);
    return await runCommand(gitPath, safeArgs, repoPath);
}

export function getFileGitStatus(uri: vscode.Uri) {
    const gitApi = getGitApi();
    const repo = checkNull(gitApi.repositories, 'Git repositories not found !')[0];
    const file = repo.state.workingTreeChanges.find((file) => file.uri.fsPath === uri.fsPath);
    return file?.status;
}

function quoteArgsIfNeeded(args: string[]): string[] {
    return args.map((arg) => (arg.includes(' ') ? `"${arg}"` : arg));
}

export function refreshVsCodeGit() {
    vscode.commands.executeCommand(vscodeCommands.GitRefresh);
}
