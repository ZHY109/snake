# 加速贪吃蛇游戏设计文档

## 概述

一个基于现有 lib 模块的加速版贪吃蛇游戏。蛇的移动速度会随时间自动增加，每 5 秒提速 5%，考验玩家的反应速度和策略。

## 核心玩法

### 基本规则
- 蛇在网格上移动，玩家控制方向
- 吃到食物后蛇身 +1 节，得分 +10
- 蛇的速度每 5 秒自动增加 5%
- 撞墙或撞到自己时游戏结束

### 加速机制

蛇在网格上移动，每次移动一格。**"速度"指的是每两次移动之间的时间间隔**，间隔越短，蛇移动越快。

```
初始移动间隔: 150ms (约 6.67 步/秒)
加速间隔: 每 5 秒
加速比例: 5% (间隔缩短 5%)

时间线:
0s  → 150ms/步
5s  → 142.5ms/步
10s → 135.4ms/步
15s → 128.6ms/步
30s → 104.6ms/步
60s → 64.6ms/步  (接近 15 步/秒，非常快了!)
```

### 游戏结束条件
- 蛇头超出画布边界（撞墙）
- 蛇头与自己的身体重叠（撞自己）

## 技术架构

### 使用的 Lib 模块

| 模块 | 用途 |
|------|------|
| **Engine** | Canvas2D 渲染引擎 |
| **InputManager** | 键盘方向键/WASD + 触摸滑动 |
| **GameLoop** | requestAnimationFrame 主循环 |
| **ScoreDisplay** | 实时分数显示（Web Component） |
| **ShareCard** | 游戏结束分享卡片（Web Component） |
| **MobileProtection** | 防止移动端误触手势 |

### 数据结构

```js
// 游戏配置
const config = {
  gridSize: 20,          // 每格像素
  gridWidth: 50,         // 网格宽度 (50 格)
  gridHeight: 50,        // 网格高度 (50 格)
  canvasWidth: 1000,     // 画布宽度 (50 * 20)
  canvasHeight: 1000,    // 画布高度 (50 * 20)
  initialMoveInterval: 150,  // 初始移动间隔(ms)
  speedIncreaseInterval: 5000,  // 加速间隔(ms)
  speedIncreaseRate: 0.05,  // 每次加速比例
};

// 蛇的数据（网格坐标）- 初始 3 节
const snake = {
  segments: [
    { x: 25, y: 25 },  // 蛇头
    { x: 24, y: 25 },  // 身体
    { x: 23, y: 25 },  // 尾巴
  ],
  direction: { x: 1, y: 0 },  // 当前方向
  nextDirection: { x: 1, y: 0 },  // 下一帧方向（防止快速反向）
};

// 食物（网格坐标）
const food = {
  x: 25,
  y: 10,
};

// 游戏状态
const gameState = {
  score: 0,
  moveInterval: 150,       // 当前移动间隔(ms)
  lastMoveTime: 0,         // 上次移动的时间
  lastSpeedIncreaseTime: 0,  // 上次加速的时间
  startTime: 0,            // 游戏开始时间
  isRunning: false,
  isGameOver: false,
};
```

## 游戏流程

```
开始界面
  ↓ 点击开始
游戏中（蛇移动 + 加速 + 吃食物）
  ↓ 撞墙/撞自己
游戏结束
  ↓ 弹出结算面板
显示分数 + 分享卡片
  ↓ 点击重新开始
回到开始界面
```

## 界面布局

```
┌─────────────────────────────────┐
│  分数: 150          速度: 115%  │  ← HUD
├─────────────────────────────────┤
│                                 │
│                                 │
│        🟩 🟩 🟩                │
│                                 │
│              🍎                 │  ← 游戏画布 (1000x1000)
│                                 │
│        🟩                      │
│        🟩                      │
│                                 │
└─────────────────────────────────┘
      [ 开始游戏 ]                  ← 开始按钮
```

