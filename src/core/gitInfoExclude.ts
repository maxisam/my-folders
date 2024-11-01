import * as vscode from 'vscode';
import * as path from 'path';
import { getGitApi, refreshVsCodeGit } from '../utils/gitUtils';

const workspaceFolders = vscode.workspace.workspaceFolders;
const GIT_INFO_EXCLUDE_PATH = path.join('.git', 'info', 'exclude');
const EXCLUDE_CONFIG_PATTERN = '**/.vscode/my-folders.json';
let isGitInfoExcludeInitialized = false;
export async function initGitInfoExclude() {
    if (!workspaceFolders || workspaceFolders.length === 0) {
        return;
    }
    const gitApi = getGitApi();
    gitApi.onDidOpenRepository(async (repo) => {
        if (!gitApi.repositories.length) {
            return;
        }
        if (!isGitInfoExcludeInitialized) {
            isGitInfoExcludeInitialized = true;
            const gitRepoRoots = gitApi.repositories.map((repo) => repo.rootUri.fsPath);
            await updateGitInfoExclude(gitRepoRoots, workspaceFolders);
        }
    });
}

async function updateGitInfoExclude(
    gitRepoRoots: string[],
    workspaceFolders: readonly vscode.WorkspaceFolder[],
) {
    let isRefreshRequired = false;
    for (const workspace of workspaceFolders) {
        if (workspace.uri.fsPath) {
            const repoUri = gitRepoRoots.find((repoRoot) =>
                workspace.uri.fsPath.startsWith(repoRoot),
            );
            if (!repoUri) {
                continue;
            }
            const gitLocalExcludePath = path.join(repoUri, GIT_INFO_EXCLUDE_PATH);
            try {
                // check if .git/info/exclude file exists
                await vscode.workspace.fs.stat(vscode.Uri.file(gitLocalExcludePath));
                // append **/.vscode/my-folders.json to .git/info/exclude file
                const data = (
                    await vscode.workspace.fs.readFile(vscode.Uri.file(gitLocalExcludePath))
                ).toString();
                const patternExists = data
                    .split(/\r?\n/)
                    .some((line) => line.trim() === EXCLUDE_CONFIG_PATTERN);
                if (patternExists) {
                    continue;
                }
                const content = Buffer.from(data + `\n${EXCLUDE_CONFIG_PATTERN}`, 'utf8');
                await vscode.workspace.fs.writeFile(vscode.Uri.file(gitLocalExcludePath), content);
                isRefreshRequired = true;
            } catch {
                // create .git/info/exclude file and append **/.vscode/my-folders.json
                await vscode.workspace.fs.writeFile(
                    vscode.Uri.file(gitLocalExcludePath),
                    Buffer.from(`# exclude file\n${EXCLUDE_CONFIG_PATTERN} \n`, 'utf8'),
                );
            }
        }
    }
    if (isRefreshRequired) {
        refreshVsCodeGit();
    }
}
