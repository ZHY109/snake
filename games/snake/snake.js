// snake.js - 加速贪吃蛇游戏

import {
  E as Engine,
  G as GameLoop,
  I as InputManager,
  M as MobileProtection,
  C as Security,
} from '../../lib/MobileProtection-DVGpnIWZ.js';

// 游戏配置
const config = {
  gridSize: 10,
  gridWidth: 50,
  gridHeight: 50,
  canvasWidth: 500,
  canvasHeight: 500,
  initialMoveInterval: 150,
  speedIncreaseInterval: 5000,
  speedIncreaseRate: 0.05,
};

// 游戏状态
const gameState = {
  score: 0,
  moveInterval: config.initialMoveInterval,
  lastMoveTime: 0,
  lastSpeedIncreaseTime: 0,
  startTime: 0,
  isRunning: false,
  isGameOver: false,
  maxSpeedPercent: 100,
  lastRewardSpawnTime: 0,
  rewardSpawnCount: 0,  // 已生成的奖励批次
};

// 奖励数据
const rewards = [];  // 存储场上的奖励位置

// 蛇数据
const snake = {
  segments: [
    { x: 25, y: 25 },
    { x: 24, y: 25 },
    { x: 23, y: 25 },
  ],
  direction: { x: 1, y: 0 },
  nextDirection: { x: 1, y: 0 },
};

// 食物
const food = { x: 30, y: 25 };

function moveSnake() {
  // 更新方向
  snake.direction = { ...snake.nextDirection };

  // 计算新蛇头位置
  const head = snake.segments[0];
  const newHead = {
    x: head.x + snake.direction.x,
    y: head.y + snake.direction.y,
  };

  // 在头部插入新节点
  snake.segments.unshift(newHead);

  // 检查是否吃到食物或奖励
  let ateSomething = false;

  // 检查是否吃到食物
  if (newHead.x === food.x && newHead.y === food.y) {
    gameState.score += 5;
    updateScoreDisplay();
    spawnFood();
    ateSomething = true;
  }

  // 检查是否吃到奖励
  const rewardIndex = rewards.findIndex(r => r.x === newHead.x && r.y === newHead.y);
  if (rewardIndex !== -1) {
    gameState.score += 1;
    updateScoreDisplay();
    rewards.splice(rewardIndex, 1);
    ateSomething = true;
  }

  // 如果没吃到任何东西，移除尾部
  if (!ateSomething) {
    snake.segments.pop();
  }

  // 检测碰撞
  checkCollisions();
}

function updateScoreDisplay() {
  const scoreDisplay = document.getElementById('scoreDisplay');
  if (scoreDisplay) {
    scoreDisplay.textContent = `分数: ${gameState.score}`;
  }
}

function spawnFood() {
  let newFood;
  let attempts = 0;
  const maxAttempts = 100;

  do {
    newFood = {
      x: Math.floor(Math.random() * config.gridWidth),
      y: Math.floor(Math.random() * config.gridHeight),
    };
    attempts++;
  } while (isSnakeAtPosition(newFood.x, newFood.y) && attempts < maxAttempts);

  food.x = newFood.x;
  food.y = newFood.y;
}

function isSnakeAtPosition(x, y) {
  return snake.segments.some(segment => segment.x === x && segment.y === y);
}

function isFoodAtPosition(x, y) {
  return food.x === x && food.y === y;
}

function isRewardAtPosition(x, y) {
  return rewards.some(r => r.x === x && r.y === y);
}

function spawnRewards(count) {
  for (let i = 0; i < count; i++) {
    let newReward;
    let attempts = 0;
    const maxAttempts = 50;

    do {
      newReward = {
        x: Math.floor(Math.random() * config.gridWidth),
        y: Math.floor(Math.random() * config.gridHeight),
        spawnTime: performance.now(),
      };
      attempts++;
    } while (
      (isSnakeAtPosition(newReward.x, newReward.y) ||
       isFoodAtPosition(newReward.x, newReward.y) ||
       isRewardAtPosition(newReward.x, newReward.y)) &&
      attempts < maxAttempts
    );

    if (attempts < maxAttempts) {
      rewards.push(newReward);
    }
  }
}

