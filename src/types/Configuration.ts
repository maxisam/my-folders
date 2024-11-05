import { DEFAULT_WS_SETTING_PATH } from '../core/constants';
import type { ITypedDirectory } from './TypedDirectory';

interface IScope {
    activeScope?: string | undefined;
    /**
     * Exclude paths for the workspace, it will be used to update the `files.exclude` in the
     * settings.json or the privateSettingsPath config
     */
    excludePaths: string[];
}

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
    scope: IScope;
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
    scope: {
        activeScope: undefined,
        excludePaths: [],
    },
    gitSkipWorktreeFiles: [],
};

export interface ExcludeObject {
    [key: string]: any;
}
