const word = document.getElementById('word');
const text = document.getElementById('text');
const scoreEl = document.getElementById('score');
const timeEl = document.getElementById('time');
const endgameEl = document.getElementById('end-game-container');

// お題の単語
const words = [
    'konnichiwa',
    'arigato',
    'sayonara',
    'ohayo',
    'oyasumi',
    'sumimasen',
    'gomenasai',
    'ittekimasu',
    'tadaima',
    'okaeri',
    'itadakimasu',
    'gochisousama',
    'sushi',
    'ramen',
    'sakura',
    'fujisan',
    'nihongo',
    'arimasu',
    'tabemasu'
];

let randomWord;
let score = 0;
let time = 60;
let difficulty = 'medium';

text.focus();

// 時間をカウントダウン
const timeInterval = setInterval(updateTime, 1000);

// ランダムな単語を生成
function getRandomWord() {
    return words[Math.floor(Math.random() * words.length)];
}

// 単語をDOMに追加
function addWordToDOM() {
    randomWord = getRandomWord();
    word.innerHTML = randomWord;
}

// スコアを更新
function updateScore() {
    score++;
    scoreEl.innerHTML = score;
}

// 時間を更新
function updateTime() {
    time--;
    timeEl.innerHTML = time + '秒';

    if (time === 0) {
        clearInterval(timeInterval);
        // ゲームオーバー処理
        gameOver();
    }
}

// ゲームオーバー処理
function gameOver() {
    endgameEl.innerHTML = `
        <h1>時間切れ！</h1>
        <p>あなたの最終スコア: ${score}</p>
        <button onclick="location.reload()">もう一度プレイ</button>
    `;
    endgameEl.style.display = 'flex';
}

addWordToDOM();

/**
 * ローマ字文字列から別名を許容する正規表現を生成します。
 * @param {string} romaji - 標準のローマ字文字列
 * @returns {RegExp}
 */
function createRomajiRegex(romaji) {
    const replacements = {
        'shi': '(shi|si)',
        'chi': '(chi|ti)',
        'tsu': '(tsu|tu)',
        'ji': '(ji|zi)',
        'zu': '(zu|du)',
        'ja': '(ja|jya)',
        'ju': '(ju|jyu)',
        'jo': '(jo|jyo)',
        'kya': '(kya|kia)',
        'kyu': '(kyu|kiu)',
        'kyo': '(kyo|kio)',
        'cha': '(cha|tya)',
        'chu': '(chu|tyu)',
        'cho': '(cho|tyo)',
        'sha': '(sha|sya)',
        'shu': '(shu|syu)',
        'sho': '(sho|syo)',
    };

    const pattern = new RegExp(Object.keys(replacements).join('|'), 'g');
    const regexString = romaji.replace(pattern, match => replacements[match]);

    return new RegExp('^' + regexString + '$');
}

// 入力イベント
text.addEventListener('input', e => {
    const insertedText = e.target.value.toLowerCase();
    const romajiRegex = createRomajiRegex(randomWord);

    if (romajiRegex.test(insertedText)) {
        addWordToDOM();
        updateScore();
        
        // 入力フィールドをクリア
        e.target.value = '';

        // 難易度に応じて時間を追加
        if (difficulty === 'hard') {
            time += 2;
        } else if (difficulty === 'medium') {
            time += 3;
        } else {
            time += 5;
        }

        updateTime();
    }
});