# 加速贪吃蛇游戏实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现一个加速版贪吃蛇游戏，蛇每 5 秒加速 5%，使用现有 lib 模块

**Architecture:** 单页 HTML 应用，使用 lib 中的 Engine 渲染、InputManager 处理输入、GameLoop 驱动主循环、ScoreDisplay 显示分数、ShareCard 生成分享卡片、MobileProtection 防止移动端误触

**Tech Stack:** Vanilla JavaScript + lib 模块 (Engine, InputManager, GameLoop, ScoreDisplay, ShareCard, MobileProtection)

---

## 文件结构

```
games/
  snake/
    index.html        ← 游戏入口 HTML
    snake.js          ← 游戏主逻辑
    style.css         ← 样式
```

---

### Task 1: 创建项目基础结构

**Files:**
- Create: `games/snake/index.html`
- Create: `games/snake/style.css`
- Create: `games/snake/snake.js`

- [ ] **Step 1: 创建目录结构**

```bash
mkdir -p games/snake
```

- [ ] **Step 2: 创建 HTML 入口文件**

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
  <title>加速贪吃蛇</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <!-- HUD -->
  <div id="hud">
    <score-display id="scoreDisplay"></score-display>
    <div id="speedDisplay">速度: 100%</div>
  </div>

  <!-- 游戏画布 -->
  <canvas id="gameCanvas" width="1000" height="1000"></canvas>

  <!-- 开始界面 -->
  <div id="startModal" class="modal">
    <div class="modal-content">
      <h1>加速贪吃蛇</h1>
      <p>每 5 秒速度增加 5%</p>
      <button id="startBtn">开始游戏</button>
    </div>
  </div>

  <!-- 游戏结束界面 -->
  <div id="gameOverModal" class="modal hidden">
    <div class="modal-content">
      <h2>游戏结束!</h2>
      <div id="finalScore">0</div>
      <div id="survivalTime">存活时间: 0s</div>
      <div id="maxSpeed">最高速度: 100%</div>
      <share-card id="shareCard"></share-card>
      <button id="restartBtn">重新开始</button>
    </div>
  </div>

  <script type="module" src="snake.js"></script>
</body>
</html>
```

- [ ] **Step 3: 创建 CSS 样式文件**

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: linear-gradient(135deg, #0f0c29, #302b63, #24243e);
  color: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
  touch-action: none;
}

#hud {
  display: flex;
  justify-content: space-between;
  width: 1000px;
  max-width: 100%;
  padding: 10px 20px;
  font-size: 24px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  margin-bottom: 10px;
}

#speedDisplay {
  color: #0ff;
}

#gameCanvas {
  border: 4px solid #0ff;
  border-radius: 8px;
  background: #000;
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.3);
}

/* Modal styles */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.modal.hidden {
  display: none;
}

.modal-content {
  background: linear-gradient(135deg, #1a1a2e, #16213e);
  padding: 40px;
  border-radius: 16px;
  text-align: center;
  border: 2px solid #0ff;
  min-width: 300px;
  box-shadow: 0 0 30px rgba(0, 255, 255, 0.4);
}

.modal-content h1, .modal-content h2 {
  color: #0ff;
  margin-bottom: 20px;
}

.modal-content p {
  color: #aaa;
  margin-bottom: 20px;
}

#finalScore {
  font-size: 64px;
  color: #0f0;
  margin: 20px 0;
  text-shadow: 0 0 10px #0f0;
}

#survivalTime, #maxSpeed {
  font-size: 18px;
  color: #ccc;
  margin: 10px 0;
}

.modal-content button {
  padding: 15px 40px;
  font-size: 20px;
  margin: 10px;
  border: 2px solid #0ff;
  background: transparent;
  color: #0ff;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.modal-content button:hover {
  background: #0ff;
  color: #000;
  box-shadow: 0 0 15px #0ff;
}

/* Responsive */
@media (max-width: 1020px) {
  #hud, #gameCanvas {
    width: 100%;
    max-width: 100%;
  }

  #gameCanvas {
    height: auto;
    aspect-ratio: 1;
  }
}
```

