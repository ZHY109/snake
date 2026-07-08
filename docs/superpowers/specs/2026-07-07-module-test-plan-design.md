# 模块测试验证设计文档

**日期**: 2026-07-07
**目标**: 系统性验证 `lib/` 目录下所有预构建模块的功能完整性，确保它们可以单独使用、组合使用、以及在完整应用中正常运行。

---

## 1. 总体策略

### 测试方式
- **两者结合**：先为每个核心功能创建最小化测试页（单元级），再运行完整应用模块（集成级）
- **Web 服务器**: `npx serve` 启动本地静态文件服务
- **验证方式**: 人工在浏览器中打开测试页，确认控制台无报错 + UI/功能正常
- **测试顺序**: 分三阶段渐进 — 单元 → 组合 → 应用

### 目录结构

```
tests/
  phase1-unit/              # 核心模块单独测试
    01-engine.html
    02-spritesheet.html
    03-security.html
    04-input.html
    05-gameloop.html
    06-share-card.html
    07-spatial-hash.html
  phase2-combo/             # 多模块组合测试
    08-engine-input-loop.html
    09-engine-security-share.html
    10-full-core.html
  phase3-app/               # 完整应用测试
    11-flower.html
    12-game.html
    13-qr-code.html
    14-ultrasound.html
  verify.html               # 验证清单总页面

docs/
  modules.md                # 模块文档（已创建）
  test-results.md           # 测试结果报告（测试后填写）
```

### 文件路径约定

所有测试页面使用相对路径引用 `lib/` 中的模块：
```html
<script type="module" src="../../lib/MobileProtection-DVGpnIWZ.js"></script>
```

---

## 2. Phase 1: 单元级测试

### 01-engine.html — 游戏引擎

**测试模块**: `MobileProtection-DVGpnIWZ.js` 中的引擎部分（`E`/`createEngine`）

**测试内容**:
- 调用 `createEngine(canvas)` 创建引擎
- 控制台输出引擎类型（WebGPU / Canvas2D）
- 添加一个纯色方块 sprite 并渲染
- 添加一个带 `color` 的圆形区域并渲染

**通过标准**:
- Canvas 上显示彩色方块
- 控制台输出引擎类型，无报错
- WebGPU 和 Canvas2D 引擎都能工作（在不同浏览器中测试）

---

### 02-spritesheet.html — 精灵图加载

**测试模块**: `MobileProtection-DVGpnIWZ.js` 中的 SpriteSheet 类（class `X`）

**测试内容**:
- 创建 SpriteSheet 实例
- 尝试加载精灵图（如果 `../assets/` 下没有资源，则用 Canvas 生成模拟 sprite sheet 和 JSON 数据，创建 Blob URL 进行测试）
- 在 Canvas 上绘制精灵帧
- 控制台输出帧信息和加载状态

**通过标准**:
- 精灵帧正确绘制在 Canvas 上
- `getFrameNames()` 返回帧列表
- 无报错

---

### 03-security.html — 安全模块 (WASM)

**测试模块**: `MobileProtection-DVGpnIWZ.js` 中的 Security 类（`C`/`Ye`）
**依赖**: `game_security_wasm_bg-kvOFhIU3.wasm`

**测试内容**:
- 创建 Security 实例并调用 `initialize()`
- 测试 `encrypt()` → 输出密文
- 测试 `decrypt()` → 验证解密结果与原文一致
- 测试 `generateCommandHash()` → 输出哈希值
- 测试 `generateTimeCode()` → 输出时间码
- 测试 `generateHash()` → 输出哈希值
- 测试 `getTime()` / `incrementTime()` / `resetTime()` → 验证时间管理

**通过标准**:
- WASM 初始化成功
- 加密 → 解密往返一致
- 所有哈希/时间码函数返回有效值
- 时间管理函数正常工作
- 控制台无报错

---

### 04-input.html — 输入管理器

**测试模块**: `MobileProtection-DVGpnIWZ.js` 中的 InputManager 类（`I`/`Xe`）

