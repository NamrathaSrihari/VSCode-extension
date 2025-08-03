const vscode = require('vscode');
const https = require('https');

function activate(context) {
    console.log('🎉 Extension "gitCommitFun" is now active!');
    vscode.window.showInformationMessage('🎉 Extension "gitCommitFun" is now active!');

    const gitExtension = vscode.extensions.getExtension('vscode.git')?.exports;
    const git = gitExtension?.getAPI(1);

    if (!git) {
        vscode.window.showErrorMessage('Git Extension not available');
        return;
    }

    const lastCommitTimestamps = new Map();
    const CHECK_INTERVAL_MS = 60 * 1000; // 1 minute
    const INACTIVITY_PERIOD_MS = 20 * 60 * 1000; // 10 minutes

    const setCommitListener = (repo) => {
        console.log('Setting commit listener for repo:', repo.rootUri.fsPath);
        lastCommitTimestamps.set(repo.rootUri.fsPath, Date.now());

        repo.onDidCommit(() => {
            console.log('✅ Commit detected');
            vscode.window.showInformationMessage('🟢 A Git commit was made!');
            lastCommitTimestamps.set(repo.rootUri.fsPath, Date.now());
            showCommitCelebration('marvel'); // use "marvel" for celebration
        });
    };

    git.repositories.forEach(setCommitListener);

    git.onDidOpenRepository(repo => {
        console.log('📂 New repo opened:', repo.rootUri.fsPath);
        setCommitListener(repo);
    });

    setInterval(() => {
        if (!vscode.window.state.focused) return; // Skip if VS Code is unfocused

        const now = Date.now();
        lastCommitTimestamps.forEach((lastTime, repoRoot) => {
            const elapsed = now - lastTime;
            if (elapsed >= INACTIVITY_PERIOD_MS && elapsed % INACTIVITY_PERIOD_MS < CHECK_INTERVAL_MS) {
                console.log('🔥 No commit in last 10 minutes for', repoRoot);
                showCommitCelebration('procrastination'); // use "roast" as tag for inactivity
            }
        });
    }, CHECK_INTERVAL_MS);
}

function getApiKey() {
    // const config = vscode.workspace.getConfiguration('gitCommitFun');
    // return config.get('apiKey');
	try {
        // Try VS Code settings first
        const config = vscode.workspace.getConfiguration('gitCommitFun');
        const settingsKey = config.get('apiKey');
        if (settingsKey) {
            return settingsKey;
        }
    } catch (error) {
        console.log('VS Code settings not available');
    }
}

function showCommitCelebration(tag = 'celebration') {
    fetchGiphyContent(tag, (gifUrl) => {
        const panel = vscode.window.createWebviewPanel(
            'gitCommitCelebration',
            '🎉 Commit Celebration!',
            vscode.ViewColumn.One,
            { enableScripts: true }
        );

        panel.webview.html = getWebviewContent(gifUrl);
        setTimeout(() => panel.dispose(), 10000);
    });
}

function fetchGiphyContent(tag, callback) {
    const apiKey = getApiKey();
    const fallbackUrl = 'https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif';

    if (!apiKey) {
        vscode.window.showErrorMessage('No GIPHY API key found in settings or environment.');
        callback(fallbackUrl);
        return;
    }

    const url = `https://api.giphy.com/v1/gifs/random?api_key=${apiKey}&tag=${encodeURIComponent(tag)}&rating=g`;

    https.get(url, res => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            try {
                const response = JSON.parse(data);
                const gifUrl = response.data?.images?.original?.url ||
                               response.data?.image_original_url || fallbackUrl;
                callback(gifUrl);
            } catch (err) {
                console.error('Error parsing Giphy response:', err);
                vscode.window.showErrorMessage('Failed to parse Giphy response');
                callback(fallbackUrl);
            }
        });
    }).on('error', err => {
        console.error('Giphy API request failed:', err);
        vscode.window.showErrorMessage('Failed to fetch GIF from Giphy');
        callback(fallbackUrl);
    });
}


function getWebviewContent(gifUrl) {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Celebration</title>
    </head>
    <body style="margin:0; padding:20px; display:flex; align-items:flex-start;">
        <img src="${gifUrl}" width="500" alt="Celebration GIF" />
    </body>
    </html>`;
}

function deactivate() {}

module.exports = { activate, deactivate };
