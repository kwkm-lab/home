// --- 1. シーンのセットアップ ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb); // 空の色

// カメラ
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 5, 10);
camera.lookAt(0, 0, 0);

// レンダラー
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// ライト
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(20, 50, 20);
scene.add(directionalLight);

// --- 2. オブジェクトの作成 ---

// 定数
const roadWidth = 30;
const roadLength = 3000;
const finishLineZ = -roadLength + 50;

// 車を作成する関数
function createCar(isPoliceCar = false, mainColor = 0xffffff) { // isPoliceCarフラグとメインの色
    const car = new THREE.Group();

    if (isPoliceCar) {
        // 日本のパトカーモデル
        // 車体下部 (黒)
        const lowerBodyGeo = new THREE.BoxGeometry(2, 0.8, 4);
        const lowerBodyMat = new THREE.MeshStandardMaterial({ color: 0x111111 }); // 黒
        const lowerBody = new THREE.Mesh(lowerBodyGeo, lowerBodyMat);
        car.add(lowerBody);

        // 車体上部 (白)
        const upperBodyGeo = new THREE.BoxGeometry(1.9, 0.7, 2.8);
        const upperBodyMat = new THREE.MeshStandardMaterial({ color: 0xffffff }); // 白
        const upperBody = new THREE.Mesh(upperBodyGeo, upperBodyMat);
        upperBody.position.y = 0.75;
        car.add(upperBody);

        // フロントガラス
        const windowMat = new THREE.MeshStandardMaterial({ color: 0x87ceeb, transparent: true, opacity: 0.7 }); // 水色、半透明
        const frontWindowGeo = new THREE.BoxGeometry(1.7, 0.4, 0.1);
        const frontWindow = new THREE.Mesh(frontWindowGeo, windowMat);
        frontWindow.position.set(0, 0.8, 1.45);
        car.add(frontWindow);

        // バックの窓
        const backWindowGeo = new THREE.BoxGeometry(1.7, 0.4, 0.1);
        const backWindow = new THREE.Mesh(backWindowGeo, windowMat);
        backWindow.position.set(0, 0.8, -1.45);
        car.add(backWindow);

        // サイレン (赤)
        const sirenGeo = new THREE.BoxGeometry(1.2, 0.25, 0.6);
        const sirenMat = new THREE.MeshStandardMaterial({ color: 0xff0000, emissive: 0xff0000 }); // 発光する赤
        const siren = new THREE.Mesh(sirenGeo, sirenMat);
        siren.position.y = 1.25;
        car.add(siren);

        // フロントライト (黄色)
        const frontLightGeo = new THREE.BoxGeometry(0.3, 0.2, 0.1);
        const frontLightMat = new THREE.MeshStandardMaterial({ color: 0xffff00, emissive: 0xffff00 }); // 黄色、発光
        const frontLightLeft = new THREE.Mesh(frontLightGeo, frontLightMat);
        frontLightLeft.position.set(-0.7, 0.2, 2.05);
        car.add(frontLightLeft);
        const frontLightRight = frontLightLeft.clone();
        frontLightRight.position.x = 0.7;
        car.add(frontLightRight);

        // バックライト (赤色)
        const backLightGeo = new THREE.BoxGeometry(0.3, 0.2, 0.1);
        const backLightMat = new THREE.MeshStandardMaterial({ color: 0xff0000, emissive: 0xff0000 }); // 赤色、発光
        const backLightLeft = new THREE.Mesh(backLightGeo, backLightMat);
        backLightLeft.position.set(-0.7, 0.2, -2.05);
        car.add(backLightLeft);
        const backLightRight = backLightLeft.clone();
        backLightRight.position.x = 0.7;
        car.add(backLightRight);

        // ナンバープレート (白)
        const licensePlateGeo = new THREE.BoxGeometry(0.6, 0.3, 0.05);
        const licensePlateMat = new THREE.MeshStandardMaterial({ color: 0xffffff }); // 白
        const licensePlate = new THREE.Mesh(licensePlateGeo, licensePlateMat);
        licensePlate.position.set(0, 0.2, -2.08);
        car.add(licensePlate);

    } else {
        // シンプルな車体
        const bodyMat = new THREE.MeshStandardMaterial({ color: mainColor });
        const lowerBodyGeo = new THREE.BoxGeometry(2, 0.8, 4);
        const lowerBody = new THREE.Mesh(lowerBodyGeo, bodyMat);
        car.add(lowerBody);

        // シンプルなヘッドライト
        const frontLightGeo = new THREE.BoxGeometry(0.3, 0.2, 0.1);
        const frontLightMat = new THREE.MeshStandardMaterial({ color: 0xffff00, emissive: 0xffff00 }); // 黄色、発光
        const frontLightLeft = new THREE.Mesh(frontLightGeo, frontLightMat);
        frontLightLeft.position.set(-0.7, 0.2, 2.05);
        car.add(frontLightLeft);
        const frontLightRight = frontLightLeft.clone();
        frontLightRight.position.x = 0.7;
        car.add(frontLightRight);
    }
    return car;
}

