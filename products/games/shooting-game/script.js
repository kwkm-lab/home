// --- シーンのセットアップ ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 30;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// --- ライト ---
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 5, 5);
scene.add(light);
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

// --- テクスチャの読み込み ---
const textureLoader = new THREE.TextureLoader();
const enemyTexture1 = textureLoader.load('assets/enemy1.png');
const enemyTexture2 = textureLoader.load('assets/enemy2.png');
const enemyTexture3 = textureLoader.load('assets/enemy3.png');
const enemyTexture4 = textureLoader.load('assets/enemy4.png');
const enemyTexture5 = textureLoader.load('assets/enemy5.png');
const enemyTextures = [
    enemyTexture1,
    enemyTexture2,
    enemyTexture3,
    enemyTexture4,
    enemyTexture5
];
const backgroundTexture = textureLoader.load('assets/background.png');

// --- 背景設定 ---
scene.background = backgroundTexture;

// --- ゲームの変数 ---
let score = 0;
let highScore = parseInt(localStorage.getItem('shootingGameHighScore') || '0'); // Load from localStorage
let timeLeft = 60;
let isGameOver = false;
let gameState = 'countdown'; // 'countdown', 'playing', 'ended'
const enemies = [];
let mainGameTimerInterval; // メインゲームタイマーのID

// --- UI要素 ---
const scoreElement = document.getElementById('score');
const timerElement = document.getElementById('timer');
const highScoreElement = document.getElementById('high-score');
const gameOverScreen = document.getElementById('game-over-screen');
const finalScoreElement = document.getElementById('final-score');
const highScoreDisplayElement = document.getElementById('high-score-display');
const restartButton = document.getElementById('restart-button');
const crosshair = document.getElementById('crosshair');
const countdownElement = document.getElementById('countdown'); // 新しいUI要素

// --- Raycaster ---
const raycaster = new THREE.Raycaster();

// --- 操作と照準 ---
const keys = {};
let crosshairX = window.innerWidth / 2;
let crosshairY = window.innerHeight / 2;
const crosshairSpeed = 10;

// --- ゲームロジック ---

// 敵を作成する関数
function createEnemy() {
    // ランダムにテクスチャを選択
    const textureIndex = Math.floor(Math.random() * enemyTextures.length);
    const selectedTexture = enemyTextures[textureIndex];

    // PlaneGeometryを使って2D画像を表示
    const geometry = new THREE.PlaneGeometry(5, 5); // 画像のサイズに合わせて調整
    const material = new THREE.MeshBasicMaterial({ map: selectedTexture, transparent: true, side: THREE.DoubleSide });
    const enemy = new THREE.Mesh(geometry, material);

    enemy.position.set(
        (Math.random() - 0.5) * 50,
        (Math.random() - 0.5) * 30,
        (Math.random() - 0.5) * 20
    );

    // HPをオブジェクトに持たせる
    enemy.hp = Math.floor(Math.random() * 3) + 1; // 1〜3 HP

    // スコアをオブジェクトに持たせる
    enemy.scoreValue = (textureIndex + 1) * 10; // enemy1.png (index 0) -> 10点, enemy2.png (index 1) -> 20点, etc.

    // 速度をオブジェクトに持たせる
    enemy.velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 0.2, // x方向の速度
        (Math.random() - 0.5) * 0.2, // y方向の速度
        0 // z方向には動かさない
    );
    
    // 初期状態でカメラを向かせる (animateループでも常に更新)
    enemy.lookAt(camera.position);

    scene.add(enemy);
    enemies.push(enemy);
}

// ハイスコアの初期表示
highScoreElement.textContent = `ハイスコア: ${highScore}`;

function startMainGameTimer() {
    mainGameTimerInterval = setInterval(() => {
        if (isGameOver) {
            clearInterval(mainGameTimerInterval);
            return;
        }
        timeLeft--;
        timerElement.textContent = `残り時間: ${timeLeft}`;
        if (timeLeft <= 0) {
            endGame();
        }
    }, 1000);
}

function endGame() {
    isGameOver = true;
    clearInterval(mainGameTimerInterval); // メインゲームタイマーを停止
    gameOverScreen.style.display = 'flex';
    finalScoreElement.textContent = score;

    // ハイスコアの更新と保存
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('shootingGameHighScore', highScore); // localStorageに保存
        highScoreElement.textContent = `ハイスコア: ${highScore}`; // プレイ中の表示も更新
    }
    highScoreDisplayElement.textContent = highScore; // ゲームオーバー画面での表示

    crosshair.style.display = 'none'; // 照準を隠す
}

