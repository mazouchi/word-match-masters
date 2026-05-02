let config = {};
let wordPools = [];
let selectedPool = null;
let wordPool = [];
let tags = [];
let playerName = '';
let currentQuestion = 0;
let score = 0;
let tries = 0;
let maxTries = 3;
let tilesMin = 4;
let tilesMax = 6;
let gameOverOnMistake = false;
let questionsPerGame = 10;
let questionsPerPool = {};
let questionPrompts = {};
let questionPrompt = 'Find the two words that match!';
let tileColors = [];

async function loadConfig() {
    let data;
    
    // Check if CONFIG_DATA is available (from config.js)
    if (typeof CONFIG_DATA !== 'undefined' && CONFIG_DATA) {
        // Use in-memory data - no fetch needed
        data = {
            config: CONFIG_DATA.config,
            word_pools: CONFIG_DATA.wordPools
        };
    } else {
        // Fallback to fetching from JSON files (original behavior)
        const response = await fetch('config.json');
        data = await response.json();
        
        // Fetch individual pool files
        data.word_pools = await Promise.all(data.word_pools.map(async poolDef => {
            if (poolDef.file) {
                const fileResponse = await fetch(poolDef.file);
                const poolData = await fileResponse.json();
                return { ...poolData, file: poolDef.file };
            }
            return poolDef;
        }));
    }
    
    config = data.config;
    wordPools = data.word_pools;
    
    // questionsPerPool = config.questions_per_pool || {};
    questionPrompts = config.question_prompts || {};
    boardColors = config.board_colors || ['255, 99, 132', '54, 162, 235', '255, 206, 86', '75, 192, 192', '153, 102, 255'];
    tileColors = config.tile_colors || ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF', '#4BC0C0', '#FF6384'];
    // Load from localStorage if exists
    const savedConfig = localStorage.getItem('wordMatchConfig');
    if (savedConfig) {
        const parsed = JSON.parse(savedConfig);
        config = { ...config, ...parsed };
    }
    selectedPool = wordPools.find(p => p.name === config.selected_pool) || wordPools[0];
    wordPool = selectedPool.word_pool;
    tags = [...new Set(wordPool.flatMap(w => w.tags))];
    maxTries = config.max_tries;
    tilesMin = config.tiles_per_question[0];
    tilesMax = config.tiles_per_question[1];
    gameOverOnMistake = config.game_over_on_mistake;
    questionsPerGame = questionsPerPool[selectedPool.name] || config.questions_per_game;
    questionPrompt = questionPrompts[selectedPool.name] || 'Find the two words that match!';
}

function updateLandingPoolList() {
    const poolSelect = document.getElementById('startingPoolSelect');
    poolSelect.innerHTML = wordPools.map(p => `<option value="${p.name}">${p.name}</option>`).join('');
    poolSelect.value = selectedPool.name;
}

function init() {
    loadConfig().then(() => {
        document.getElementById('appTitle').textContent = config.title;
        setupEventListeners();
        updateLandingPoolList();
        showSection('landing');
    });
}

function setupEventListeners() {
    document.getElementById('startGame').addEventListener('click', startGame);
    document.getElementById('submit').addEventListener('click', checkAnswer);
    document.getElementById('nextQuestionBtn').addEventListener('click', onNextQuestion);
    document.getElementById('playAgain').addEventListener('click', restartGame);
    document.getElementById('reset').addEventListener('click', resetGame);
    document.getElementById('restart').addEventListener('click', restartGame);
    document.getElementById('settings').addEventListener('click', showSettings);
    document.getElementById('saveSettings').addEventListener('click', saveSettings);
    document.getElementById('leaderboardBtn').addEventListener('click', () => { loadLeaderboard(); showSection('leaderboard'); });
}

function showSection(sectionId) {
    document.querySelectorAll('section').forEach(sec => sec.style.display = 'none');
    document.getElementById(sectionId).style.display = 'block';
}

function startGame() {
    playerName = document.getElementById('playerName').value.trim();
    if (!playerName) {
        alert('Please enter your name.');
        return;
    }
    const poolSelect = document.getElementById('startingPoolSelect');
    selectedPool = wordPools.find(p => p.name === poolSelect.value) || selectedPool;
    config.selected_pool = selectedPool.name;
    wordPool = selectedPool.word_pool;
    tags = [...new Set(wordPool.flatMap(w => w.tags))];
    questionsPerGame = selectedPool.questions_per_game || config.questions_per_game;
    questionPrompt = selectedPool.question_prompt || 'Find the two words that match!';
    currentQuestion = 0;
    score = 0;
    selectedTiles = [];
    showSection('game');
    document.getElementById('questionContainer').style.display = 'block';
    document.getElementById('scoreContainer').style.display = 'none';
    document.getElementById('nextQuestionBtn').style.display = 'none';
    nextQuestion();
}

