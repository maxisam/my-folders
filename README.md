# my-folders

Bookmark your favorite folders in the explorer view.

- Bookmark your favorite folders in the explorer view
- Rename bookmark name with sorting
- Save data to a configuration file (`.vscode/my-folders.json`)
- Focus on the bookmarked folder
- exclude my-folders.json locally in .git/info/exclude

## Known Issues

Focus on the bookmarked folder utilizes the file.exclude setting. It has to change the settings.json file with [some not-so-pretty code.](https://github.com/microsoft/vscode/issues/869)

## Acknowledgement

This extension is inspired by the following extensions:

- [Explorer Bookmark](https://github.com/UrosVuj/Explorer-Bookmark)
- [Scope to This](https://github.com/rhalaly/scope-to-this-vscode)
