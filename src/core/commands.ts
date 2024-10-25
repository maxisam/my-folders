import { EXTENSION_NAME } from './constants';

export enum vsCodeCommands {
    Open = 'vscode.open',
}

export enum ExtensionCommands {
    SelectItem = `${EXTENSION_NAME}.selectItem`,
    OpenItem = `${EXTENSION_NAME}.openItem`,
    RefreshEntry = `${EXTENSION_NAME}.refreshEntry`,
    CantRemoveItem = `${EXTENSION_NAME}.cantRemoveItem`,
    RemoveItem = `${EXTENSION_NAME}.removeItem`,
    RemoveAllItems = `${EXTENSION_NAME}.removeAllItems`,
    RenameItem = `${EXTENSION_NAME}.renameItem`,
    FocusInExplorer = `${EXTENSION_NAME}.focusInExplorer`,
    ClearFocusScope = `${EXTENSION_NAME}.clearFocusScope`,
}