**测试内容**:
- 创建 InputManager 实例
- 页面实时显示：
  - 方向状态（上下左右条形指示器）
  - 鼠标位置 (x, y) 和按下状态
  - 触摸点位置和数量
  - 手势事件（pinch/rotate）日志
- 每帧调用 `input.update()`

**通过标准**:
- 按键盘 WASD/方向键时方向指示器响应
- 鼠标移动/点击状态正确显示
- 触摸事件正确捕获（在触摸设备上）
- 控制台无报错

---

### 05-gameloop.html — 游戏循环

**测试模块**: `MobileProtection-DVGpnIWZ.js` 中的 GameLoop 类（`G`/`Oe`）

**测试内容**:
- 创建 GameLoop 实例
- Start/Stop 按钮控制循环
- 实时显示：
  - 当前 FPS
  - 总帧数
  - 运行时间（秒）
  - 最近 deltaTime 值

**通过标准**:
- FPS 稳定在 ~60（或显示器刷新率）
- 帧数持续递增
- Start/Stop 按钮正常工作
- 控制台无报错

---

### 06-share-card.html — 分享卡片

**测试模块**: `MobileProtection-DVGpnIWZ.js` 中的 ShareCard 组件（class `Ot`，`<share-card>`）

**测试内容**:
- 在 HTML 中使用 `<share-card>` 元素
- 配置卡片样式：渐变背景、标题、统计数据字段
- 设置数据（score、time 等）
- 调用 `share()` 或 `getShareText()`
- 页面显示生成的分享图片预览

**通过标准**:
- 分享图片正确渲染（渐变背景 + 标题 + 数据字段）
- 分享文本模板替换正确（`{score}` → 实际值）
- 分享/下载按钮可点击
- 控制台无报错

---

### 07-spatial-hash.html — 空间哈希网格

**测试模块**: `MobileProtection-DVGpnIWZ.js` 中的 SpatialHash 类（class `Ht`）

**测试内容**:
- 创建 SpatialHash(cellSize=50) 实例
- 添加 10~20 个随机位置的"精灵"对象
- Canvas 可视化：
  - 所有物体用圆点表示
  - 鼠标位置附近的物体（邻居）高亮显示
- 控制台输出当前检测到的邻居数量

**通过标准**:
- 物体正确显示在 Canvas 上
- 鼠标附近物体正确高亮（邻居检测正确）
- 远离鼠标的物体不高亮
- 控制台无报错

---

## 3. Phase 2: 组合测试

### 08-engine-input-loop.html — 引擎 + 输入 + 循环

**测试模块**: Engine + InputManager + GameLoop

**测试内容**:
- 引擎渲染一个可移动的方块
- 游戏循环驱动 update + render
- 输入管理器捕获键盘（WASD/方向键）和触摸输入
- 方块根据输入移动，不超出画布边界
- 显示 FPS 和方块坐标

**通过标准**:
- 方块随键盘/触摸平滑移动
- 帧率稳定（~60fps）
- 边界限制有效
- 控制台无报错

---

### 09-engine-security-share.html — 引擎 + 安全 + 分享

**测试模块**: Engine + Security + ShareCard

**测试内容**:
- 引擎渲染场景，画布上有多个可点击的目标
- 点击目标得分，分数通过安全模块加密
- 页面显示加密后的数据
- 点击"生成分享卡片"按钮，使用 ShareCard 生成带分数的分享图片
- 显示生成的图片

**通过标准**:
- 场景渲染正常
- 点击得分后加密数据正确显示（每次不同）
- 分享卡片图片包含正确分数
- 控制台无报错

---

### 10-full-core.html — 核心库全模块集成

**测试模块**: Engine + InputManager + GameLoop + SpatialHash + Security + ScoreDisplay + ShareCard + MobileProtection

**测试内容**:
- 一个完整的迷你游戏场景：
  - 引擎渲染
  - 输入管理器控制玩家
  - 游戏循环驱动
  - 空间哈希网格做碰撞检测
  - 碰到目标得分，`<score-display>` 更新
  - 安全模块加密最终分数
  - `<share-card>` 生成分享图片
  - 移动端保护启用