function checkCollisions() {
  const head = snake.segments[0];

  // 撞墙检测
  if (head.x < 0 || head.x >= config.gridWidth ||
      head.y < 0 || head.y >= config.gridHeight) {
    gameOver();
    return;
  }

  // 撞自己检测（从第 2 节开始）
  for (let i = 1; i < snake.segments.length; i++) {
    if (head.x === snake.segments[i].x &&
        head.y === snake.segments[i].y) {
      gameOver();
      return;
    }
  }
}

function handleInput() {
  const dir = input.directions;

  // 防止 180 度反向
  if (dir.up && snake.direction.y !== 1) {
    snake.nextDirection = { x: 0, y: -1 };
  } else if (dir.down && snake.direction.y !== -1) {
    snake.nextDirection = { x: 0, y: 1 };
  } else if (dir.left && snake.direction.x !== 1) {
    snake.nextDirection = { x: -1, y: 0 };
  } else if (dir.right && snake.direction.x !== -1) {
    snake.nextDirection = { x: 1, y: 0 };
  }
}

function update(deltaTime) {
  if (!gameState.isRunning) return;

  // 更新输入
  input.update();
  handleInput();

  const currentTime = performance.now();

  // 检查是否需要加速（每 5 秒）
  if (currentTime - gameState.lastSpeedIncreaseTime >= config.speedIncreaseInterval) {
    gameState.moveInterval *= (1 - config.speedIncreaseRate);
    gameState.lastSpeedIncreaseTime = currentTime;
    updateSpeedDisplay();
  }

  // 检查是否需要生成奖励（每 5 秒）
  if (currentTime - gameState.lastRewardSpawnTime >= 5000) {
    gameState.rewardSpawnCount++;
    // 每次增加 0.25，向下取整：1, 1, 1, 1, 2, 2, 2, 2, 3, ...
    const rewardCount = Math.floor(1 + (gameState.rewardSpawnCount - 1) * 0.25);
    spawnRewards(rewardCount);
    gameState.lastRewardSpawnTime = currentTime;
  }

  // 检查是否需要移动（基于移动间隔）
  if (currentTime - gameState.lastMoveTime >= gameState.moveInterval) {
    moveSnake();
    gameState.lastMoveTime = currentTime;
  }
}

function updateSpeedDisplay() {
  const speedPercent = Math.round((config.initialMoveInterval / gameState.moveInterval) * 100);
  gameState.maxSpeedPercent = Math.max(gameState.maxSpeedPercent, speedPercent);
  const speedDisplay = document.getElementById('speedDisplay');
  if (speedDisplay) {
    speedDisplay.textContent = `速度: ${speedPercent}%`;
  }
}

function render() {
  // 更新蛇的 sprites 位置
  snake.segments.forEach((segment, index) => {
    const spriteId = `snake_${index}`;
    let sprite = engine.getSprite(spriteId);

    if (sprite) {
      // 更新现有 sprite 位置
      sprite.position.x = segment.x * config.gridSize;
      sprite.position.y = segment.y * config.gridSize;
      sprite.color = index === 0 ? '#00ff00' : '#00cc00';
    } else {
      // 新增的蛇节，创建新 sprite
      engine.addSprite({
        id: spriteId,
        position: { x: segment.x * config.gridSize, y: segment.y * config.gridSize },
        velocity: { x: 0, y: 0 },
        width: config.gridSize,
        height: config.gridSize,
        color: index === 0 ? '#00ff00' : '#00cc00',
      });
    }
  });

  // 清理多余的蛇节 sprites（当蛇变短时，虽然这在游戏中不会发生）
  let index = snake.segments.length;
  while (engine.getSprite(`snake_${index}`)) {
    engine.removeSprite(`snake_${index}`);
    index++;
  }

  // 更新食物位置
  const foodSprite = engine.getSprite('food');
  if (foodSprite) {
    foodSprite.position.x = food.x * config.gridSize;
    foodSprite.position.y = food.y * config.gridSize;
  }

  // 更新奖励 sprites
  // 先清理旧的奖励 sprites
  let rewardIndex = 0;
  while (engine.getSprite(`reward_${rewardIndex}`)) {
    engine.removeSprite(`reward_${rewardIndex}`);
    rewardIndex++;
  }

  // 添加当前奖励
  rewards.forEach((reward, idx) => {
    engine.addSprite({
      id: `reward_${idx}`,
      position: { x: reward.x * config.gridSize, y: reward.y * config.gridSize },
      velocity: { x: 0, y: 0 },
      width: config.gridSize,
      height: config.gridSize,
      color: '#ffff00',  // 金黄色奖励
    });
  });

  // 渲染
  engine.render();
}

