import type { TypedDirectory } from './TypedDirectory';

export interface IConfiguration {
    bookmarkedDirectories: TypedDirectory[];
    hideContent: boolean;
}
