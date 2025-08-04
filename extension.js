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
    const INACTIVITY_PERIOD_MS = 20 * 60 * 1000; // 20 minutes

    const setCommitListener = (repo) => {
        console.log('Setting commit listener for repo:', repo.rootUri.fsPath);
        lastCommitTimestamps.set(repo.rootUri.fsPath, Date.now());

        repo.onDidCommit(() => {
            console.log('✅ Commit detected');
            vscode.window.showInformationMessage('🟢 A Git commit was made!');
            lastCommitTimestamps.set(repo.rootUri.fsPath, Date.now());
            showCommitCelebration('celebration');
        });
    };

    git.repositories.forEach(setCommitListener);

    git.onDidOpenRepository(repo => {
        console.log('📂 New repo opened:', repo.rootUri.fsPath);
        setCommitListener(repo);
    });

    setInterval(() => {
        if (!vscode.window.state.focused) return;

        const now = Date.now();
        lastCommitTimestamps.forEach((lastTime, repoRoot) => {
            const elapsed = now - lastTime;
            if (elapsed >= INACTIVITY_PERIOD_MS && elapsed % INACTIVITY_PERIOD_MS < CHECK_INTERVAL_MS) {
                console.log('🔥 No commit in last 20 minutes for', repoRoot);
                showCommitCelebration('roast');
            }
        });
    }, CHECK_INTERVAL_MS);
}

function getApiKey() {
    try {
        const config = vscode.workspace.getConfiguration('gitCommitFun');
        const settingsKey = config.get('apiKey');
        if (settingsKey) {
            return settingsKey;
        }
    } catch (error) {
        console.log('VS Code settings not available');
    }
}

function showCommitCelebration(type = 'celebration') {
    fetchGiphyContent(type, (gifData) => {
        const panel = vscode.window.createWebviewPanel(
            'gitCommitCelebration',
            type === 'roast' ? '😤 Get Back to Coding!' : '🎉 Commit Celebration!',
            vscode.ViewColumn.One,
            { enableScripts: true }
        );

        panel.webview.html = getWebviewContent(gifData);
        setTimeout(() => panel.dispose(), 12000);
    });
}

function fetchGiphyContent(type, callback) {
    const apiKey = getApiKey();
    const fallbackGifs = {
        celebration: 'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif', // Success celebration
        roast: 'https://media.giphy.com/media/l2Je66zG6mAAZxgqI/giphy.gif' // Disappointed face
    };

    if (!apiKey) {
        vscode.window.showErrorMessage('No API key found, using fallback');
        callback({
            url: fallbackGifs[type] || fallbackGifs.celebration,
            title: type === 'roast' ? 'Stop procrastinating!' : 'Great job!',
            type: type
        });
        return;
    }

    // Get celebration or roast tags
    const tags = getRandomTags(type);
    const selectedTag = tags[Math.floor(Math.random() * tags.length)];
    console.log(`Using tag: ${selectedTag} for type: ${type}`);

    // Use search endpoint instead of random to get multiple results
    const url = `https://api.giphy.com/v1/gifs/search?api_key=${apiKey}&q=${selectedTag}&limit=25&rating=g&lang=en`;

    https.get(url, res => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            try {
                const response = JSON.parse(data);
                
                if (response.data && response.data.length > 0) {
                    // Randomly select from available GIFs
                    const randomIndex = Math.floor(Math.random() * response.data.length);
                    const selectedGif = response.data[randomIndex];
                    
                    const gifUrl = selectedGif.images?.fixed_height?.url || 
                                   selectedGif.images?.original?.url ||
                                   fallbackGifs[type];
                    
                    callback({
                        url: gifUrl,
                        title: selectedGif.title || (type === 'roast' ? 'Get back to work!' : 'Awesome commit!'),
                        type: type
                    });
                } else {
                    console.log('No GIFs found, using fallback');
                    callback({
                        url: fallbackGifs[type],
                        title: type === 'roast' ? 'Stop procrastinating!' : 'Great job!',
                        type: type
                    });
                }
            } catch (err) {
                console.error('Error parsing Giphy response:', err);
                callback({
                    url: fallbackGifs[type],
                    title: type === 'roast' ? 'API failed, but you should still code!' : 'API failed, but great commit!',
                    type: type
                });
            }
        });
    }).on('error', err => {
        console.error('Giphy API request failed:', err);
        callback({
            url: fallbackGifs[type],
            title: type === 'roast' ? 'Network failed, just like your productivity!' : 'Network failed, but great commit!',
            type: type
        });
    });
}

