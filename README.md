# 🎉 gitCommitFun

A fun and lightweight Visual Studio Code extension that celebrates your Git commits by displaying random cat GIFs or memes in a popup panel!

## ✨ Features

- Detects Git commits in any open repository
- Opens a celebratory Webview panel when a commit is made
- Displays a random cat GIF using the [TheCatAPI](https://thecatapi.com)
- Works automatically on commit—no setup required!

## 🐾 Demo

![demo gif](https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif)

## 🚀 How to Use
If you just want to use the extension:

1. Clone this repository or download the `.vsix` file.
2. Open **Visual Studio Code**.
3. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on macOS).
4. Type and select: Extensions: Install from VSIX...
5. Browse and select the `.vsix` file inside the project folder.
6. ✅ Done! The extension will now celebrate your commits.

## 🛠️ Requirements

- Git must be installed and available in your PATH.
- Your project must be a Git repository.

## 💡 How It Works

This extension hooks into the Git extension API in VS Code. When a commit is made, it:
- Listens for the `onDidCommit` event.
- Fetches a random cat GIF.
- Displays it in a Webview panel.
