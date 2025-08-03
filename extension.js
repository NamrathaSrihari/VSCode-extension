const vscode = require('vscode');
const https = require('https');
const fallbackUrl = 'https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif';

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

    if (git.repositories && git.repositories.length > 0) {
		git.repositories.forEach(repo => {
			console.log('Setting commit listener for repo:', repo.rootUri.fsPath);
			repo.onDidCommit(() => {
			console.log('Commit detected event fired!');
			vscode.window.showInformationMessage('🟢 A Git commit was made!');
			showCommitCelebration()
		});
	});
	} else {
		console.log('No git repositories found at activation time.');
	}

	git.onDidOpenRepository(repo => {
		console.log('New repo opened:', repo.rootUri.fsPath);
		repo.onDidCommit(() => {
		console.log('Commit detected event fired!');
		vscode.window.showInformationMessage('🟢 A Git commit was made!');
		showCommitCelebration()
		});
  	});

}

function showCommitCelebration() {
  const panel = vscode.window.createWebviewPanel(
    'gitCommitCelebration',
    '🎉 Commit Celebration!',
    vscode.ViewColumn.One,
    { enableScripts: true }
  );

  fetchRandomCatUrl(url => {
	console.log('URl: ',url)
    panel.webview.html = getWebviewContent(url);

    setTimeout(() => {
      panel.dispose();
    }, 10000);
  });
}
function fetchRandomCatUrl(callback) {
  https.get('https://api.thecatapi.com/v1/images/search?mime_types=gif', res => {
    let data = '';

    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      try {
        const [cat] = JSON.parse(data);
        callback(cat?.url || fallbackUrl);
      } catch {
        callback(fallbackUrl);
      }
    });

  }).on('error', () => callback(fallbackUrl));
}

function getWebviewContent(catImageUrl) {
	return `<!DOCTYPE html>
		<html lang="en">
		<head>
		<meta charset="UTF-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1" />
		<title>Cat Celebration</title>
		</head>
		<body style="display:flex; justify-content:flex-start; align-items:flex-start; height:100vh; margin:0; padding:20px;">
		<img src="${catImageUrl}" width="500" alt="Random Cat Meme" />
		</body>
		</html>`;

}

function deactivate() {}
module.exports = { activate, deactivate };