- 控制台输出各模块状态

**通过标准**:
- 所有功能同时运行，互不干扰
- 得分 → 显示 → 加密 → 分享 流程正常
- 控制台无报错

---

## 4. Phase 3: 完整应用测试

### 11-flower.html — 花卉排列画布

**加载文件**:
- `../lib/flower-D58nqTnV.js`
- `../lib/flower-is69TI8K.css`
- 可能需要 `../assets/` 下的精灵图资源

**验证清单**:
- [ ] 页面正常渲染，花卉调色板显示 12 种花卉
- [ ] 点击花卉按钮可在画布上添加花卉
- [ ] 拖拽花卉可移动位置（鼠标 + 触摸）
- [ ] 旋转滑块 / A/D 键可旋转花卉
- [ ] 缩放滑块 / W/S 键可缩放花卉
- [ ] 置顶按钮 / Q 键正常工作
- [ ] 删除按钮 / E 键正常工作
- [ ] 翻转按钮 / / 键正常工作
- [ ] Tab 键切换选中花卉
- [ ] 方向键微调位置
- [ ] Delete 键清空画布
- [ ] 分享按钮 / Enter 键可导出 PNG
- [ ] 移动端保护生效（无缩放/下拉刷新）
- [ ] 控制台无报错

---

### 12-game.html — 收集目标小游戏

**加载文件**:
- `../lib/main-CcL0ZKFH.js`

**验证清单**:
- [ ] 玩家名输入弹窗正常显示
- [ ] 输入名字后游戏场景渲染
- [ ] 玩家（绿色方块）、障碍物（灰色）、目标（红色）正确显示
- [ ] WASD / 方向键控制玩家移动
- [ ] 触摸控制玩家移动
- [ ] 碰到目标 → 得分 +10，目标随机重生
- [ ] 碰到障碍物 → 阻挡移动
- [ ] 玩家不超出画布边界
- [ ] 倒计时 60 秒正常递减
- [ ] 游戏结束弹窗显示最终分数
- [ ] `<score-display>` 实时更新分数
- [ ] 提交按钮可点击，加密数据生成
- [ ] `<share-card>` 分享卡片可生成和下载
- [ ] 控制台无报错

---

### 13-qr-code.html — QR 码工具

**加载文件**:
- `../lib/qr-code-DbDFnmYs.js`
- `../lib/qr-code-DiD7KNEW.css`
- `../lib/qr-scanner-worker.min-D85Z9gVD.js`（Web Worker）
- `../lib/qart-wlca0A4T.wasm`（QArt 引擎）

**验证清单**:
- [ ] 页面正常渲染，模式切换标签页可点击
- [ ] 生成模式：输入文本 → 生成 QR 码
- [ ] 自定义大小滑块可调节 QR 码大小
- [ ] 自定义颜色（前景/背景）可改变 QR 码颜色
- [ ] 纠错级别切换正常
- [ ] 扫描模式：上传图片文件 → 识别 QR 码内容
- [ ] 扫描模式：摄像头扫描 → 实时识别（需浏览器授权）
- [ ] QArt 艺术码功能（如果 WASM 加载正常）
- [ ] 控制台无报错

---

### 14-ultrasound.html — 超声波数据通信

**加载文件**:
- `../lib/ultrasound-C3iofht8.js`

**验证清单**:
- [ ] 页面正常渲染（角色按钮、频率条、按键区域）
- [ ] Master/Slave 角色切换正常
- [ ] 切换角色后频率标签和颜色正确更新
- [ ] 按下符号按键 → 对应频率条响应
- [ ] "Start Listening" 按钮 → 请求麦克风权限
- [ ] 监听中 → 频率实时监控条形图更新
- [ ] 噪声底 dB 值正常显示
- [ ] 符号速率滑块可调节
- [ ] 发送音量滑块可调节
- [ ] 清除解码文本按钮正常
- [ ] 控制台无报错

---

## 5. 验证清单页面：verify.html

