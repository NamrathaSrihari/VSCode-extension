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

1. Clone or download this repository.
2. Open the folder in VS Code.
3. Run the extension:
   - Press `F5` to open a new Extension Development Host.
   - Make a Git commit in any repository.
4. Enjoy the surprise cat celebration!

## 🛠️ Requirements

- Git must be installed and available in your PATH.
- Your project must be a Git repository.

## 💡 How It Works

This extension hooks into the Git extension API in VS Code. When a commit is made, it:
- Listens for the `onDidCommit` event.
- Fetches a random cat GIF.
- Displays it in a Webview panel.