### 渲染

```js
function render() {
  // 清空画布
  engine.render();

  // 绘制网格背景（可选）
  drawGrid();

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

### 游戏结束弹窗

```
┌─────────────────────────────────┐
│        游戏结束!                 │
│                                 │
│         150 分                  │
│      存活时间: 32.5s            │
│      最高速度: 145%             │
│                                 │
│    [ 分享成绩 ] [ 重新开始 ]     │
└─────────────────────────────────┘
```

## 控制方式

### 键盘
- 方向键 ↑↓← 或 WASD 控制方向
- 空格键开始/重新开始游戏

### 触摸
- 滑动手势控制方向（上/下/左/右）
- 点击屏幕开始/重新开始

## 实现细节

### 移动与加速逻辑

```js
// 在 GameLoop.update(dt) 中
function update(deltaTime) {
  if (!gameState.isRunning) return;

  const currentTime = performance.now();

  // 检查是否需要加速（每 5 秒）
  if (currentTime - gameState.lastSpeedIncreaseTime >= 5000) {
    gameState.moveInterval *= (1 - 0.05);  // 间隔缩短 5%
    gameState.lastSpeedIncreaseTime = currentTime;
    updateSpeedDisplay();
  }

  // 检查是否需要移动（基于移动间隔）
  if (currentTime - gameState.lastMoveTime >= gameState.moveInterval) {
    moveSnake();
    gameState.lastMoveTime = currentTime;
  }
}

function moveSnake() {
  // 更新方向
  snake.direction = snake.nextDirection;

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
    // 吃到食物，不移除尾部（蛇变长）
    gameState.score += 10;
    scoreDisplay.setScore(gameState.score);
    spawnFood();
  } else {
    // 没吃到，移除尾部（蛇长度不变）
    snake.segments.pop();
  }

  // 检测碰撞
  checkCollisions();
}
```

### 碰撞检测

```js
function checkCollisions() {
  const head = snake.segments[0];

  // 撞墙检测（超出网格边界）
  if (head.x < 0 || head.x >= config.gridWidth ||
      head.y < 0 || head.y >= config.gridHeight) {
    gameOver();
    return;
  }

  // 撞自己检测（从第 2 节开始，跳过蛇头）
  for (let i = 1; i < snake.segments.length; i++) {
    if (head.x === snake.segments[i].x &&
        head.y === snake.segments[i].y) {
      gameOver();
      return;
    }
  }
}
```

### 输入处理

```js
// 键盘方向映射
const input = new InputManager({
  keybindings: {
    w: 'up', arrowup: 'up',
    s: 'down', arrowdown: 'down',
    a: 'left', arrowleft: 'left',
    d: 'right', arrowright: 'right',
  }
});

// 防止 180 度反向
function handleInput() {
  const dir = input.directions;

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
```

## 分享卡片配置

```js
const shareCard = document.querySelector('share-card');
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
      value: 'linear(135deg, #0f0c29, #302b63, #24243e)'
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
      ]
    }
  }
});
```

## 文件结构

```
games/
  snake/
    index.html        ← 游戏入口
    snake.js          ← 游戏逻辑
    style.css         ← 样式
```

## 测试要点

- [ ] 蛇能正常移动和转向
- [ ] 吃食物后蛇身变长
- [ ] 分数正确增加
- [ ] 速度每 5 秒增加 5%
- [ ] 撞墙时游戏结束
- [ ] 撞自己时游戏结束
- [ ] 键盘控制正常
- [ ] 触摸滑动控制正常
- [ ] 分享卡片正确显示数据
- [ ] 移动端手势防护正常

## 性能考虑

- 蛇身节点数量限制（建议上限 100 节）
- 使用 requestAnimationFrame 保证流畅
- 碰撞检测使用简单的坐标比较（不需要空间哈希）
- 食物生成避免与蛇身重叠