- [ ] **Step 4: 创建空的游戏逻辑文件**

```javascript
// snake.js - 加速贪吃蛇游戏
console.log('Snake game loaded');
```

- [ ] **Step 5: 提交基础结构**

```bash
git add games/snake/
git commit -m "feat: add snake game project structure"
```

---

### Task 2: 初始化游戏核心模块

**Files:**
- Modify: `games/snake/snake.js`

- [ ] **Step 1: 导入 lib 模块**

```javascript
// snake.js - 加速贪吃蛇游戏

import {
  E as Engine,
  G as GameLoop,
  I as InputManager,
  M as MobileProtection,
} from '../../lib/MobileProtection-DVGpnIWZ.js';

console.log('Modules imported');
```

- [ ] **Step 2: 初始化游戏配置和状态**

```javascript
// snake.js - 加速贪吃蛇游戏

import {
  E as Engine,
  G as GameLoop,
  I as InputManager,
  M as MobileProtection,
} from '../../lib/MobileProtection-DVGpnIWZ.js';

// 游戏配置
const config = {
  gridSize: 20,
  gridWidth: 50,
  gridHeight: 50,
  canvasWidth: 1000,
  canvasHeight: 1000,
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
};

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

console.log('Game initialized');
```

- [ ] **Step 3: 初始化 Engine 和 InputManager**

```javascript
// 在文件末尾添加

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
```

- [ ] **Step 4: 提交初始化代码**

```bash
git add games/snake/snake.js
git commit -m "feat: initialize game core modules"
```

---

### Task 3: 实现蛇的移动逻辑

**Files:**
- Modify: `games/snake/snake.js`

- [ ] **Step 1: 实现移动蛇的函数**

```javascript
// 在 snake 数据定义后添加

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

  // 检查是否吃到食物
  if (newHead.x === food.x && newHead.y === food.y) {
    // 吃到食物，不移除尾部
    gameState.score += 10;
    updateScoreDisplay();
    spawnFood();
  } else {
    // 没吃到，移除尾部
    snake.segments.pop();
  }
}

function updateScoreDisplay() {
  const scoreDisplay = document.getElementById('scoreDisplay');
  if (scoreDisplay) {
    scoreDisplay.setScore(gameState.score);
  }
}

function spawnFood() {
  // 简单实现：随机生成，后续优化避免与蛇身重叠
  food.x = Math.floor(Math.random() * config.gridWidth);
  food.y = Math.floor(Math.random() * config.gridHeight);
}
```

- [ ] **Step 2: 提交移动逻辑**

```bash
git add games/snake/snake.js
git commit -m "feat: implement snake movement logic"
```

---

### Task 4: 实现游戏循环和加速机制

**Files:**
- Modify: `games/snake/snake.js`

- [ ] **Step 1: 实现 GameLoop 和加速逻辑**

```javascript
// 在 initModules 函数前添加

function update(deltaTime) {
  if (!gameState.isRunning) return;

  // 更新输入
  input.update();

  const currentTime = performance.now();

  // 检查是否需要加速（每 5 秒）
  if (currentTime - gameState.lastSpeedIncreaseTime >= config.speedIncreaseInterval) {
    gameState.moveInterval *= (1 - config.speedIncreaseRate);
    gameState.lastSpeedIncreaseTime = currentTime;
    updateSpeedDisplay();
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
  // 清空画布
  engine.render();

  // 绘制食物
  drawFood();

  // 绘制蛇
  drawSnake();
}

function drawSnake() {
  snake.segments.forEach((segment, index) => {
    const pixelX = segment.x * config.gridSize;
    const pixelY = segment.y * config.gridSize;

    // 蛇头用不同颜色
    const color = index === 0 ? '#00ff00' : '#00cc00';

    engine.addSprite({
      id: `snake_${index}`,
      position: { x: pixelX, y: pixelY },
      width: config.gridSize,
      height: config.gridSize,
      color: color,
    });
  });
}

function drawFood() {
  engine.addSprite({
    id: 'food',
    position: {
      x: food.x * config.gridSize,
      y: food.y * config.gridSize,
    },
    width: config.gridSize,
    height: config.gridSize,
    color: '#ff0000',
  });
}
```

