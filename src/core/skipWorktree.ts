import * as path from 'path';

import { gitExec, refreshVsCodeGit } from '../utils/gitUtils';
import { extractFilePaths } from '../utils/pathUtils';

const GIT_SKIP_WORKTREE = '--skip-worktree';
const GIT_NO_SKIP_WORKTREE = '--no-skip-worktree';

export async function skipAsync(isSkip: boolean, ...args: any[]): Promise<void> {
    const flag = isSkip ? GIT_SKIP_WORKTREE : GIT_NO_SKIP_WORKTREE;
    const files = extractFilePaths(...args);

    const promises = files.map((file) => {
        const repoPath = path.dirname(file);
        return gitExec(repoPath, ['update-index', flag, file]);
    });

    await Promise.all(promises);
    refreshVsCodeGit();
}