function createSpikyObstacle(material) {
    const obstacleGroup = new THREE.Group();

    // Main body (a cube)
    const bodyGeo = new THREE.BoxGeometry(3, 2, 3); // Original obstacle size
    const bodyMesh = new THREE.Mesh(bodyGeo, material);
    obstacleGroup.add(bodyMesh);

    // Spikes - using cones for spiky effect
    const spikeGeo = new THREE.ConeGeometry(0.5, 1.5, 4); // radius, height, radialSegments

    // Top spike
    const spikeTop = new THREE.Mesh(spikeGeo, material);
    spikeTop.position.y = 1.0 + 0.75; // Above the main body (body height is 2, so 1.0 is top surface)
    obstacleGroup.add(spikeTop);

    // Side spikes (4 of them)
    const spikeOffset = 1.5; // Half of body width/depth (body is 3x3 base)
    const spikeLength = 0.75; // How much spike protrudes

    // Front spike
    const spikeFront = new THREE.Mesh(spikeGeo, material);
    spikeFront.rotation.x = Math.PI / 2; // Point forward
    spikeFront.position.z = spikeOffset + spikeLength;
    obstacleGroup.add(spikeFront);

    // Back spike
    const spikeBack = new THREE.Mesh(spikeGeo, material);
    spikeBack.rotation.x = -Math.PI / 2; // Point backward
    spikeBack.position.z = -spikeOffset - spikeLength;
    obstacleGroup.add(spikeBack);

    // Left spike
    const spikeLeft = new THREE.Mesh(spikeGeo, material);
    spikeLeft.rotation.z = -Math.PI / 2; // Point left
    spikeLeft.position.x = -spikeOffset - spikeLength;
    obstacleGroup.add(spikeLeft);

    // Right spike
    const spikeRight = new THREE.Mesh(spikeGeo, material);
    spikeRight.rotation.z = Math.PI / 2; // Point right
    spikeRight.position.x = spikeOffset + spikeLength;
    obstacleGroup.add(spikeRight);

    return obstacleGroup;
}

function createCheckerboardTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const context = canvas.getContext('2d');
    const size = 64;
    context.fillStyle = '#111111'; // Black
    context.fillRect(0, 0, 128, 128);
    context.fillStyle = '#FFFFFF'; // White
    context.fillRect(0, 0, size, size);
    context.fillRect(size, size, size, size);
    return new THREE.CanvasTexture(canvas);
}

// 地面
const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(200, roadLength),
    new THREE.MeshStandardMaterial({ color: 0x567d46 })
);
ground.rotation.x = -Math.PI / 2;
ground.position.z = -roadLength / 2;
scene.add(ground);

// 道路
const road = new THREE.Mesh(
    new THREE.PlaneGeometry(roadWidth, roadLength),
    new THREE.MeshStandardMaterial({ color: 0x555555 })
);
road.rotation.x = -Math.PI / 2;
road.position.y = 0.01;
road.position.z = -roadLength / 2;
scene.add(road);

