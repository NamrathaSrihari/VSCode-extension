// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */

function activate(context) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "gitCommitFun" is now active!');
	const gitExtension = vscode.extensions.getExtension('vscode.git')?.exports;
	const git = gitExtension?.getAPI(2);

	if (!git) {
		vscode.window.showErrorMessage('Git Extension not available');
		return;
	}

	// Listen for Git operations
	git.onDidRunGitOperation((e) => {
		// GitOperation.Commit = 2 (not exported directly in JS)
		if (e.operation === 2) {
			console.log('🟢 Git commit detected!');
			vscode.window.showInformationMessage('🟢 A Git commit was made!');
		}
	});

}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