- [ ] **Step 2: 初始化 GameLoop**

```javascript
// 在启动代码后添加

const gameLoop = new GameLoop();

function startGame() {
  gameState.isRunning = true;
  gameState.startTime = performance.now();
  gameState.lastMoveTime = performance.now();
  gameState.lastSpeedIncreaseTime = performance.now();

  gameLoop.start(update, render);
}

function stopGame() {
  gameState.isRunning = false;
  gameLoop.stop();
}
```

- [ ] **Step 3: 提交游戏循环**

```bash
git add games/snake/snake.js
git commit -m "feat: implement game loop and acceleration"
```

---

### Task 5: 实现输入处理

**Files:**
- Modify: `games/snake/snake.js`

- [ ] **Step 1: 实现方向控制**

```javascript
// 在 update 函数前添加

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

// 在 update 函数中调用 handleInput
function update(deltaTime) {
  if (!gameState.isRunning) return;

  input.update();
  handleInput();

  // ... 其余代码不变
}
```

- [ ] **Step 2: 实现触摸滑动控制**

```javascript
// 在 initModules 函数后添加触摸事件处理

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
```

- [ ] **Step 3: 提交输入处理**

```bash
git add games/snake/snake.js
git commit -m "feat: implement input handling (keyboard + touch)"
```

---

### Task 6: 实现碰撞检测

**Files:**
- Modify: `games/snake/snake.js`

- [ ] **Step 1: 实现碰撞检测**

```javascript
// 在 moveSnake 函数后添加

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

// 在 moveSnake 函数末尾调用
function moveSnake() {
  // ... 现有代码

  // 检测碰撞
  checkCollisions();
}
```

- [ ] **Step 2: 提交碰撞检测**

```bash
git add games/snake/snake.js
git commit -m "feat: implement collision detection"
```

---

### Task 7: 实现游戏结束逻辑

**Files:**
- Modify: `games/snake/snake.js`

- [ ] **Step 1: 实现游戏结束函数**

```javascript
// 在 stopGame 后添加

function gameOver() {
  gameState.isRunning = false;
  gameState.isGameOver = true;
  stopGame();

  // 计算存活时间
  const survivalTime = ((performance.now() - gameState.startTime) / 1000).toFixed(1);

  // 更新结束界面
  document.getElementById('finalScore').textContent = gameState.score;
  document.getElementById('survivalTime').textContent = `存活时间: ${survivalTime}s`;
  document.getElementById('maxSpeed').textContent = `最高速度: ${gameState.maxSpeedPercent}%`;

  // 设置分享卡片数据
  const shareCard = document.getElementById('shareCard');
  if (shareCard) {
    shareCard.setData({
      score: gameState.score,
      time: `${survivalTime}s`,
      maxSpeed: `${gameState.maxSpeedPercent}%`,
    });
  }

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

  // 重置状态
  gameState.score = 0;
  gameState.moveInterval = config.initialMoveInterval;
  gameState.lastMoveTime = 0;
  gameState.lastSpeedIncreaseTime = 0;
  gameState.startTime = 0;
  gameState.isRunning = false;
  gameState.isGameOver = false;
  gameState.maxSpeedPercent = 100;

  // 更新显示
  updateScoreDisplay();
  document.getElementById('speedDisplay').textContent = '速度: 100%';
}
```

- [ ] **Step 2: 提交游戏结束逻辑**