// フィニッシュライン
const finishLine = new THREE.Mesh(
    new THREE.BoxGeometry(roadWidth, 0.1, 2),
    new THREE.MeshBasicMaterial({ color: 0xffffff })
);
finishLine.position.set(0, 0.02, finishLineZ);
scene.add(finishLine);

// スタートライン
const startLineTexture = createCheckerboardTexture();
startLineTexture.wrapS = THREE.RepeatWrapping;
startLineTexture.wrapT = THREE.RepeatWrapping;
startLineTexture.repeat.set(15, 1); // 横に15回、縦に1回リピート

const startLineMat = new THREE.MeshStandardMaterial({ map: startLineTexture });
// 薄くして、道路表面に合わせる
const startLineGeo = new THREE.BoxGeometry(roadWidth, 0.01, 5); // 高さを0.01に
const startLine = new THREE.Mesh(startLineGeo, startLineMat);
// 道路のyが0.01なので、startLineの底部が0.01になるように中央を配置
startLine.position.set(0, 0.015, 2); // プレイヤーの少し後ろに配置
scene.add(startLine);

// プレイヤーの車 (パトカー)
const playerCar = createCar(true);
playerCar.position.set(-5, 0.4, 0);
scene.add(playerCar);
const playerBox = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());

// 敵の車 (シンプルな青い車)
const aiCar = createCar(false, 0x0000ff);
aiCar.position.set(5, 0.4, 0);
scene.add(aiCar);

// 障害物
const obstacles = [];
const obstacleMat = new THREE.MeshStandardMaterial({ color: 0x8B4513 }); // 茶色
for (let i = 0; i < 50; i++) {
    const obstacle = createSpikyObstacle(obstacleMat);
    const startX = (Math.random() - 0.5) * (roadWidth - 4);
    obstacle.position.set(
        startX,
        1,
        -(Math.random() * (roadLength - 100) + 50) // スタートとゴール付近を避ける
    );
    scene.add(obstacle);

    const isMovable = Math.random() < 0.3; // 30%の確率で動く障害物になる

    obstacles.push({
        mesh: obstacle,
        box: new THREE.Box3().setFromObject(obstacle),
        isMovable: isMovable,
        direction: Math.random() < 0.5 ? 1 : -1, // ランダムな初期方向
        speed: isMovable ? Math.random() * 0.1 + 0.05 : 0, // ランダムな速度
        startX: startX, // 初期位置を記憶
        moveRange: isMovable ? Math.random() * 3 + 2 : 0, // 移動範囲
        isHit: false
    });
}

// ダッシュ床
const dashPads = [];
const dashPadGeo = new THREE.PlaneGeometry(5, 10);
const dashPadMat = new THREE.MeshStandardMaterial({
    color: 0xffff00,
    emissive: 0xffff00,
    emissiveIntensity: 1
});
for (let i = 0; i < 15; i++) {
    const dashPad = new THREE.Mesh(dashPadGeo, dashPadMat);
    dashPad.rotation.x = -Math.PI / 2;
    dashPad.position.set(
        (Math.random() - 0.5) * (roadWidth - 5),
        0.02,
        -(i * (roadLength / 15) + Math.random() * 100) // 散らばらせる
    );
    scene.add(dashPad);
    dashPads.push({ mesh: dashPad, box: new THREE.Box3().setFromObject(dashPad) });
}

// --- 3. ゲームロジック ---

const raceInfoElement = document.getElementById('race-info');
const hpBarElement = document.getElementById('hp-bar');
const countdownElement = document.getElementById('countdown');
const speedometerElement = document.getElementById('speedometer');
const timerElement = document.getElementById('timer');

const keys = { ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false };

