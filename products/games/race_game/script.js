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
const obstacleGeo = new THREE.BoxGeometry(3, 2, 3);
const obstacleMat = new THREE.MeshStandardMaterial({ color: 0x8B4513 }); // 茶色
for (let i = 0; i < 50; i++) {
    const obstacle = new THREE.Mesh(obstacleGeo, obstacleMat);
    obstacle.position.set(
        (Math.random() - 0.5) * (roadWidth - 4),
        1,
        -(Math.random() * (roadLength - 100) + 50) // スタートとゴール付近を避ける
    );
    scene.add(obstacle);
    obstacles.push({ mesh: obstacle, box: new THREE.Box3().setFromObject(obstacle) });
}

// --- 3. ゲームロジック ---

const raceInfoElement = document.getElementById('race-info');
const hpBarElement = document.getElementById('hp-bar');
const countdownElement = document.getElementById('countdown');
const speedometerElement = document.getElementById('speedometer'); // 新しい要素

const keys = { ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false };

let playerSpeed = 0;
const initialMaxPlayerSpeed = 2.5; // 少し減速
const finalMaxPlayerSpeed = 1.5; // 最終的な最高速度 (AIの2倍以上)
let currentMaxPlayerSpeed = initialMaxPlayerSpeed; // 現在の最高速度
const playerAcceleration = 0.08; // 加速を緩やかにする
const speedIncreaseRate = 0.002; // 速度が上がる割合をさらに速くする
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
        // --- プレイヤーの更新 ---
        currentMaxPlayerSpeed = Math.min(currentMaxPlayerSpeed + speedIncreaseRate, finalMaxPlayerSpeed); // 最高速度を時間経過で上げる
        playerSpeed = Math.min(playerSpeed + playerAcceleration, currentMaxPlayerSpeed); // 常に加速
        if (keys.ArrowDown) playerSpeed = Math.max(playerSpeed - playerAcceleration * 2, -currentMaxPlayerSpeed / 2); // ブレーキは強化
        playerSpeed *= friction;

        if (keys.ArrowLeft && playerCar.position.x > -roadWidth / 2 + 1) playerCar.position.x -= turnSpeed * 3;
        if (keys.ArrowRight && playerCar.position.x < roadWidth / 2 - 1) playerCar.position.x += turnSpeed * 3;
        
        playerCar.position.z -= playerSpeed;
        playerBox.setFromObject(playerCar);

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

        // --- 衝突判定 ---
        for (const obstacle of obstacles) {
            if (playerBox.intersectsBox(obstacle.box)) {
            playerHP -= 25; // HPを減らす
            playerSpeed *= 0.5; // 速度を半減
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
            displayGameOverScreen("YOU WIN!");
        }
        if (aiCar.position.z < finishLineZ) {
            gameState = 'ended';
            displayGameOverScreen("YOU LOSE!");
        }

        // --- UIの更新 ---
        raceInfoElement.innerText = `GOALまで: ${Math.max(0, Math.round(playerCar.position.z - finishLineZ))}m`;
        speedometerElement.innerText = `速度: ${Math.round(playerSpeed * 60)} km/h`; // 速度メーターを更新
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
const resetButton = document.getElementById('reset-button');

function displayGameOverScreen(message) {
    gameOverScreen.style.display = 'flex';
    gameOverMessage.innerText = message;
    raceInfoElement.style.display = 'none';
    hpBarElement.parentElement.style.display = 'none'; // hp-bar-containerを隠す
    
    // リセットボタンのイベントリスナー
    resetButton.addEventListener('click', () => {
        location.reload(); // ページをリロードしてゲームをリスタート
    });
}

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