const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startButton = document.getElementById('startButton');
const scoreElement = document.getElementById('score');

// キャンバスのサイズ設定
canvas.width = 800;
canvas.height = 600;

// ゲームの状態
let gameRunning = false;
let score = 0;

// パドルの設定
const paddle = {
    width: 100,
    height: 20,
    x: canvas.width / 2 - 50,
    y: canvas.height - 30,
    dx: 8
};

// ボールの設定
const ball = {
    x: canvas.width / 2,
    y: canvas.height - 50,
    radius: 10,
    dx: 4,
    dy: -4
};

// ブロックの設定
const blockRowCount = 5;
const blockColumnCount = 10;
const blockPadding = 8;
const blockWidth = Math.floor((canvas.width - (blockColumnCount - 1) * blockPadding - 2 * 8) / blockColumnCount);
const blockHeight = 24;
const blockOffsetTop = 30;
const blockOffsetLeft = 8;

// カラフルな色リスト
const blockColors = [
  '#e57373', // 赤
  '#f06292', // ピンク
  '#ba68c8', // 紫
  '#64b5f6', // 青
  '#4db6ac', // エメラルド
  '#81c784', // 緑
  '#ffd54f', // 黄
  '#ffb74d', // オレンジ
  '#a1887f', // 茶
  '#90a4ae'  // グレー
];

// ブロック配列生成
const blocks = [];
for (let c = 0; c < blockColumnCount; c++) {
  blocks[c] = [];
  for (let r = 0; r < blockRowCount; r++) {
    // 色をランダムまたは順番で割り当て
    const color = blockColors[(c + r) % blockColors.length];
    blocks[c][r] = { x: 0, y: 0, color, status: 1 };
  }
}

// キーボード入力の処理
let rightPressed = false;
let leftPressed = false;

document.addEventListener('keydown', keyDownHandler);
document.addEventListener('keyup', keyUpHandler);
document.addEventListener('mousemove', mouseMoveHandler);

function keyDownHandler(e) {
    if (e.key === 'Right' || e.key === 'ArrowRight') {
        rightPressed = true;
    } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
        leftPressed = true;
    }
}

function keyUpHandler(e) {
    if (e.key === 'Right' || e.key === 'ArrowRight') {
        rightPressed = false;
    } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
        leftPressed = false;
    }
}

function mouseMoveHandler(e) {
    const relativeX = e.clientX - canvas.offsetLeft;
    if (relativeX > 0 && relativeX < canvas.width) {
        paddle.x = relativeX - paddle.width / 2;
    }
}

// 衝突判定
function collisionDetection() {
    for (let c = 0; c < blockColumnCount; c++) {
        for (let r = 0; r < blockRowCount; r++) {
            const b = blocks[c][r];
            if (b.status === 1) {
                if (ball.x > b.x && ball.x < b.x + blockWidth && ball.y > b.y && ball.y < b.y + blockHeight) {
                    ball.dy = -ball.dy;
                    b.status = 0;
                    score++;
                    scoreElement.textContent = score;

                    if (score === blockRowCount * blockColumnCount) {
                        alert('おめでとうございます！ゲームクリア！');
                        document.location.reload();
                    }
                }
            }
        }
    }
}

// パドルの描画
function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddle.x, paddle.y, paddle.width, paddle.height);
    ctx.fillStyle = '#0095DD';
    ctx.fill();
    ctx.closePath();
}

// ボールの描画
function drawBall() {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#0095DD';
    ctx.fill();
    ctx.closePath();
}

// ブロックの描画
function drawBlocks() {
    for (let c = 0; c < blockColumnCount; c++) {
        for (let r = 0; r < blockRowCount; r++) {
            const block = blocks[c][r];
            if (block.status === 1) {
                const blockX = c * (blockWidth + blockPadding) + blockOffsetLeft;
                const blockY = r * (blockHeight + blockPadding) + blockOffsetTop;
                block.x = blockX;
                block.y = blockY;
                ctx.beginPath();
                ctx.rect(blockX, blockY, blockWidth, blockHeight);
                ctx.fillStyle = block.color;
                ctx.fill();
                ctx.closePath();
            }
        }
    }
}

// ゲームリセット関数
function resetGame() {
    // スコアリセット
    score = 0;
    scoreElement.textContent = score;
    // ブロックリセット
    for (let c = 0; c < blockColumnCount; c++) {
        for (let r = 0; r < blockRowCount; r++) {
            blocks[c][r].status = 1;
        }
    }
    // パドル初期位置
    paddle.x = canvas.width / 2 - paddle.width / 2;
    paddle.y = canvas.height - 30;
    // ボール初期位置
    ball.x = canvas.width / 2;
    ball.y = canvas.height - 50;
    ball.dx = 4;
    ball.dy = -4;
    // ゲーム状態
    gameRunning = false;
    // スタートボタン復活
    startButton.textContent = 'ゲーム開始';
    startButton.disabled = false;
    // 画面初期化
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBlocks();
    drawBall();
    drawPaddle();
}

// ゲームのメインループ
function draw() {
    if (!gameRunning) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBlocks();
    drawBall();
    drawPaddle();
    collisionDetection();

    // ボールの移動
    if (ball.x + ball.dx > canvas.width - ball.radius || ball.x + ball.dx < ball.radius) {
        ball.dx = -ball.dx;
    }
    if (ball.y + ball.dy < ball.radius) {
        ball.dy = -ball.dy;
    } else if (ball.y + ball.dy > canvas.height - ball.radius) {
        if (ball.x > paddle.x && ball.x < paddle.x + paddle.width) {
            ball.dy = -ball.dy;
        } else {
            alert('ゲームオーバー');
            resetGame();
        }
    }

    // パドルの移動
    if (rightPressed && paddle.x < canvas.width - paddle.width) {
        paddle.x += paddle.dx;
    } else if (leftPressed && paddle.x > 0) {
        paddle.x -= paddle.dx;
    }

    ball.x += ball.dx;
    ball.y += ball.dy;

    requestAnimationFrame(draw);
}

// ゲーム開始ボタンの処理
startButton.addEventListener('click', () => {
    if (!gameRunning) {
        gameRunning = true;
        startButton.textContent = 'ゲーム中...';
        startButton.disabled = true;
        draw();
    }
}); 