```bash
git add games/snake/snake.js
git commit -m "feat: implement game over and reset logic"
```

---

### Task 8: 实现 UI 事件绑定

**Files:**
- Modify: `games/snake/snake.js`

- [ ] **Step 1: 绑定开始和重启按钮**

```javascript
// 在文件末尾添加

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

setupUI();
```

- [ ] **Step 2: 提交 UI 事件**

```bash
git add games/snake/snake.js
git commit -m "feat: implement UI event bindings"
```

---

### Task 9: 配置分享卡片

**Files:**
- Modify: `games/snake/snake.js`

- [ ] **Step 1: 添加分享卡片配置**

```javascript
// 在 setupUI 函数后添加

function setupShareCard() {
  const shareCard = document.getElementById('shareCard');
  if (shareCard) {
    shareCard.setConfig({
      title: '加速贪吃蛇',
      fields: [
        { type: 'score', label: '分数', show: true },
        { type: 'time', label: '存活时间', show: true },
        { type: 'custom', label: '最高速度', key: 'maxSpeed', show: true },
      ],
      shareText: '我在加速贪吃蛇中得了 {score} 分！你能超过我吗？',
      image: {
        width: 1000,
        height: 1000,
        background: {
          type: 'gradient',
          value: 'linear(135deg, #0f0c29, #302b63, #24243e)',
        },
        layout: {
          type: 'vertical',
          padding: 40,
          spacing: 20,
          sections: [
            { type: 'title' },
            { type: 'stat', field: 'score' },
            { type: 'stat', field: 'time' },
            { type: 'stat', field: 'maxSpeed' },
          ],
        },
      },
    });
  }
}

setupShareCard();
```

- [ ] **Step 2: 提交分享卡片**

```bash
git add games/snake/snake.js
git commit -m "feat: configure share card"
```

---

### Task 10: 优化食物生成

**Files:**
- Modify: `games/snake/snake.js`

- [ ] **Step 1: 优化 spawnFood 避免与蛇身重叠**

```javascript
// 替换原有的 spawnFood 函数

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
```

- [ ] **Step 2: 提交优化**

```bash
git add games/snake/snake.js
git commit -m "feat: optimize food spawning to avoid snake overlap"
```

---

### Task 11: 测试和调试

**Files:**
- 无文件修改，仅测试

- [ ] **Step 1: 启动本地服务器测试**

```bash
# 使用任意静态服务器
npx serve .
# 或
python -m http.server 8000
```

- [ ] **Step 2: 测试清单**

打开浏览器访问 `http://localhost:8000/games/snake/`

- [ ] 点击"开始游戏"按钮，游戏正常开始
- [ ] 使用方向键/WASD 控制蛇移动
- [ ] 在手机端测试触摸滑动控制
- [ ] 吃到食物后蛇变长，分数增加
- [ ] 每 5 秒速度显示增加
- [ ] 撞墙时游戏结束
- [ ] 撞自己时游戏结束
- [ ] 游戏结束界面显示分数、存活时间、最高速度
- [ ] 点击"重新开始"可以重新游戏
- [ ] 分享卡片正确显示数据

- [ ] **Step 3: 修复发现的问题（如有）**

```bash
git add .
git commit -m "fix: resolve testing issues"
```

---

### Task 12: 最终提交

**Files:**
- 无文件修改

- [ ] **Step 1: 确保所有更改已提交**

```bash
git status
git log --oneline -5
```

- [ ] **Step 2: 推送到远程（如需要）**

```bash
git push origin main
```

---

## 完成标准

- [ ] 游戏可以正常运行
- [ ] 蛇可以移动和转向
- [ ] 吃食物后蛇变长，分数增加
- [ ] 每 5 秒速度增加 5%
- [ ] 撞墙/撞自己游戏结束
- [ ] 键盘和触摸控制都正常
- [ ] 分享卡片正确配置
- [ ] 移动端手势防护正常