let playerSpeed = 3.0;
let playerBoost = 0.0;
const boostFriction = 0.96;
let startTime = 0;
const initialMaxPlayerSpeed = 2.5; // 少し減速
const finalMaxPlayerSpeed = 1.55; // 最終的な最高速度 (AIの2倍以上)
let currentMaxPlayerSpeed = initialMaxPlayerSpeed; // 現在の最高速度
const playerAcceleration = 0.5; // 加速を緩やかにする
const speedIncreaseRate = 0.5; // 速度が上がる割合をさらに速くする
const friction = 0.98;
const turnSpeed = 0.03;

let playerHP = 100;

const aiSpeed = 1.5;

let gameState = 'countdown'; // 'countdown', 'running', 'ended'
let gameEnded = false; // 旧式の終了フラグ、gameStateに統一予定

window.addEventListener('keydown', (e) => { if (keys.hasOwnProperty(e.key)) keys[e.key] = true; });
window.addEventListener('keyup', (e) => { if (keys.hasOwnProperty(e.key)) keys[e.key] = false; });
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// --- 4. アニメーションループ ---
function animate() {
    requestAnimationFrame(animate);

    if (gameState === 'running') {
        // --- ダッシュ床の判定 ---
        for (const dashPad of dashPads) {
            if (playerBox.intersectsBox(dashPad.box)) {
                playerBoost = 3.0; // ブースト値を設定
            }
        }

        // --- プレイヤーの更新 ---
        currentMaxPlayerSpeed = Math.min(currentMaxPlayerSpeed + speedIncreaseRate, finalMaxPlayerSpeed); // 最高速度を時間経過で上げる
        playerSpeed = Math.min(playerSpeed + playerAcceleration, currentMaxPlayerSpeed); // 常に加速
        if (keys.ArrowDown) playerSpeed = Math.max(playerSpeed - playerAcceleration * 2, -currentMaxPlayerSpeed / 2); // ブレーキは強化
        
        playerSpeed *= friction;
        playerBoost *= boostFriction; // ブーストは時間とともに減衰
        if (playerBoost < 0.1) playerBoost = 0;

        const totalSpeed = playerSpeed + playerBoost;

        if (keys.ArrowLeft && playerCar.position.x > -roadWidth / 2 + 1) playerCar.position.x -= turnSpeed * 3;
        if (keys.ArrowRight && playerCar.position.x < roadWidth / 2 - 1) playerCar.position.x += turnSpeed * 3;
        
        playerCar.position.z -= totalSpeed;
        playerBox.setFromObject(playerCar);

        // --- 動く障害物の更新 ---
        for (const obstacle of obstacles) {
            if (obstacle.isMovable) {
                // 障害物を動かす
                obstacle.mesh.position.x += obstacle.speed * obstacle.direction;

                // 移動範囲の境界チェック
                if (Math.abs(obstacle.mesh.position.x - obstacle.startX) > obstacle.moveRange) {
                    obstacle.direction *= -1; // 方向を反転
                }

                // 安全のための道路境界チェック
                const halfRoad = roadWidth / 2 - 1.5; // 障害物の幅の半分を考慮
                if (obstacle.mesh.position.x > halfRoad || obstacle.mesh.position.x < -halfRoad) {
                    obstacle.direction *= -1;
                     // 位置を境界内に強制的に戻す
                    obstacle.mesh.position.x = Math.max(-halfRoad, Math.min(halfRoad, obstacle.mesh.position.x));
                }

                // バウンディングボックスを更新
                obstacle.box.setFromObject(obstacle.mesh);
            }
        }

        // --- 敵の車の更新 ---
        let aiTargetX = aiCar.position.x;
        for (const obstacle of obstacles) {
            if (obstacle.mesh.position.z < aiCar.position.z && obstacle.mesh.position.z > aiCar.position.z - 30) {
                const lateralDist = obstacle.mesh.position.x - aiCar.position.x;
                if (Math.abs(lateralDist) < 3) {
                    aiTargetX -= Math.sign(lateralDist) * 5;
                }
            }
        }
        aiCar.position.x = THREE.MathUtils.lerp(aiCar.position.x, aiTargetX, 0.1);
        aiCar.position.z -= aiSpeed;

        // --- 障害物との衝突判定 ---
        for (const obstacle of obstacles) {
            if (!obstacle.isHit && playerBox.intersectsBox(obstacle.box)) {
                obstacle.isHit = true; // 一度ヒットしたらフラグを立てる
                playerHP -= 20; // HPを減らす (5回でゲームオーバー)
                playerSpeed *= 0.7; // 速度を半減
                playerBoost = 0; // ブーストもリセット
                hpBarElement.style.width = playerHP + '%';
                scene.remove(obstacle.mesh); // ぶつかった障害物を消す
                obstacle.box.makeEmpty(); // 判定をなくす
                if (playerHP <= 0) {
                    gameState = 'ended';
                    displayGameOverScreen("GAME OVER");
                }
                break; 
            }
        }
        
        // --- ゴール判定 ---
        if (playerCar.position.z < finishLineZ) {
            gameState = 'ended';
            const finalTime = ((Date.now() - startTime) / 1000).toFixed(2);
            displayGameOverScreen("YOU WIN!", `タイム: ${finalTime}秒`);
        }
        if (aiCar.position.z < finishLineZ) {
            gameState = 'ended';
            displayGameOverScreen("YOU LOSE!");
        }

        // --- UIの更新 ---
        const elapsedTime = Date.now() - startTime;
        timerElement.innerText = `タイム: ${(elapsedTime / 1000).toFixed(2)}`;
        raceInfoElement.innerText = `GOALまで: ${Math.max(0, Math.round(playerCar.position.z - finishLineZ))}m`;
        speedometerElement.innerText = `速度: ${Math.round(totalSpeed * 60)} km/h`; // 合計速度をメーターに反映
    }

    // --- カメラの更新 (常に実行) ---
    const cameraOffset = new THREE.Vector3(0, 5, 12);
    camera.position.x = playerCar.position.x;
    camera.position.y = playerCar.position.y + cameraOffset.y;
    camera.position.z = playerCar.position.z + cameraOffset.z;
    camera.lookAt(playerCar.position);

    // レンダリング
    renderer.render(scene, camera);
}