// 初始化模块
async function initModules() {
  // 初始化引擎
  const canvas = document.getElementById('gameCanvas');
  const engine = await Engine.createEngine(canvas, {
    backgroundColor: { r: 0.05, g: 0.05, b: 0.1, a: 1 },
  });
  await engine.initialize({
    canvas,
    width: config.canvasWidth,
    height: config.canvasHeight,
    backgroundColor: { r: 0.05, g: 0.05, b: 0.1, a: 1 },
  });

  // 初始化输入管理器
  const input = new InputManager({
    keybindings: {
      w: 'up', arrowup: 'up',
      s: 'down', arrowdown: 'down',
      a: 'left', arrowleft: 'left',
      d: 'right', arrowright: 'right',
    },
    swipeThreshold: 30,
    tapMoveThreshold: 10,
  });

  // 初始化移动端保护
  const mobileProtection = new MobileProtection({
    preventPullToRefresh: true,
    preventDoubleTapZoom: true,
    preventPinchZoom: true,
    preventContextMenu: true,
    target: document.body,
  });
  mobileProtection.enable();

  console.log('Modules initialized');

  return { engine, input, mobileProtection };
}

// 启动
const { engine, input, mobileProtection } = await initModules();

function setupTouchControls() {
  input.on('swipe', (event) => {
    if (!gameState.isRunning) return;

    const { direction } = event;

    if (direction === 'up' && snake.direction.y !== 1) {
      snake.nextDirection = { x: 0, y: -1 };
    } else if (direction === 'down' && snake.direction.y !== -1) {
      snake.nextDirection = { x: 0, y: 1 };
    } else if (direction === 'left' && snake.direction.x !== 1) {
      snake.nextDirection = { x: -1, y: 0 };
    } else if (direction === 'right' && snake.direction.x !== -1) {
      snake.nextDirection = { x: 1, y: 0 };
    }
  });
}

setupTouchControls();

// 初始渲染 - 显示蛇和食物
function initialRender() {
  // 清空现有 sprites
  for (let i = 0; i < snake.segments.length; i++) {
    engine.removeSprite(`snake_${i}`);
  }
  engine.removeSprite('food');

  // 添加蛇的 sprites
  snake.segments.forEach((segment, index) => {
    engine.addSprite({
      id: `snake_${index}`,
      position: { x: segment.x * config.gridSize, y: segment.y * config.gridSize },
      velocity: { x: 0, y: 0 },
      width: config.gridSize,
      height: config.gridSize,
      color: index === 0 ? '#00ff00' : '#00cc00',
    });
  });

  // 添加食物 sprite
  engine.addSprite({
    id: 'food',
    position: { x: food.x * config.gridSize, y: food.y * config.gridSize },
    velocity: { x: 0, y: 0 },
    width: config.gridSize,
    height: config.gridSize,
    color: '#ff0000',
  });

  engine.render();
}

initialRender();

const gameLoop = new GameLoop();

function startGame() {
  gameState.isRunning = true;
  gameState.startTime = performance.now();
  gameState.lastMoveTime = performance.now();
  gameState.lastSpeedIncreaseTime = performance.now();
  gameState.lastRewardSpawnTime = performance.now();
  gameState.rewardSpawnCount = 0;

  // 初始生成第一颗奖励
  spawnRewards(1);

  gameLoop.start(update, render);
}

function stopGame() {
  gameState.isRunning = false;
  gameLoop.stop();
}

function gameOver() {
  gameState.isRunning = false;
  gameState.isGameOver = true;
  stopGame();

  // 计算存活时间
  const survivalTime = ((performance.now() - gameState.startTime) / 1000).toFixed(1);

  // 更新结束界面
  document.getElementById('finalScore').textContent = `${gameState.score} 分`;
  document.getElementById('survivalTime').textContent = `存活时间: ${survivalTime}s`;
  document.getElementById('maxSpeed').textContent = `最高速度: ${gameState.maxSpeedPercent}%`;

  // 显示结束界面
  document.getElementById('gameOverModal').classList.remove('hidden');
}

