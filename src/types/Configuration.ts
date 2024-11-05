import { DEFAULT_WS_SETTING_PATH } from '../core/constants';
import type { ITypedDirectory } from './TypedDirectory';

export interface IConfiguration {
    bookmarkedDirectories: ITypedDirectory[];
    hideContent: boolean;
    /**
     * Allow users to specify a custom path for the settings file, so it will be useful if the users
     * use an extension like [WorkspaceConfig+]
     * (https://github.com/swellaby/vscode-workspace-config-plus) It will default to
     * `.vscode/settings.json` file in the workspace root
     */
    privateSettingsPath?: string | undefined;
    activeScope?: string | undefined;
    /**
     * List of paths to skip the git worktree
     * https://automationpanda.com/2018/09/19/ignoring-files-with-git/
     */
    gitSkipWorktreeFiles: string[];
}

export const defaultConfiguration: IConfiguration = {
    bookmarkedDirectories: [],
    hideContent: false,
    privateSettingsPath: DEFAULT_WS_SETTING_PATH,
    activeScope: undefined,
    gitSkipWorktreeFiles: [],
};

export interface ExcludeObject {
    [key: string]: any;
}