function nextQuestion() {
    if (currentQuestion >= questionsPerGame) {
        endGame();
        return;
    }
    currentQuestion++;
    tries = maxTries;
    selectedTiles = [];
    generateQuestion();
    updateUI();
}

function generateQuestion() {
    // Choose a random tag with at least 2 words
    const availableTags = tags.filter(tag => wordPool.filter(w => w.tags.includes(tag)).length >= 2);
    currentTag = availableTags[Math.floor(Math.random() * availableTags.length)];
    // Get words with this tag
    const tagWords = wordPool.filter(w => w.tags.includes(currentTag));
    // Choose 2 random
    const shuffledTag = tagWords.sort(() => 0.5 - Math.random());
    const matchingWords = shuffledTag.slice(0, 2);
    // Choose num tiles - 2 other words without this tag
    const numTiles = Math.floor(Math.random() * (tilesMax - tilesMin + 1)) + tilesMin;
    const otherWords = wordPool.filter(w => !w.tags.includes(currentTag)).sort(() => 0.5 - Math.random()).slice(0, numTiles - 2);
    // Combine and shuffle
    currentWords = [...matchingWords, ...otherWords].sort(() => 0.5 - Math.random());
}

function updateUI() {
    document.getElementById('statsText').textContent = `Score: ${score}/${questionsPerGame}`;
    document.getElementById('questionCounter').textContent = `Question ${currentQuestion}/${questionsPerGame}`;
    document.getElementById('questionText').textContent = questionPrompt;
    const tilesDiv = document.getElementById('tiles');
    tilesDiv.innerHTML = '';
    currentWords.forEach((wordObj, index) => {
        const tile = document.createElement('div');
        tile.className = 'tile';
        tile.textContent = wordObj.word;
        tile.dataset.index = index;
        tile.style.backgroundColor = tileColors[index % tileColors.length];
        tile.addEventListener('click', () => selectTile(tile, index));
        tilesDiv.appendChild(tile);
    });
    document.getElementById('submit').style.display = 'inline-block';
    document.getElementById('submit').disabled = true;
    document.getElementById('feedback').textContent = '';
    const nextBtn = document.getElementById('nextQuestionBtn');
    nextBtn.style.display = 'none';
    nextBtn.textContent = 'Next Question';
    document.querySelectorAll('.tile').forEach(tile => tile.style.pointerEvents = 'auto');
}

function selectTile(tile, index) {
    if (tile.classList.contains('selected')) {
        tile.classList.remove('selected');
        selectedTiles = selectedTiles.filter(i => i !== index);
    } else {
        if (selectedTiles.length < 2) {
            tile.classList.add('selected');
            selectedTiles.push(index);
        }
    }
    document.getElementById('submit').disabled = selectedTiles.length !== 2;
}

function checkAnswer() {
    const selectedWords = selectedTiles.map(i => currentWords[i]);
    const sharedTags = selectedWords[0].tags.filter(tag => selectedWords[1].tags.includes(tag));
    if (sharedTags.length > 0) {
        score++;
        document.getElementById('feedback').textContent = 'Correct! Well done.';
        setTimeout(nextQuestion, 1000);
    } else {
        tries--;
        if (tries <= 0 || gameOverOnMistake) {
            selectedTiles.forEach(i => {
                document.querySelector(`.tile[data-index="${i}"]`).classList.remove('selected');
            });
            selectedTiles = [];
            const correctIndices = currentWords.reduce((acc, word, index) => {
                if (word.tags.includes(currentTag)) acc.push(index);
                return acc;
            }, []);
            correctIndices.forEach(i => {
                const tile = document.querySelector(`.tile[data-index="${i}"]`);
                if (tile) tile.classList.add('selected');
            });
            document.querySelectorAll('.tile').forEach(tile => tile.style.pointerEvents = 'none');
            document.getElementById('submit').style.display = 'none';
            document.getElementById('feedback').textContent = 'Wrong! Correct answer shown. Click Done.';
            const nextBtn = document.getElementById('nextQuestionBtn');
            nextBtn.textContent = 'Done';
            nextBtn.style.display = 'inline-block';
        } else {
            document.getElementById('feedback').textContent = `Wrong! ${tries} tries left.`;
            selectedTiles.forEach(i => {
                document.querySelector(`.tile[data-index="${i}"]`).classList.remove('selected');
            });
            selectedTiles = [];
            document.getElementById('submit').disabled = true;
        }
    }
}

