# Lib 模块文档

本文档记录 `lib/` 目录中所有预构建模块，包括核心共享库和各应用模块的功能说明。

---

## 目录

- [核心共享库](#核心共享库)
  - [游戏引擎 (Engine)](#游戏引擎-engine)
  - [安全模块 (Security)](#安全模块-security)
  - [移动端保护 (MobileProtection)](#移动端保护-mobileprotection)
  - [输入管理器 (InputManager)](#输入管理器-inputmanager)
  - [游戏循环 (GameLoop)](#游戏循环-gameloop)
  - [精灵系统 (Sprite System)](#精灵系统-sprite-system)
  - [空间哈希网格 (SpatialHash)](#空间哈希网格-spatialhash)
  - [分享卡片 (ShareCard)](#分享卡片-sharecard)
  - [计分显示 (ScoreDisplay)](#计分显示-scoredisplay)
  - [提交按钮 (SubmitButton)](#提交按钮-submitbutton)
- [应用模块](#应用模块)
  - [花卉排列画布 (Flower)](#花卉排列画布-flower)
  - [收集目标小游戏 (Main Game)](#收集目标小游戏-main-game)
  - [QR 码工具 (QR Code)](#qr-码工具-qr-code)
  - [超声波数据通信 (Ultrasound)](#超声波数据通信-ultrasound)
- [辅助模块](#辅助模块)
  - [Module Preload Polyfill](#module-preload-polyfill)

---

## 核心共享库

**文件**: `MobileProtection-DVGpnIWZ.js`
**配套 WASM**: `game_security_wasm_bg-kvOFhIU3.wasm`

所有应用模块共用的基础框架，导出以下核心能力：

### 游戏引擎 (Engine)

**导出名**: `E` / `$` / `Pt`
**方法**: `createEngine(canvas, options, security)`

自动检测浏览器能力，创建最佳 2D 渲染引擎：

| 引擎 | 条件 | 特性 |
|------|------|------|
| **WebGPU 引擎** | `navigator.gpu` 可用 | 硬件加速、shader 渲染、纹理管理、Alpha 混合 |
| **Canvas2D 引擎** | WebGPU 不可用时回退 | 兼容性好、fillRect/drawImage 渲染 |

**引擎通用 API**:

```js
const engine = await Engine.createEngine(canvas, options, security);

// 初始化
await engine.initialize({ canvas, width, height, backgroundColor });

// 精灵管理
engine.addSprite({ id, position, velocity, width, height, rotation, color, image, spriteSheet, spriteFrame });
engine.removeSprite(id);
engine.getSprite(id);
engine.getSpriteAtPosition(x, y);

// 游戏循环
engine.update(deltaTime);
engine.render();

// 状态管理
engine.getState();    // { score, health, time, lives }
engine.setState({ score: 100 });

// 工具方法
engine.getCanvas();
engine.destroy();
```

**WebGPU 引擎额外特性**:
- WGSL Shader 渲染管线
- 纹理自动上传与缓存
- 预乘 Alpha 混合
- 动态顶点缓冲区管理

---

### 安全模块 (Security)

**导出名**: `C` / `Ye`
**依赖**: `game_security_wasm_bg-kvOFhIU3.wasm` (Rust/Go 编译的 WebAssembly)

基于 WASM 的安全功能模块，用于防作弊和数据加密：

```js
const security = new Security();
await security.initialize();

// 加密/解密
const encrypted = security.encrypt({ score: 100, name: "Player1" });
const decrypted = security.decrypt(encrypted);

// 哈希与时间码
const commandHash = security.generateCommandHash(command);
const timeCode = security.generateTimeCode();
const hash = security.generateHash(data);

// 时间管理
const time = security.getTime();
security.incrementTime();
security.resetTime();
```

| 方法 | 说明 |
|------|------|
| `encrypt(data)` | 将对象加密为字符串 |
| `decrypt(str)` | 将加密字符串解密为对象 |
| `generateCommandHash(cmd)` | 结合当前时间生成命令哈希 |
| `generateTimeCode()` | 生成时间验证码 |
| `generateHash(data)` | 生成数据哈希 |
| `getTime()` | 获取内部计时器时间 |
| `incrementTime()` | 递增内部计时器 |
| `resetTime()` | 重置内部计时器 |

---

### 移动端保护 (MobileProtection)

**导出名**: `M` / `Ne`

防止移动端浏览器默认手势行为干扰游戏：

```js
const protection = new MobileProtection({
  preventPullToRefresh: true,
  preventDoubleTapZoom: true,
  preventPinchZoom: true,
  preventContextMenu: true,
  target: document.body
});

protection.enable();
protection.disable();
protection.isEnabled();
```

| 配置项 | 默认值 | 说明 |
|--------|--------|------|
| `preventPullToRefresh` | `true` | 禁止下拉刷新（设置 overscrollBehavior/touchAction） |
| `preventDoubleTapZoom` | `true` | 禁止双击缩放 |
| `preventPinchZoom` | `true` | 禁止捏合缩放（拦截 gesturestart/change/end） |
| `preventContextMenu` | `true` | 禁止右键菜单 |
| `target` | `document.body` | 应用右键菜单禁止的目标元素 |

---

### 输入管理器 (InputManager)

**导出名**: `I` / `Xe`

统一的多端输入处理系统：

```js
const input = new InputManager({
  doubleTapThreshold: 300,
  swipeThreshold: 30,
  tapMoveThreshold: 10,
  deadzone: 0.15,
  enableScroll: true,
  scrollSensitivity: 1,
  enableTrackpadGestures: true,
  enablePressure: false,
  keybindings: { w: "up", s: "down", a: "left", d: "right" },
  actions: {}
});

// 查询输入状态
input.directions;          // { up, down, left, right } (0~1)
input.actions;             // { actionName: value }
input.getMousePosition();  // { x, y }
input.isMouseDown();
input.getScrollDelta();    // { x, y }
input.getState();

// 事件监听
input.on("tap", callback);
input.on("double-tap", callback);
input.on("swipe", callback);    // { direction, distance, duration, velocity }
input.on("pinch", callback);    // { scale, deltaScale, centerX, centerY }
input.on("rotate", callback);   // { angle, deltaAngle, centerX, centerY }

// 控制
input.update();
input.reset();
input.destroy();
```

| 输入源 | 支持的特性 |
|--------|-----------|
| **键盘** | 方向映射、按下/释放状态 |
| **鼠标** | 位置、按下状态、滚轮、点击/双击检测 |
| **触摸** | 多点触控、滑动、捏合、旋转、压力感应 |
| **手势** | Trackpad 原生手势（gesturestart/change/end） |
| **手柄** | 按钮、摇杆（带死区）、连接/断开事件 |

---

### 游戏循环 (GameLoop)

**导出名**: `G` / `Oe`

基于 `requestAnimationFrame` 的游戏主循环：

```js
const gameLoop = new GameLoop();

gameLoop.start(
  (deltaTime) => { /* update 逻辑 */ },
  () => { /* render 逻辑 */ }
);

gameLoop.stop();
gameLoop.isRunning();
```

| 参数 | 说明 |
|------|------|
| `update(dt)` | 每帧更新回调，`dt` 为距上帧的秒数 |
| `render()` | 每帧渲染回调，在 update 之后调用 |

---

### 精灵系统 (Sprite System)

#### SpriteSheet 加载器 (class `X`)

加载精灵图集并支持帧绘制：

```js
const spriteSheet = new SpriteSheet();
await spriteSheet.load("sprites.png", "sprites.json");

spriteSheet.isLoaded();
spriteSheet.getFrame("flowers/rose.png");
spriteSheet.getFrameNames();
spriteSheet.drawFrame(ctx, "frameName", x, y, width, height);
spriteSheet.getImage();
spriteSheet.getData();
```

#### 精灵数据格式

```js
{
  id: string,
  position: { x, y },
  velocity: { x, y },
  width: number,
  height: number,
  rotation: number,        // 弧度
  color: string,           // Canvas2D 填充色
  image: HTMLImageElement, // 直接图片
  spriteSheet: HTMLImageElement, // 精灵图集
  spriteFrame: {           // 精灵帧区域
    x, y, w, h,
    rotated: boolean
  }
}
```

---

### 空间哈希网格 (SpatialHash)

**类名**: `Ht` (在 main 模块中使用)

高效的碰撞检测空间索引：

```js
const grid = new SpatialHash(cellSize);  // cellSize 如 50

grid.add(sprite);       // 将精灵插入网格
grid.remove(spriteId);  // 移除精灵
grid.getNeighbors(sprite);  // 获取相邻精灵
grid.clear();           // 清空网格
```

适用于大量物体的碰撞检测，避免 O(n²) 遍历。

---

### 分享卡片 (ShareCard)

**Web Component**: `<share-card>`

可配置的分享图片生成与分享组件：

```js
const shareCard = document.querySelector("share-card");

// 配置卡片样式
shareCard.setConfig({
  title: "My Game",
  fields: [
    { type: "score", label: "Score", show: true },
    { type: "time",  label: "Time",  show: true },
    { type: "date",   label: "Date",  show: true },
    { type: "custom", label: "Level", key: "level", show: true }
  ],
  shareText: "I scored {score} points in {time}!",
  image: {
    width: 800,
    height: 600,
    background: {
      type: "color" | "gradient" | "image",
      value: "#fff" | "linear(135deg, #667eea, #764ba2)" | "bg.png"
    },
    layout: {
      type: "vertical",
      padding: 40,
      spacing: 20,
      sections: [
        { type: "title" },
        { type: "stat", field: "score" },
        { type: "stat", field: "time" },
        { type: "spacer" },
        { type: "character", size: { width: 150, height: 150 } }
      ]
    },
    character: {
      renderType: "canvas" | "sprite" | "callback",
      canvasId: "myCanvas",     // renderType=canvas 时
      sprite: { id, color },    // renderType=sprite 时
      renderCallback: (ctx, x, y) => {}  // renderType=callback 时
    }
  }
});

// 设置数据
shareCard.setData({ score: 100, time: 60, level: 5 });

// 执行分享
await shareCard.share();

// 获取分享文本
const text = shareCard.getShareText();
```

| 分享方式 | 优先级 | 说明 |
|----------|--------|------|
| Web Share API (文件) | 最高 | 原生系统分享，附带图片 |
| Web Share API (文本) | 中 | 不支持文件时仅分享文本+URL |
| 下载+剪贴板 | 降级 | 下载图片 + 复制文本到剪贴板 |
| 仅提示 | 最低 | 都不支持时 alert 显示分享内容 |

---

### 计分显示 (ScoreDisplay)

**Web Component**: `<score-display>`

实时计分显示组件：

```js
const scoreDisplay = document.querySelector("score-display");
scoreDisplay.setScore(100);

// CSS 变量自定义
// --score-color: #fff
// --score-font-size: 24px
```

---

### 提交按钮 (SubmitButton)

**Web Component**: `<submit-button>`

结合安全模块的防作弊提交组件：

```html
<submit-button></submit-button>
```

```js
const submitBtn = document.querySelector("submit-button");

// 点击后自动触发 submit-score 事件
submitBtn.addEventListener("submit-score", (e) => {
  const { timeCode, commandHash } = e.detail;
  // 发送到服务器验证
});

// 可通过构造函数传入 security 实例
// CSS 变量: --button-color
```

---

### ScoreSubmitter (加密提交工具)

```js
const submitter = new ScoreSubmitter(security);
await submitter.initialize();

const encryptedPayload = submitter.formatForIssue({
  score: 100,
  time: 60,
  name: "Player1",
  uuid: "session-uuid"
});
// 返回包含 ENCRYPTED_PAYLOAD 的 Markdown 格式文本
```

---

## 应用模块

### 花卉排列画布 (Flower)

**文件**: `flower-D58nqTnV.js` + `flower-is69TI8K.css`

一个交互式花卉排列画布应用，使用核心库的引擎、输入、精灵系统构建。

#### 功能

| 功能 | 说明 |
|------|------|
| 花卉选择 | 12 种花卉：rose, tulip, lily, daisy, sunflower, cosmo, daffodil, lavender, lilyOfTheValley, orchid, pansy, poppy |
| 拖放绘制 | 鼠标/触摸拖拽花卉到画布 |
| 旋转控制 | 滑块或键盘 A/D 键（步进 10°） |
| 缩放控制 | 滑块或键盘 W/S 键（步进 16px，范围 128~512） |
| 图层管理 | 置顶(Q)、删除(E)、翻转(/) |
| 选中切换 | Tab 键循环选中画布上的花卉 |
| 方向移动 | 方向键微调位置（步进 10px） |
| 清除画布 | Delete 键或清除按钮 |
| 分享导出 | Enter 键或分享按钮，导出 PNG |

#### 快捷键

| 按键 | 功能 |
|------|------|
| 1~9, 0, i, o | 选择对应花卉 |
| Tab | 切换选中花卉 |
| A / D | 逆/顺时针旋转 |
| W / S | 放大/缩小 |
| Q | 置顶 |
| E | 删除 |
| / | 翻转 |
| 方向键 | 微调位置 |
| Delete | 清空画布 |
| Enter | 分享 |

#### UI 组件

- `<game-slider>` — 自定义滑块控件（label, min, max, step, value）
- 花卉调色板（自动滚动展示）

---

### 收集目标小游戏 (Main Game)

**文件**: `main-CcL0ZKFH.js`

一个完整的 60 秒收集目标小游戏，展示核心库的综合使用。

#### 功能

| 功能 | 说明 |
|------|------|
| 玩家控制 | 绿色方块，WASD/方向键/触摸控制 |
| 目标收集 | 5 个红色目标，碰到即得分并随机重生 |
| 障碍物 | 5 个灰色障碍物，碰撞阻挡 |
| 倒计时 | 60 秒倒计时 |
| 计分 | 每收集一个目标 +10 分 |
| 碰撞检测 | 空间哈希网格加速 |
| 分数提交 | 加密后提交到 GitHub Issues |
| 分享卡片 | 生成带渐变背景的成绩图片 |

#### 游戏流程

```
输入玩家名 → 开始倒计时 → 游戏中(60s) → 结束弹窗 → 提交分数 / 分享
```

#### 使用的核心模块

- 游戏引擎（WebGPU/Canvas2D）
- 输入管理器
- 游戏循环
- 安全模块（WASM 加密）
- 空间哈希网格
- `<score-display>` 计分显示
- `<submit-button>` 提交按钮
- `<share-card>` 分享卡片
- 移动端保护

---

### QR 码工具 (QR Code)

**文件**:
- `qr-code-DbDFnmYs.js` + `qr-code-DiD7KNEW.css` — QR 码生成与扫描 UI
- `qr-scanner-worker.min-D85Z9gVD.js` — QR 码扫描 Web Worker
- `qart-wlca0A4T.wasm` — QArt 艺术二维码 WASM（Go 编译）

#### 功能

| 功能 | 说明 |
|------|------|
| **QR 码生成** | 文本/URL → QR 码图片 |
| **QR 码扫描** | 摄像头实时扫描（Web Worker 后台处理） |
| **图片扫描** | 上传本地图片识别 QR 码 |
| **QArt 艺术码** | 将 QR 码与图片融合生成艺术二维码 |
| ** Fountain 模式** | 渐进式 QR 码生成预览 |

#### QR 码解码支持

| 编码模式 | 说明 |
|----------|------|
| Numeric | 纯数字 |
| Alphanumeric | 数字+大写字母+特殊字符 |
| Byte | 字节数据（UTF-8） |
| Kanji | 日文汉字（Shift-JIS） |
| ECI | 扩展通道解释器 |
| StructuredAppend | 结构化追加（多 QR 码拼接） |

#### 纠错级别

支持 L / M / Q / H 四个纠错级别，版本 1~40 完整支持。

#### UI 模式

| 模式 | 说明 |
|------|------|
| 生成模式 | 输入文本 → 生成 QR 码，可自定义大小/颜色/纠错级别 |
| 扫描模式 | 摄像头实时扫描 + 图片上传扫描 |

---

### 超声波数据通信 (Ultrasound)

**文件**: `ultrasound-C3iofht8.js`

通过超声波（近高频音频）在设备间进行数据传输的通信模块。

#### 核心架构

| 组件 | 类名 | 说明 |
|------|------|------|
| **AudioContext** | `Ht` | Web Audio API 上下文管理，创建 AnalyserNode |
| **发射器 (TX)** | `Ut` | 通过扬声器发送超声波符号 |
| **接收器 (RX)** | `_t` | 通过麦克风接收超声波信号 |
| **Goertzel 检测器** | `Vt` | 高效检测特定频率的能量 |
| **噪声门限** | `$t` | 自适应噪声底估计与门限判断 |
| **符号检测器** | `Yt` | 从频率能量中识别符号（0/1/fn） |
| **编码器** | `jt` | 字节 → 符号序列（每字节 4 个符号） |
| **解码器** | `Jt` | 符号序列 → 字节（每 4 个符号 1 字节） |
| **确认状态机** | `Kt` | 重复确认机制，防止误码 |
| **帧协议** | `Qt` | 帧格式：[长度 1B][设备ID 4B][负载 NB] |
| **设备发现** | `Xt` | 周期性广播发现信标，维护对等设备列表 |
| **通信服务** | `Wt` | 整合所有组件的主服务类 |

#### 频率方案

| 角色 | 发射频率 (TX) | 监听频率 (RX) |
|------|--------------|--------------|
| **Master (CH1)** | 17k, 17.5k, 18k | 18.5k, 19k, 19.5k |
| **Slave (CH2)** | 18.5k, 19k, 19.5k | 17k, 17.5k, 18k |

#### 符号编码

3 个符号通过双频组合编码：

| 符号 | 低频+高频 (Master) | 低频+高频 (Slave) |
|------|-------------------|------------------|
| `0` | 17k + 17.5k | 18.5k + 19k |
| `1` | 18k + 17.5k | 19.5k + 19k |
| `fn` | 17k + 18k | 18.5k + 19.5k |

#### 主服务 API

```js
const service = new UltrasoundService();

// 初始化
await service.initialize({
  role: "master" | "slave",
  deviceId: "optional-id",
  symbolDuration: 250,       // ms
  txPower: 0.35,             // 0~1
  confirmationCount: 2,
  noiseGateMultiplier: 8,
  discovery: false,
  beaconInterval: 2000,      // ms
  maxPayloadSize: 256,
  noiseFloorEstimationMs: 500,
  audioInputId: "mic-device-id"
});

// 监听
await service.startListening();
service.stopListening();

// 发送
await service.broadcast("Hello");
await service.broadcastData(uint8Array);
service.transmitSymbol(symbolIndex);
service.stopTransmission();

// 设备发现
await service.startDiscovery();
service.stopDiscovery();
service.getPeers();

// 事件
service.onEvent((event) => {
  // event.type: "state-changed" | "symbol-received" | "message-received"
  //             "data-received" | "peer-discovered" | "transmission-started"
  //             "transmission-complete" | "error"
});

// 配置更新
service.updateConfig({ txPower, symbolDuration, confirmationCount, noiseGateMultiplier });

// 内部状态
service.getInternalState();  // goertzelPowers, noisePower, sampleRate, ...
service.getState();          // "idle" | "listening" | "transmitting" | "discovering"

// 关闭
await service.close();
```

#### UI 界面功能

- 角色切换（Master/Slave）
- 手动按键发送符号（3 个符号按钮）
- 频率强度实时监控条形图
- 噪声底 dB 显示
- 解码文本实时显示
- 可调参数：符号速率、发送音量

---

## 辅助模块

### Module Preload Polyfill

**文件**: `modulepreload-polyfill-B5Qt9EMX.js`

为不支持 `<link rel="modulepreload">` 的浏览器提供 polyfill：
- 检测 `link[rel="modulepreload"]` 支持情况
- 不支持时通过 `fetch()` 手动加载模块
- 支持 integrity、referrerPolicy、crossOrigin 属性
- 通过 MutationObserver 监听动态添加的 modulepreload 链接

---

## 文件清单

| 文件 | 类型 | 说明 |
|------|------|------|
| `MobileProtection-DVGpnIWZ.js` | JS | 核心共享库（引擎/安全/输入/循环/UI组件） |
| `game_security_wasm_bg-kvOFhIU3.wasm` | WASM | 安全模块的 WebAssembly 二进制 |
| `flower-D58nqTnV.js` | JS | 花卉排列画布应用 |
| `flower-is69TI8K.css` | CSS | 花卉排列画布样式 |
| `main-CcL0ZKFH.js` | JS | 收集目标小游戏 |
| `qr-code-DbDFnmYs.js` | JS | QR 码生成/扫描应用 |
| `qr-code-DiD7KNEW.css` | CSS | QR 码工具样式 |
| `qr-scanner-worker.min-D85Z9gVD.js` | JS | QR 码扫描 Web Worker |
| `qart-wlca0A4T.wasm` | WASM | QArt 艺术二维码引擎 |
| `ultrasound-C3iofht8.js` | JS | 超声波数据通信应用 |
| `modulepreload-polyfill-B5Qt9EMX.js` | JS | 模块预加载兼容 polyfill |

---

## 功能组合矩阵

利用以上模块，可以快速构建以下类型的应用：

| 应用类型 | 使用的模块 |
|----------|-----------|
| **2D 游戏** | 引擎 + 输入 + 游戏循环 + 精灵 + 碰撞 |
| **互动画布** | 引擎 + 输入 + 精灵 + 分享卡片 |
| **竞技/计分游戏** | 引擎 + 输入 + 循环 + 碰撞 + 计分 + 提交 + 安全 + 分享 |
| **QR 码工具** | QR 生成/扫描 + QArt |
| **近场通信** | 超声波通信 |
| **跨平台游戏** | 引擎 + 输入(键盘/触摸/手柄) + 移动端保护 |
| **防作弊排行榜** | 安全(WASM) + 提交按钮 + 计分显示 |
| **社交分享应用** | 分享卡片 + Web Share API |
