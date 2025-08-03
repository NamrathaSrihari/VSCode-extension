const vscode = require('vscode');

function activate(context) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "gitCommitFun" is now active!');
    
    const gitExtension = vscode.extensions.getExtension('vscode.git')?.exports;
    const git = gitExtension?.getAPI(1);

    if (!git) {
        vscode.window.showErrorMessage('Git Extension not available');
        return;
    }

    git.repositories.forEach(repo => {
        repo.onDidCommit(() => {
            console.log(`Commit detected in repo: ${repo.rootUri.fsPath}`);
            vscode.window.showInformationMessage('🟢 A Git commit was made!');
        });
    });
}

function deactivate() {}
module.exports = { activate, deactivate };