function onNextQuestion() {
    const nextBtn = document.getElementById('nextQuestionBtn');
    nextBtn.style.display = 'none';
    if (nextBtn.textContent === 'Done') {
        endGame();
        return;
    }
    if (currentQuestion >= questionsPerGame) {
        endGame();
    } else {
        nextQuestion();
    }
}

function endGame() {
    document.getElementById('questionContainer').style.display = 'none';
    document.getElementById('scoreContainer').style.display = 'block';
    document.getElementById('finalScore').textContent = `${score}/${questionsPerGame} (${selectedPool.name})`;
    document.getElementById('nextQuestionBtn').style.display = 'none';
    saveScore();
    loadLeaderboard();
    showSection('leaderboard');
}

function saveScore() {
    const leaderboard = JSON.parse(localStorage.getItem('leaderboard') || '{}');
    if (!leaderboard[selectedPool.name]) {
        leaderboard[selectedPool.name] = [];
    }
    leaderboard[selectedPool.name].push({
        name: playerName,
        score: score,
        timestamp: new Date().toISOString()
    });
    leaderboard[selectedPool.name].sort((a, b) => b.score - a.score || a.timestamp.localeCompare(b.timestamp));
    leaderboard[selectedPool.name] = leaderboard[selectedPool.name].slice(0, 100);
    localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
}

function loadLeaderboard() {
    const leaderboard = JSON.parse(localStorage.getItem('leaderboard') || '{}');
    const list = document.getElementById('leaderList');
    list.innerHTML = '';
    let hasAnyScores = false;
    wordPools.forEach((pool, index) => {
        const poolEntries = leaderboard[pool.name] || [];
        if (poolEntries.length === 0) {
            return;
        }
        hasAnyScores = true;
        const section = document.createElement('div');
        section.className = 'score-board-section';
        const color = boardColors[index % boardColors.length];
        section.style.backgroundColor = `rgba(${color}, 0.18)`;
        section.style.border = `2px solid rgba(${color}, 0.8)`;
        const heading = document.createElement('h3');
        heading.textContent = pool.name;
        section.appendChild(heading);
        const ul = document.createElement('ul');
        poolEntries.forEach(entry => {
            const li = document.createElement('li');
            const playedAt = new Date(entry.timestamp).toLocaleString();
            li.textContent = `${entry.name}: ${entry.score}/${questionsPerGame} - ${playedAt}`;
            ul.appendChild(li);
        });
        section.appendChild(ul);
        list.appendChild(section);
    });
    if (!hasAnyScores) {
        list.textContent = 'No scores yet.';
    }
}

function restartGame() {
    startGame();
}

function resetGame() {
    localStorage.removeItem('leaderboard');
    localStorage.removeItem('wordMatchConfig');
    location.reload();
}

function showSettings() {
    document.getElementById('wordPoolSelect').innerHTML = wordPools.map(p => `<option value="${p.name}">${p.name}</option>`).join('');
    document.getElementById('wordPoolSelect').value = selectedPool.name;
    document.getElementById('maxTries').value = maxTries;
    document.getElementById('tilesMin').value = tilesMin;
    document.getElementById('tilesMax').value = tilesMax;
    document.getElementById('gameOverMistake').checked = gameOverOnMistake;
    document.getElementById('questionsPerGame').value = questionsPerGame;
    showSection('settings');
}

function saveSettings() {
    const newConfig = {
        ...config,
        selected_pool: document.getElementById('wordPoolSelect').value,
        max_tries: parseInt(document.getElementById('maxTries').value),
        tiles_per_question: [parseInt(document.getElementById('tilesMin').value), parseInt(document.getElementById('tilesMax').value)],
        game_over_on_mistake: document.getElementById('gameOverMistake').checked,
        questions_per_game: parseInt(document.getElementById('questionsPerGame').value)
    };
    localStorage.setItem('wordMatchConfig', JSON.stringify(newConfig));
    config = { ...config, ...newConfig };
    selectedPool = wordPools.find(p => p.name === config.selected_pool);
    wordPool = selectedPool.word_pool;
    tags = [...new Set(wordPool.flatMap(w => w.tags))];
    maxTries = config.max_tries;
    tilesMin = config.tiles_per_question[0];
    tilesMax = config.tiles_per_question[1];
    gameOverOnMistake = config.game_over_on_mistake;
    questionsPerGame = questionsPerPool[selectedPool.name] || config.questions_per_game;
    questionPrompt = questionPrompts[selectedPool.name] || 'Find the two words that match!';
    updateLandingPoolList();
    showSection('landing');
}

window.onload = init;