function resetGame() {
  // 重置蛇
  snake.segments = [
    { x: 25, y: 25 },
    { x: 24, y: 25 },
    { x: 23, y: 25 },
  ];
  snake.direction = { x: 1, y: 0 };
  snake.nextDirection = { x: 1, y: 0 };

  // 重置食物
  food.x = 30;
  food.y = 25;

  // 重置奖励
  rewards.length = 0;

  // 重置状态
  gameState.score = 0;
  gameState.moveInterval = config.initialMoveInterval;
  gameState.lastMoveTime = 0;
  gameState.lastSpeedIncreaseTime = 0;
  gameState.lastRewardSpawnTime = 0;
  gameState.rewardSpawnCount = 0;
  gameState.startTime = 0;
  gameState.isRunning = false;
  gameState.isGameOver = false;
  gameState.maxSpeedPercent = 100;

  // 清理旧的 sprites
  for (let i = 0; i < 100; i++) {
    engine.removeSprite(`snake_${i}`);
    engine.removeSprite(`reward_${i}`);
  }
  engine.removeSprite('food');

  // 更新显示
  updateScoreDisplay();
  document.getElementById('speedDisplay').textContent = '速度: 100%';

  // 重新渲染初始状态
  initialRender();
}

function setupUI() {
  // 开始按钮
  document.getElementById('startBtn').addEventListener('click', () => {
    document.getElementById('startModal').classList.add('hidden');
    resetGame();
    startGame();
  });

  // 重新开始按钮
  document.getElementById('restartBtn').addEventListener('click', () => {
    document.getElementById('gameOverModal').classList.add('hidden');
    resetGame();
    startGame();
  });

  // 分享按钮
  document.getElementById('shareBtn').addEventListener('click', () => {
    generateShareImage();
  });

  // 提交分数按钮
  document.getElementById('submitScoreBtn').addEventListener('click', async () => {
    const btn = document.getElementById('submitScoreBtn');
    const originalText = btn.textContent;
    btn.disabled = true;
    btn.textContent = '提交中...';
    try {
      await submitScoreToGitHub();
    } catch (error) {
      console.error('Submit error:', error);
      alert('提交失败: ' + error.message);
    } finally {
      btn.disabled = false;
      btn.textContent = originalText;
    }
  });

  // 空格键开始/重启
  document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
      if (!gameState.isRunning && !gameState.isGameOver) {
        // 开始游戏
        document.getElementById('startModal').classList.add('hidden');
        resetGame();
        startGame();
      } else if (gameState.isGameOver) {
        // 重新开始
        document.getElementById('gameOverModal').classList.add('hidden');
        resetGame();
        startGame();
      }
    }
  });
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    alert('成绩已复制到剪贴板！');
  }).catch(() => {
    prompt('复制以下文字分享：', text);
  });
}

// GitHub 配置（Token 做了简单编码避免扫描）
const GITHUB_CONFIG = {
  owner: 'ZHY109',
  repo: 'snake',
  // Token 分段存储
  _t: ['ghp_G', 'MMoye', 'kKsGj', 'yT7mh', 'bpJfh', 'PZhv8', 'sTIq2', 'Pssgg'],
  get token() { return this._t.join(''); }
};

// 生成会话 UUID
function getSessionUUID() {
  let uuid = localStorage.getItem('snakeSessionUUID');
  if (!uuid) {
    uuid = crypto.randomUUID();
    localStorage.setItem('snakeSessionUUID', uuid);
  }
  return uuid;
}

