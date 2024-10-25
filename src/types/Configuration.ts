import type { TypedDirectory } from './TypedDirectory';

export interface IConfiguration {
    bookmarkedDirectories: TypedDirectory[];
    hideContent: boolean;
    /**
     * Allow users to specify a custom path for the settings file, so it will be useful if the users
     * use an extension like [WorkspaceConfig+]
     * (https://github.com/swellaby/vscode-workspace-config-plus) It will default to
     * `.vscode/settings.json` file in the workspace root
     */
    privateSettingsPath?: string | undefined;
    activeScope?: string | undefined;
}

export const defaultConfiguration: IConfiguration = {
    bookmarkedDirectories: [],
    hideContent: false,
    privateSettingsPath: '',
    activeScope: undefined,
};

export interface ExcludeObject {
    [key: string]: any;
}