function getRandomTags(type) {
    if (type === 'celebration') {
        return [
            // Movie celebrations
            'avengers assemble',
            'iron man victory',
            'thor hammer victory',
            'captain america shield',
            'black panther wakanda',
            'spiderman web swing',
            'star wars lightsaber',
            'rocky victory',
            'matrix neo',
            'terminator thumbs up',
            'back to the future',
            'indiana jones',
            'john wick',
            'fast and furious',
            
            // Anime celebrations
            'naruto victory',
            'goku power up',
            'one piece luffy',
            'attack on titan',
            'demon slayer victory',
            'my hero academia',
            'jojo bizarre adventure',
            'fullmetal alchemist',
            'death note victory',
            'tokyo ghoul',
            
            // General epic celebrations
            'epic win',
            'mission accomplished',
            'legendary victory',
            'boss level complete',
            'achievement unlocked',
            'level up',
            'power up',
            'unstoppable',
            'legendary',
            'godlike'
        ];
    } else if (type === 'roast') {
        return [
            // Movie/TV roasts
            'gordon ramsay disappointed',
            'the office disappointed',
            'parks and recreation',
            'breaking bad frustrated',
            'game of thrones shame',
            'deadpool facepalm',
            'robert downey jr disappointed',
            'samuel l jackson',
            'nicolas cage',
            'will smith disappointed',
            
            // Anime disappointed/roast
            'anime disappointed',
            'anime facepalm',
            'vegeta disappointed',
            'sasuke annoyed',
            'bakugo angry',
            'levi ackerman disappointed',
            'edward elric frustrated',
            'light yagami annoyed',
            
            // General roast/disappointed
            'procrastination',
            'lazy programmer',
            'disappointed',
            'facepalm',
            'not impressed',
            'seriously',
            'come on',
            'get to work',
            'stop slacking',
            'coding time',
            'focus',
            'deadline approaching'
        ];
    }
}

function getWebviewContent(gifData) {
    const isRoast = gifData.type === 'roast';
    const backgroundColor = isRoast ? '#ff4444' : '#4CAF50';
    const textColor = 'white';
    
    const motivationalText = isRoast ? 
        getRandomRoastMessage() : 
        getRandomCelebrationMessage();
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${isRoast ? 'Get Back to Work!' : 'Celebration Time!'}</title>
        <style>
            body {
                margin: 0;
                padding: 20px;
                background: linear-gradient(135deg, ${backgroundColor}22, ${backgroundColor}44);
                color: ${textColor};
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                text-align: center;
            }
            
            .container {
                background: rgba(0, 0, 0, 0.7);
                padding: 30px;
                border-radius: 15px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
                max-width: 600px;
            }
            
            .title {
                font-size: 28px;
                margin-bottom: 20px;
                color: ${backgroundColor};
                text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
            }
            
            .gif-container {
                margin: 20px 0;
                border-radius: 10px;
                overflow: hidden;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
            }
            
            .gif {
                width: 100%;
                max-width: 500px;
                height: auto;
                display: block;
            }
            
            .message {
                font-size: 18px;
                margin: 20px 0;
                padding: 15px;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 10px;
                border-left: 4px solid ${backgroundColor};
            }
            
            .gif-title {
                font-size: 14px;
                color: #ccc;
                margin-top: 10px;
                font-style: italic;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="title">
                ${isRoast ? '😤 CODING INTERVENTION!' : '🎉 COMMIT CELEBRATION!'}
            </div>
            
            <div class="gif-container">
                <img src="${gifData.url}" alt="${gifData.title}" class="gif" />
            </div>
            
            <div class="message">
                ${motivationalText}
            </div>
            
            <div class="gif-title">
                "${gifData.title}"
            </div>
        </div>
    </body>
    </html>`;
}

function getRandomCelebrationMessage() {
    const messages = [
        "🚀 Code committed like a boss! Keep the momentum going!",
        "⚡ Another victory in the battle against bugs!",
        "🔥 Your commit game is LEGENDARY!",
        "💪 Code quality: MAXIMUM! Productivity: UNSTOPPABLE!",
        "🎯 Bullseye! Another perfect commit!",
        "🏆 Commit champion strikes again!",
        "⭐ Your code is reaching legendary status!",
        "🎊 The git history will remember this moment!",
        "🌟 Coding skills: ACTIVATED!",
        "🚁 Deployed like a ninja, committed like a hero!"
    ];
    return messages[Math.floor(Math.random() * messages.length)];
}

function getRandomRoastMessage() {
    const messages = [
        "😤 20 minutes without a commit? The code won't write itself!",
        "🐌 At this rate, the bugs will fix themselves before you do!",
        "⏰ Time flies when you're procrastinating, doesn't it?",
        "🎮 Steam notifications ≠ productivity notifications!",
        "📱 Social media won't push your code to production!",
        "☕ That's a lot of coffee breaks for zero commits!",
        "🎬 Netflix can wait, but your deadlines won't!",
        "🔥 Your keyboard is getting cold from lack of use!",
        "💤 Wake up! The code needs your attention!",
        "⚡ Channel that procrastination energy into coding power!"
    ];
    return messages[Math.floor(Math.random() * messages.length)];
}

function deactivate() {}

module.exports = { activate, deactivate };