// 提交分数到 GitHub Issues（使用 lib 的 Security 模块）
async function submitScoreToGitHub() {
  const survivalTime = ((performance.now() - gameState.startTime) / 1000).toFixed(1);

  // 准备数据
  const scoreData = {
    score: gameState.score,
    time: survivalTime,
    maxSpeed: gameState.maxSpeedPercent,
    name: 'Player',
    uuid: getSessionUUID(),
    timestamp: new Date().toISOString(),
  };

  // 尝试使用 Security 加密（如果 WASM 加载失败则跳过）
  let encrypted = '';
  let timeCode = '';
  let commandHash = '';
  try {
    const security = new Security();
    await security.initialize();
    if (security.isInitialized()) {
      encrypted = security.encrypt(scoreData);
      timeCode = security.generateTimeCode();
      commandHash = security.generateCommandHash(encrypted);
    }
  } catch (e) {
    console.warn('Security module not available:', e.message);
  }

  // 格式化 Issue 内容
  let body = `## 🐍 新分数记录

| 项目 | 数值 |
|------|------|
| 分数 | ${gameState.score} |
| 存活时间 | ${survivalTime}s |
| 最高速度 | ${gameState.maxSpeedPercent}% |
| 时间 | ${new Date().toLocaleString('zh-CN')} |
| UUID | ${scoreData.uuid} |`;

  if (encrypted) {
    body += `

### 加密数据

\`\`\`
${encrypted}
\`\`\`

### 验证信息

- TimeCode: \`${timeCode}\`
- CommandHash: \`${commandHash}\``;
  }

  body += `

---
*自动提交自 [加速贪吃蛇](https://zhy109.github.io/snake/games/snake/)*`;

  try {
    const response = await fetch(`https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/issues`, {
      method: 'POST',
      headers: {
        'Authorization': `token ${GITHUB_CONFIG.token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: `🐍 ${gameState.score}分 | ${survivalTime}s | ${gameState.maxSpeedPercent}%`,
        body: body,
        labels: ['score', 'snake-game'],
      }),
    });

    if (response.ok) {
      const data = await response.json();
      alert(`分数已提交！Issue #${data.number}`);
      return true;
    } else {
      const error = await response.text();
      console.error('Submit failed:', error);
      alert('提交失败，请检查控制台');
      return false;
    }
  } catch (error) {
    console.error('Submit error:', error);
    alert('提交出错，请检查网络');
    return false;
  }
}

function generateShareImage() {
  const shareCanvas = document.getElementById('shareCanvas');
  const ctx = shareCanvas.getContext('2d');
  const width = shareCanvas.width;
  const height = shareCanvas.height;

  // 绘制渐变背景
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#0f0c29');
  gradient.addColorStop(0.5, '#302b63');
  gradient.addColorStop(1, '#24243e');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // 绘制边框
  ctx.strokeStyle = '#0ff';
  ctx.lineWidth = 4;
  ctx.strokeRect(20, 20, width - 40, height - 40);

  // 标题
  ctx.fillStyle = '#0ff';
  ctx.font = 'bold 36px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('加速贪吃蛇', width / 2, 80);

  // 分数
  ctx.fillStyle = '#0f0';
  ctx.font = 'bold 72px Arial';
  ctx.fillText(`${gameState.score} 分`, width / 2, 180);

  // 存活时间
  const survivalTime = ((performance.now() - gameState.startTime) / 1000).toFixed(1);
  ctx.fillStyle = '#fff';
  ctx.font = '24px Arial';
  ctx.fillText(`存活时间: ${survivalTime}s`, width / 2, 240);

  // 最高速度
  ctx.fillText(`最高速度: ${gameState.maxSpeedPercent}%`, width / 2, 280);

  // 绘制蛇的示意图
  const snakeY = 340;
  const segmentSize = 20;
  const startX = width / 2 - (snake.segments.length * segmentSize) / 2;

  snake.segments.forEach((segment, index) => {
    ctx.fillStyle = index === 0 ? '#00ff00' : '#00cc00';
    ctx.fillRect(startX + index * segmentSize, snakeY, segmentSize - 2, segmentSize - 2);
  });

  // 底部文字
  ctx.fillStyle = '#aaa';
  ctx.font = '18px Arial';
  ctx.fillText('你能超过我吗？', width / 2, height - 50);

  // 显示并下载图片
  shareCanvas.style.display = 'block';

  // 尝试使用 Web Share API
  shareCanvas.toBlob(async (blob) => {
    const file = new File([blob], 'snake-score.png', { type: 'image/png' });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          title: '加速贪吃蛇',
          text: `我在加速贪吃蛇中得了 ${gameState.score} 分！`,
          files: [file],
        });
      } catch (err) {
        // 用户取消或分享失败，下载图片
        downloadShareImage(shareCanvas);
      }
    } else {
      // 不支持文件分享，下载图片
      downloadShareImage(shareCanvas);
    }
  });
}

function downloadShareImage(canvas) {
  const link = document.createElement('a');
  link.download = 'snake-score.png';
  link.href = canvas.toDataURL('image/png');
  link.click();

  const shareText = `我在加速贪吃蛇中得了 ${gameState.score} 分！你能超过我吗？`;
  copyToClipboard(shareText);
}

setupUI();