一个总控页面，提供所有测试项的可视化检查清单：

- 按 Phase 分组显示所有测试项
- 每个测试项有 checkbox 和子项 checkbox
- 提供"备注"输入框记录问题
- 页面底部有"导出结果"按钮，将所有勾选状态导出为 Markdown 格式
- 导出的 Markdown 可直接粘贴到 `docs/test-results.md`

---

## 6. 结果记录：docs/test-results.md

测试完成后填写，格式：

```markdown
# 模块测试报告

**测试日期**: YYYY-MM-DD
**测试环境**: [浏览器名称/版本] [操作系统]
**Web 服务器**: npx serve [端口]

## Phase 1: 单元测试

| # | 模块 | 测试项 | 结果 | 备注 |
|---|------|--------|------|------|
| 01 | 游戏引擎 | Canvas2D 渲染 | ✅/❌ | |
| 01 | 游戏引擎 | WebGPU 渲染 | ✅/❌ | |
| 02 | 精灵图 | 加载 | ✅/❌ | |
| 02 | 精灵图 | 帧绘制 | ✅/❌ | |
| 03 | 安全模块 | WASM 初始化 | ✅/❌ | |
| 03 | 安全模块 | 加密/解密 | ✅/❌ | |
| 03 | 安全模块 | 哈希生成 | ✅/❌ | |
| 03 | 安全模块 | 时间管理 | ✅/❌ | |
| 04 | 输入管理器 | 键盘 | ✅/❌ | |
| 04 | 输入管理器 | 鼠标 | ✅/❌ | |
| 04 | 输入管理器 | 触摸 | ✅/❌ | |
| 05 | 游戏循环 | FPS 稳定 | ✅/❌ | |
| 05 | 游戏循环 | Start/Stop | ✅/❌ | |
| 06 | 分享卡片 | 图片生成 | ✅/❌ | |
| 06 | 分享卡片 | 文本模板 | ✅/❌ | |
| 06 | 分享卡片 | 分享/下载 | ✅/❌ | |
| 07 | 空间哈希 | 邻居检测 | ✅/❌ | |
| 07 | 空间哈希 | 可视化 | ✅/❌ | |

## Phase 2: 组合测试

| # | 组合 | 测试项 | 结果 | 备注 |
|---|------|--------|------|------|
| 08 | 引擎+输入+循环 | 可控制方块 | ✅/❌ | |
| 08 | 引擎+输入+循环 | 帧率稳定 | ✅/❌ | |
| 09 | 引擎+安全+分享 | 加密得分 | ✅/❌ | |
| 09 | 引擎+安全+分享 | 分享卡片 | ✅/❌ | |
| 10 | 全核心集成 | 全部协同 | ✅/❌ | |

## Phase 3: 应用测试

| # | 应用 | 结果 | 通过项 | 总项 | 备注 |
|---|------|------|--------|------|------|
| 11 | 花卉排列 | ✅/❌ | /14 | |
| 12 | 收集游戏 | ✅/❌ | /14 | |
| 13 | QR 码工具 | ✅/❌ | /9 | |
| 14 | 超声波通信 | ✅/❌ | /11 | |

## 问题汇总

| # | 严重程度 | 模块 | 问题描述 | 复现步骤 |
|---|---------|------|---------|---------|
| 1 | 高/中/低 | | | |

## 结论

- 总测试项: X
- 通过: X
- 失败: X
- 通过率: X%
```

---

## 7. 实施顺序

1. 创建 `tests/` 目录结构
2. 编写 Phase 1 的 7 个测试页
3. 编写 `verify.html` 验证清单
4. **暂停** — 用户启动 `npx serve` 并逐页测试 Phase 1
5. 用户反馈 Phase 1 结果
6. 编写 Phase 2 的 3 个组合测试页
7. 用户测试 Phase 2
8. 用户反馈 Phase 2 结果
9. 编写 Phase 3 的 4 个应用测试页
10. 用户测试 Phase 3
11. 用户反馈 Phase 3 结果
12. 汇总结果写入 `docs/test-results.md`