// ゲームオーバー画面を表示する関数
const gameOverScreen = document.getElementById('game-over-screen');
const gameOverMessage = document.getElementById('game-over-message');
const finalTimeMessageElement = document.getElementById('final-time-message');
const resetButton = document.getElementById('reset-button');

function displayGameOverScreen(message, finalTime = "") {
    gameOverScreen.style.display = 'flex';
    gameOverMessage.innerText = message;
    finalTimeMessageElement.innerText = finalTime;
    raceInfoElement.style.display = 'none';
    hpBarElement.parentElement.style.display = 'none'; // hp-bar-containerを隠す
    timerElement.style.display = 'none'; // ライブタイマーを隠す
}

// リセットボタンのイベントリスナー
resetButton.addEventListener('click', () => {
    location.reload(); // ページをリロードしてゲームをリスタート
});

// --- 5. ゲーム開始処理 ---
function startCountdown() {
    let count = 3;

    const tick = () => {
        // アニメーションクラスを一旦削除し、reflowを強制してから再度追加する
        countdownElement.classList.remove('tick');
        void countdownElement.offsetWidth; // Reflowを強制するハック
        countdownElement.classList.add('tick');

        if (count > 0) {
            countdownElement.innerText = count;
        } else if (count === 0) {
            countdownElement.innerText = 'GO!';
        } else {
            countdownElement.style.display = 'none';
            gameState = 'running';
            startTime = Date.now(); // タイマーを開始
            return; // カウントダウン終了
        }
        count--;
        setTimeout(tick, 1000); // 1秒後に次のtickを呼ぶ
    };

    tick(); // 最初のtickを開始
}

raceInfoElement.innerText = `GOALまで: ${Math.round(playerCar.position.z - finishLineZ)}m`;
animate();
startCountdown();