// 攻撃処理
function shoot() {
    if (isGameOver) return;

    // 照準の2D座標を正規化
    const mouse = new THREE.Vector2();
    mouse.x = (crosshairX / window.innerWidth) * 2 - 1;
    mouse.y = -(crosshairY / window.innerHeight) * 2 + 1;

    // Raycasterで照準の下にあるオブジェクトを検出
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(enemies);

    if (intersects.length > 0) {
        const hitEnemy = intersects[0].object;
        hitEnemy.hp--;

        // HPが0になったら敵を削除してスコアを加算
        if (hitEnemy.hp <= 0) {
            scene.remove(hitEnemy);
            enemies.splice(enemies.indexOf(hitEnemy), 1);
            score += hitEnemy.scoreValue; // Use enemy's specific score value
            scoreElement.textContent = `スコア: ${score}`;
            // 新しい敵を生成
            createEnemy();
        }
    }
}

// 照準の移動
function handleCrosshairMovement() {
    if (isGameOver) return;

    if (keys['ArrowUp']) crosshairY -= crosshairSpeed;
    if (keys['ArrowDown']) crosshairY += crosshairSpeed;
    if (keys['ArrowLeft']) crosshairX -= crosshairSpeed;
    if (keys['ArrowRight']) crosshairX += crosshairSpeed;

    // 画面内にクランプ
    crosshairX = Math.max(0, Math.min(window.innerWidth, crosshairX));
    crosshairY = Math.max(0, Math.min(window.innerHeight, crosshairY));

    // 照準(div)のスタイルを更新
    crosshair.style.left = `${crosshairX}px`;
    crosshair.style.top = `${crosshairY}px`;
}


function startCountdown() {
    let count = 3;
    countdownElement.style.display = 'block'; // カウントダウン表示

    const tick = () => {
        countdownElement.classList.remove('tick'); // アニメーションリセット
        void countdownElement.offsetWidth; // Reflowを強制
        countdownElement.classList.add('tick'); // アニメーション開始

        if (count > 0) {
            countdownElement.textContent = count;
            count--;
            setTimeout(tick, 1000);
        } else if (count === 0) {
            countdownElement.textContent = 'GO!';
            count--;
            setTimeout(tick, 1000);
        } else {
            countdownElement.style.display = 'none'; // カウントダウンを非表示
            gameState = 'playing'; // ゲーム開始
            startMainGameTimer(); // メインゲームタイマーを開始
            for (let i = 0; i < 5; i++) { // 初期敵を生成
                createEnemy();
            }
        }
    };
    tick();
}

// --- イベントリスナー ---
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// キーボードの状態を管理
window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    // Enterキーで攻撃
    if (e.key === 'Enter' && gameState === 'playing') { // ゲームプレイ中のみ攻撃可能
        shoot();
    }
});
window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// マウスクリックで攻撃
window.addEventListener('click', () => {
    if (gameState === 'playing') { // ゲームプレイ中のみ攻撃可能
        shoot();
    }
});

restartButton.addEventListener('click', () => {
    location.reload();
});


// --- アニメーションループ ---
function animate() {
    requestAnimationFrame(animate);

    if (gameState === 'playing' && !isGameOver) {
        handleCrosshairMovement();

        const enemiesToRemove = [];
        const boundary = { x: 35, y: 25 };

        // 敵の更新
        enemies.forEach(enemy => {
            // 速度に基づいて位置を更新
            enemy.position.add(enemy.velocity);

            // 常にカメラの方向に向かせる
            enemy.lookAt(camera.position);

            // 画面外に出たかチェック
            if (Math.abs(enemy.position.x) > boundary.x || Math.abs(enemy.position.y) > boundary.y) {
                enemiesToRemove.push(enemy);
            }
        });

        // 画面外の敵を削除して新しい敵を生成
        enemiesToRemove.forEach(enemy => {
            scene.remove(enemy);
            const index = enemies.indexOf(enemy);
            if (index > -1) {
                enemies.splice(index, 1);
            }
            createEnemy();
        });
    }

    renderer.render(scene, camera);
}

animate();
startCountdown(); // ゲーム開始時にカウントダウンを開始
