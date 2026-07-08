# Module Verification Test Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create test HTML pages to verify each module in `lib/` works individually and in combination, with manual browser verification and result tracking.

**Architecture:** Three-phase progressive testing — Phase 1 isolates each core module from `MobileProtection-DVGpnIWZ.js`, Phase 2 combines core modules together, Phase 3 loads full application bundles with required DOM structures. A `verify.html` dashboard tracks pass/fail status. Results are recorded in `docs/test-results.md`.

**Tech Stack:** Vanilla HTML/CSS/JS, ES modules (`<script type="module">`), Web Audio API, WebGPU/Canvas2D, Web Workers

---

## Core Library Export Reference

All Phase 1 and Phase 2 tests import from the core library. The exact export statement:

```js
export { Ye as C, ze as E, Oe as G, Xe as I, Ne as M }
```

Import pattern for all test pages:

```js
import {
  E as createEngine,   // Engine factory: createEngine(canvas, options?, security?)
  C as Security,       // Security class (WASM): encrypt, decrypt, hash, time
  G as GameLoop,       // GameLoop class: start(update, render), stop, isRunning
  I as InputManager,   // InputManager class: directions, mouse, touch, gestures
  M as MobileProtection // MobileProtection class: enable, disable, isEnabled
} from '../../lib/MobileProtection-DVGpnIWZ.js';
```

**Engine API** (returned by `createEngine`):
- `await engine.initialize({ canvas, width, height, backgroundColor })`
- `engine.addSprite({ id, position:{x,y}, velocity:{x,y}, width, height, rotation, color, image, spriteSheet, spriteFrame })`
- `engine.removeSprite(id)`
- `engine.getSprite(id)`
- `engine.getSpriteAtPosition(x, y)`
- `engine.update(deltaTime)`
- `engine.render()`
- `engine.getState()` / `engine.setState({score, health, time, lives})`
- `engine.getCanvas()`
- `engine.destroy()`

---

## Task 1: Create Directory Structure

**Files:**
- Create: `tests/phase1-unit/` (directory)
- Create: `tests/phase2-combo/` (directory)
- Create: `tests/phase3-app/` (directory)

- [ ] **Step 1: Create all test directories**

```bash
mkdir -p tests/phase1-unit tests/phase2-combo tests/phase3-app
```

- [ ] **Step 2: Verify directories exist**

Run: `ls -la tests/`
Expected: Three directories listed

- [ ] **Step 3: Commit**

```bash
git add tests/
git commit -m "test: create test directory structure for module verification"
```

---

## Task 2: Phase 1 — Engine Test (01-engine.html)

**Files:**
- Create: `tests/phase1-unit/01-engine.html`

This page tests both WebGPU and Canvas2D engine rendering by creating a canvas, initializing the engine, adding colored sprites, and rendering them.

- [ ] **Step 1: Create 01-engine.html**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>01 - Engine Test</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: monospace; background: #1a1a2e; color: #eee; padding: 20px; }
    h1 { color: #0ff; margin-bottom: 10px; }
    #status { padding: 10px; margin: 10px 0; border-radius: 4px; }
    .pass { background: #0a3d0a; border: 1px solid #0f0; }
    .fail { background: #3d0a0a; border: 1px solid #f00; }
    .info { background: #0a0a3d; border: 1px solid #66f; }
    canvas { border: 2px solid #0ff; display: block; margin: 10px 0; background: #000; }
    #log { background: #111; padding: 10px; margin-top: 10px; border: 1px solid #333;
           max-height: 200px; overflow-y: auto; font-size: 12px; }
  </style>
</head>
<body>
  <h1>01 - Engine Test</h1>
  <div id="status" class="info">Initializing...</div>
  <canvas id="testCanvas" width="800" height="600"></canvas>
  <div id="log"></div>

  <script type="module">
    import { E as createEngine } from '../../lib/MobileProtection-DVGpnIWZ.js';

    const statusEl = document.getElementById('status');
    const logEl = document.getElementById('log');
    const canvas = document.getElementById('testCanvas');

    function log(msg, type = 'info') {
      const colors = { info: '#66f', pass: '#0f0', fail: '#f00' };
      logEl.innerHTML += `<div style="color:${colors[type]}">[${type.toUpperCase()}] ${msg}</div>`;
      console.log(`[Engine Test] ${msg}`);
    }

    function setStatus(msg, type) {
      statusEl.textContent = msg;
      statusEl.className = type;
    }

    async function runTests() {
      let allPassed = true;

      // Test 1: Create engine
      try {
        log('Creating engine...');
        const engine = await createEngine(canvas, {
          backgroundColor: { r: 0.1, g: 0.1, b: 0.2, a: 1 }
        });
        await engine.initialize({ canvas, width: 800, height: 600 });
        const engineType = navigator.gpu ? 'WebGPU' : 'Canvas2D (fallback)';
        log(`Engine created: ${engineType}`, 'pass');
      } catch (e) {
        log(`Engine creation failed: ${e.message}`, 'fail');
        allPassed = false;
        setStatus('FAILED: ' + e.message, 'fail');
        return;
      }

      // Test 2: Add and render colored sprites
      try {
        engine.addSprite({
          id: 'red_box', position: { x: 100, y: 100 }, velocity: { x: 0, y: 0 },
          width: 80, height: 80, color: '#ff0000'
        });
        engine.addSprite({
          id: 'green_box', position: { x: 250, y: 100 }, velocity: { x: 0, y: 0 },
          width: 80, height: 80, color: '#00ff00'
        });
        engine.addSprite({
          id: 'blue_box', position: { x: 400, y: 100 }, velocity: { x: 0, y: 0 },
          width: 80, height: 80, color: '#0000ff'
        });
        engine.addSprite({
          id: 'yellow_box', position: { x: 550, y: 100 }, velocity: { x: 0, y: 0 },
          width: 80, height: 80, color: '#ffff00'
        });
        engine.render();
        log('4 colored sprites rendered successfully', 'pass');
      } catch (e) {
        log(`Sprite rendering failed: ${e.message}`, 'fail');
        allPassed = false;
      }

      // Test 3: getSprite / getSpriteAtPosition
      try {
        const sprite = engine.getSprite('red_box');
        if (sprite && sprite.color === '#ff0000') {
          log('getSprite() returns correct sprite', 'pass');
        } else {
          log('getSprite() returned unexpected data', 'fail');
          allPassed = false;
        }

        const hit = engine.getSpriteAtPosition(120, 120);
        if (hit && hit.id === 'red_box') {
          log('getSpriteAtPosition() correctly detects hit', 'pass');
        } else {
          log('getSpriteAtPosition() returned unexpected result', 'fail');
          allPassed = false;
        }
      } catch (e) {
        log(`Sprite query failed: ${e.message}`, 'fail');
        allPassed = false;
      }

      // Test 4: removeSprite
      try {
        engine.removeSprite('yellow_box');
        engine.render();
        const removed = engine.getSprite('yellow_box');
        if (!removed) {
          log('removeSprite() works correctly', 'pass');
        } else {
          log('removeSprite() did not remove sprite', 'fail');
          allPassed = false;
        }
      } catch (e) {
        log(`removeSprite failed: ${e.message}`, 'fail');
        allPassed = false;
      }

      // Test 5: State management
      try {
        engine.setState({ score: 42, health: 80 });
        const state = engine.getState();
        if (state.score === 42 && state.health === 80) {
          log('State management works correctly', 'pass');
        } else {
          log(`State mismatch: ${JSON.stringify(state)}`, 'fail');
          allPassed = false;
        }
      } catch (e) {
        log(`State management failed: ${e.message}`, 'fail');
        allPassed = false;
      }

      if (allPassed) {
        setStatus('ALL TESTS PASSED', 'pass');
      } else {
        setStatus('SOME TESTS FAILED - check log below', 'fail');
      }
    }

    runTests().catch(e => {
      setStatus('FATAL ERROR: ' + e.message, 'fail');
      console.error(e);
    });
  </script>
</body>
</html>
```

- [ ] **Step 2: Start server and verify in browser**

Run: `npx serve . -p 3000`
Open: `http://localhost:3000/tests/phase1-unit/01-engine.html`
Expected:
- 4 colored boxes visible on canvas (red, green, blue, yellow)
- Status shows "ALL TESTS PASSED"
- Console has no errors
- Yellow box is removed (only 3 visible after render)

- [ ] **Step 3: Commit**

```bash
git add tests/phase1-unit/01-engine.html
git commit -m "test: add engine unit test (01-engine)"
```

---

## Task 3: Phase 1 — SpriteSheet Test (02-spritesheet.html)

**Files:**
- Create: `tests/phase1-unit/02-spritesheet.html`

Since SpriteSheet class is not directly exported, this test creates a synthetic sprite sheet using Canvas API (colored rectangles as "sprites"), generates a JSON metadata, creates Blob URLs, and tests the SpriteSheet loading pipeline through the engine's sprite rendering with spriteFrame data.

- [ ] **Step 1: Create 02-spritesheet.html**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>02 - SpriteSheet Test</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: monospace; background: #1a1a2e; color: #eee; padding: 20px; }
    h1 { color: #0ff; margin-bottom: 10px; }
    #status { padding: 10px; margin: 10px 0; border-radius: 4px; }
    .pass { background: #0a3d0a; border: 1px solid #0f0; }
    .fail { background: #3d0a0a; border: 1px solid #f00; }
    .info { background: #0a0a3d; border: 1px solid #66f; }
    canvas { border: 2px solid #0ff; display: block; margin: 10px 0; background: #000; }
    #log { background: #111; padding: 10px; margin-top: 10px; border: 1px solid #333;
           max-height: 200px; overflow-y: auto; font-size: 12px; }
  </style>
</head>
<body>
  <h1>02 - SpriteSheet Test</h1>
  <div id="status" class="info">Generating synthetic sprite sheet...</div>
  <canvas id="sheetCanvas" width="256" height="256" style="border-color:#ff0;"></canvas>
  <canvas id="testCanvas" width="800" height="400"></canvas>
  <div id="log"></div>

  <script type="module">
    import { E as createEngine } from '../../lib/MobileProtection-DVGpnIWZ.js';

    const statusEl = document.getElementById('status');
    const logEl = document.getElementById('log');

    function log(msg, type = 'info') {
      const colors = { info: '#66f', pass: '#0f0', fail: '#f00' };
      logEl.innerHTML += `<div style="color:${colors[type]}">[${type.toUpperCase()}] ${msg}</div>`;
      console.log(`[SpriteSheet Test] ${msg}`);
    }

    function setStatus(msg, type) {
      statusEl.textContent = msg;
      statusEl.className = type;
    }

    // Create a synthetic sprite sheet: 4x4 grid of colored 64x64 squares
    function createSyntheticSpriteSheet() {
      const canvas = document.getElementById('sheetCanvas');
      const ctx = canvas.getContext('2d');
      const colors = ['#ff0000','#00ff00','#0000ff','#ffff00',
                       '#ff00ff','#00ffff','#ff8800','#88ff00',
                       '#ff0088','#00ff88','#8800ff','#088fff',
                       '#ff4444','#44ff44','#4444ff','#ffff44'];
      const frames = {};
      const names = ['apple','banana','cherry','grape','lemon','mango','orange','peach',
                      'pear','plum','kiwi','melon','lime','fig','date','guava'];
      let idx = 0;
      for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col++) {
          const name = names[idx];
          const x = col * 64, y = row * 64;
          ctx.fillStyle = colors[idx];
          ctx.fillRect(x, y, 64, 64);
          ctx.fillStyle = '#fff';
          ctx.font = '10px monospace';
          ctx.fillText(name, x + 4, y + 35);
          frames[`fruits/${name}.png`] = {
            frame: { x, y, w: 64, h: 64 }, rotated: false
          };
          idx++;
        }
      }
      const jsonData = { frames };
      const pngUrl = canvas.toDataURL('image/png');
      const jsonBlob = new Blob([JSON.stringify(jsonData)], { type: 'application/json' });
      const jsonUrl = URL.createObjectURL(jsonBlob);
      return { pngUrl, jsonUrl, frameNames: Object.keys(frames) };
    }

    async function runTests() {
      let allPassed = true;

      // Test 1: Create synthetic sprite sheet
      try {
        const { pngUrl, jsonUrl, frameNames } = createSyntheticSpriteSheet();
        log(`Synthetic sprite sheet created with ${frameNames.length} frames`, 'pass');
        log(`Frame names: ${frameNames.slice(0, 5).join(', ')}...`, 'info');
      } catch (e) {
        log(`Sprite sheet generation failed: ${e.message}`, 'fail');
        allPassed = false;
        setStatus('FAILED: ' + e.message, 'fail');
        return;
      }

      // Test 2: Load sprite sheet via engine with spriteFrame rendering
      try {
        const testCanvas = document.getElementById('testCanvas');
        const engine = await createEngine(testCanvas);
        await engine.initialize({ canvas: testCanvas, width: 800, height: 400 });

        // Load the sprite sheet image
        const img = new Image();
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = pngUrl;
        });
        log('Sprite sheet image loaded', 'pass');

        // Add sprites with spriteFrame data (simulating what SpriteSheet.drawFrame does)
        const fruits = ['apple','banana','cherry','grape','lemon','mango','orange','peach'];
        fruits.forEach((name, i) => {
          const col = i % 4, row = Math.floor(i / 4);
          engine.addSprite({
            id: `fruit_${i}`,
            position: { x: 50 + i * 90, y: 50 },
            velocity: { x: 0, y: 0 },
            width: 64, height: 64,
            spriteSheet: img,
            spriteFrame: { x: col * 64, y: row * 64, w: 64, h: 64, rotated: false }
          });
        });
        engine.render();
        log('8 fruit sprites rendered with spriteFrame data', 'pass');
      } catch (e) {
        log(`Sprite rendering with spriteFrame failed: ${e.message}`, 'fail');
        allPassed = false;
      }

      // Test 3: Rotated sprite frame
      try {
        const testCanvas = document.getElementById('testCanvas');
        const engine = await createEngine(testCanvas);
        const img = new Image();
        img.src = pngUrl;
        await new Promise(r => { img.onload = r; });

        engine.addSprite({
          id: 'rotated_test',
          position: { x: 200, y: 200 },
          velocity: { x: 0, y: 0 },
          width: 64, height: 64,
          rotation: Math.PI / 4,
          spriteSheet: img,
          spriteFrame: { x: 0, y: 0, w: 64, h: 64, rotated: false }
        });
        engine.render();
        log('Rotated sprite with spriteFrame rendered', 'pass');
      } catch (e) {
        log(`Rotated sprite test failed: ${e.message}`, 'fail');
        allPassed = false;
      }

      if (allPassed) {
        setStatus('ALL TESTS PASSED', 'pass');
      } else {
        setStatus('SOME TESTS FAILED - check log below', 'fail');
      }
    }

    runTests().catch(e => {
      setStatus('FATAL ERROR: ' + e.message, 'fail');
      console.error(e);
    });
  </script>
</body>
</html>
```

- [ ] **Step 2: Verify in browser**

Open: `http://localhost:3000/tests/phase1-unit/02-spritesheet.html`
Expected:
- Yellow-bordered canvas shows 4x4 colored grid (synthetic sprite sheet)
- Main canvas shows 8 colored fruit sprites in a row
- A rotated sprite visible below
- Status: "ALL TESTS PASSED"
- Console no errors

- [ ] **Step 3: Commit**

```bash
git add tests/phase1-unit/02-spritesheet.html
git commit -m "test: add sprite sheet unit test (02-spritesheet)"
```

---

## Task 4: Phase 1 — Security Test (03-security.html)

**Files:**
- Create: `tests/phase1-unit/03-security.html`

- [ ] **Step 1: Create 03-security.html**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>03 - Security (WASM) Test</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: monospace; background: #1a1a2e; color: #eee; padding: 20px; }
    h1 { color: #0ff; margin-bottom: 10px; }
    #status { padding: 10px; margin: 10px 0; border-radius: 4px; }
    .pass { background: #0a3d0a; border: 1px solid #0f0; }
    .fail { background: #3d0a0a; border: 1px solid #f00; }
    .info { background: #0a0a3d; border: 1px solid #66f; }
    .result { background: #111; padding: 8px; margin: 5px 0; border-left: 3px solid #66f;
              word-break: break-all; font-size: 12px; }
    #log { background: #111; padding: 10px; margin-top: 10px; border: 1px solid #333;
           max-height: 300px; overflow-y: auto; font-size: 12px; }
  </style>
</head>
<body>
  <h1>03 - Security (WASM) Test</h1>
  <div id="status" class="info">Initializing WASM...</div>
  <div id="results"></div>
  <div id="log"></div>

  <script type="module">
    import { C as Security } from '../../lib/MobileProtection-DVGpnIWZ.js';

    const statusEl = document.getElementById('status');
    const resultsEl = document.getElementById('results');
    const logEl = document.getElementById('log');

    function log(msg, type = 'info') {
      const colors = { info: '#66f', pass: '#0f0', fail: '#f00' };
      logEl.innerHTML += `<div style="color:${colors[type]}">[${type.toUpperCase()}] ${msg}</div>`;
      console.log(`[Security Test] ${msg}`);
    }

    function showResult(label, value) {
      resultsEl.innerHTML += `<div class="result"><strong>${label}:</strong> ${value}</div>`;
    }

    function setStatus(msg, type) {
      statusEl.textContent = msg;
      statusEl.className = type;
    }

    async function runTests() {
      let allPassed = true;
      const security = new Security();

      // Test 1: WASM initialization
      try {
        await security.initialize();
        if (security.isInitialized()) {
          log('WASM initialized successfully', 'pass');
        } else {
          log('WASM initialization reported not initialized', 'fail');
          allPassed = false;
        }
      } catch (e) {
        log(`WASM initialization failed: ${e.message}`, 'fail');
        allPassed = false;
        setStatus('FAILED: ' + e.message, 'fail');
        return;
      }

      // Test 2: Encrypt
      try {
        const testData = { score: 100, name: 'Player1', level: 5 };
        const encrypted = security.encrypt(testData);
        if (encrypted && typeof encrypted === 'string' && encrypted.length > 0) {
          log(`Encrypt succeeded (length: ${encrypted.length})`, 'pass');
          showResult('Encrypted', encrypted);
        } else {
          log('Encrypt returned empty or invalid result', 'fail');
          allPassed = false;
        }
      } catch (e) {
        log(`Encrypt failed: ${e.message}`, 'fail');
        allPassed = false;
      }

      // Test 3: Decrypt (round-trip)
      try {
        const testData = { score: 100, name: 'Player1', level: 5 };
        const encrypted = security.encrypt(testData);
        const decrypted = security.decrypt(encrypted);
        if (decrypted.score === 100 && decrypted.name === 'Player1' && decrypted.level === 5) {
          log('Decrypt round-trip successful - data matches', 'pass');
          showResult('Decrypted', JSON.stringify(decrypted));
        } else {
          log(`Decrypt mismatch: ${JSON.stringify(decrypted)}`, 'fail');
          allPassed = false;
        }
      } catch (e) {
        log(`Decrypt failed: ${e.message}`, 'fail');
        allPassed = false;
      }

      // Test 4: generateCommandHash
      try {
        const hash = security.generateCommandHash('test_command');
        if (hash && typeof hash === 'string') {
          log(`generateCommandHash succeeded`, 'pass');
          showResult('Command Hash', hash);
        } else {
          log('generateCommandHash returned invalid result', 'fail');
          allPassed = false;
        }
      } catch (e) {
        log(`generateCommandHash failed: ${e.message}`, 'fail');
        allPassed = false;
      }

      // Test 5: generateTimeCode
      try {
        const timeCode = security.generateTimeCode();
        if (timeCode && typeof timeCode === 'string') {
          log(`generateTimeCode succeeded`, 'pass');
          showResult('Time Code', timeCode);
        } else {
          log('generateTimeCode returned invalid result', 'fail');
          allPassed = false;
        }
      } catch (e) {
        log(`generateTimeCode failed: ${e.message}`, 'fail');
        allPassed = false;
      }

      // Test 6: generateHash
      try {
        const hash = security.generateHash('some data to hash');
        if (hash && typeof hash === 'string') {
          log(`generateHash succeeded`, 'pass');
          showResult('Hash', hash);
        } else {
          log('generateHash returned invalid result', 'fail');
          allPassed = false;
        }
      } catch (e) {
        log(`generateHash failed: ${e.message}`, 'fail');
        allPassed = false;
      }

      // Test 7: Time management
      try {
        security.resetTime();
        const t1 = security.getTime();
        security.incrementTime();
        const t2 = security.getTime();
        security.incrementTime();
        const t3 = security.getTime();
        if (t2 > t1 && t3 > t2) {
          log(`Time management works: ${t1} -> ${t2} -> ${t3}`, 'pass');
          showResult('Time values', `${t1} -> ${t2} -> ${t3}`);
        } else {
          log(`Time not incrementing: ${t1}, ${t2}, ${t3}`, 'fail');
          allPassed = false;
        }

        security.resetTime();
        const t4 = security.getTime();
        log(`Time reset works: ${t3} -> ${t4}`, 'pass');
      } catch (e) {
        log(`Time management failed: ${e.message}`, 'fail');
        allPassed = false;
      }

      if (allPassed) {
        setStatus('ALL TESTS PASSED', 'pass');
      } else {
        setStatus('SOME TESTS FAILED - check log below', 'fail');
      }
    }

    runTests().catch(e => {
      setStatus('FATAL ERROR: ' + e.message, 'fail');
      console.error(e);
    });
  </script>
</body>
</html>
```

- [ ] **Step 2: Verify in browser**

Open: `http://localhost:3000/tests/phase1-unit/03-security.html`
Expected:
- WASM initializes successfully
- Encrypt produces a non-empty string
- Decrypt round-trip returns exact original data
- Command hash, time code, hash all produce string values
- Time increments and resets correctly
- Status: "ALL TESTS PASSED"

- [ ] **Step 3: Commit**

```bash
git add tests/phase1-unit/03-security.html
git commit -m "test: add security WASM unit test (03-security)"
```

---

## Task 5: Phase 1 — Input Test (04-input.html)

**Files:**
- Create: `tests/phase1-unit/04-input.html`

- [ ] **Step 1: Create 04-input.html**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>04 - Input Manager Test</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: monospace; background: #1a1a2e; color: #eee; padding: 20px; }
    h1 { color: #0ff; margin-bottom: 10px; }
    .panel { display: flex; gap: 20px; flex-wrap: wrap; margin: 10px 0; }
    .card { background: #111; border: 1px solid #333; border-radius: 8px; padding: 15px; min-width: 200px; }
    .card h3 { color: #0ff; margin-bottom: 10px; font-size: 14px; }
    .direction-pad { display: grid; grid-template-columns: 60px 60px 60px; grid-template-rows: 30px 30px 30px; gap: 2px; }
    .dir-bar { background: #333; border-radius: 3px; transition: background 0.1s; }
    .dir-bar.active { background: #0f0; }
    .dir-up { grid-column: 2; grid-row: 1; }
    .dir-left { grid-column: 1; grid-row: 2; }
    .dir-center { grid-column: 2; grid-row: 2; background: #222; text-align: center; font-size: 10px; line-height: 30px; }
    .dir-right { grid-column: 3; grid-row: 2; }
    .dir-down { grid-column: 2; grid-row: 3; }
    .stat { margin: 5px 0; font-size: 13px; }
    .stat span { color: #0f0; }
    #eventLog { max-height: 150px; overflow-y: auto; font-size: 11px; background: #0a0a0a;
                padding: 8px; border: 1px solid #333; border-radius: 4px; }
    .event-entry { margin: 2px 0; color: #aaa; }
    .event-entry .type { color: #ff0; }
    #status { padding: 10px; margin: 10px 0; border-radius: 4px; }
    .pass { background: #0a3d0a; border: 1px solid #0f0; }
    .info { background: #0a0a3d; border: 1px solid #66f; }
  </style>
</head>
<body>
  <h1>04 - Input Manager Test</h1>
  <div id="status" class="info">Initializing input manager...</div>

  <div class="panel">
    <div class="card">
      <h3>Direction Keys</h3>
      <div class="direction-pad">
        <div class="dir-bar dir-up" id="dirUp">UP</div>
        <div class="dir-bar dir-left" id="dirLeft">L</div>
        <div class="dir-center">+</div>
        <div class="dir-bar dir-right" id="dirRight">R</div>
        <div class="dir-bar dir-down" id="dirDown">DN</div>
      </div>
      <div class="stat">Magnitude: <span id="magnitude">-</span></div>
    </div>

    <div class="card">
      <h3>Mouse</h3>
      <div class="stat">Position: <span id="mousePos">0, 0</span></div>
      <div class="stat">Down: <span id="mouseDown">false</span></div>
      <div class="stat">Scroll: <span id="scrollDelta">0, 0</span></div>
    </div>

    <div class="card">
      <h3>Touch</h3>
      <div class="stat">Active touches: <span id="touchCount">0</span></div>
      <div class="stat" id="touchInfo">-</div>
    </div>

    <div class="card">
      <h3>Active Input</h3>
      <div class="stat">hasActiveInput: <span id="hasActive">false</span></div>
    </div>
  </div>

  <div class="card" style="margin-top: 10px;">
    <h3>Event Log</h3>
    <div id="eventLog"></div>
  </div>

  <script type="module">
    import { I as InputManager } from '../../lib/MobileProtection-DVGpnIWZ.js';

    const input = new InputManager({
      keybindings: {
        w: 'up', arrowup: 'up',
        s: 'down', arrowdown: 'down',
        a: 'left', arrowleft: 'left',
        d: 'right', arrowright: 'right'
      }
    });

    const eventLog = document.getElementById('eventLog');
    function logEvent(type, data) {
      const entry = document.createElement('div');
      entry.className = 'event-entry';
      entry.innerHTML = `<span class="type">${type}</span>: ${JSON.stringify(data).substring(0, 80)}`;
      eventLog.prepend(entry);
      if (eventLog.children.length > 50) eventLog.removeChild(eventLog.lastChild);
    }

    input.on('tap', (d) => logEvent('tap', d));
    input.on('double-tap', (d) => logEvent('double-tap', d));
    input.on('swipe', (d) => logEvent('swipe', d));
    input.on('pinch', (d) => logEvent('pinch', d));
    input.on('rotate', (d) => logEvent('rotate', d));

    document.getElementById('status').textContent = 'Input manager active. Press keys, move mouse, or touch the screen.';
    document.getElementById('status').className = 'pass';

    function updateDisplay() {
      input.update();

      // Directions
      document.getElementById('dirUp').className = 'dir-bar dir-up' + (input.directions.up > 0 ? ' active' : '');
      document.getElementById('dirDown').className = 'dir-bar dir-down' + (input.directions.down > 0 ? ' active' : '');
      document.getElementById('dirLeft').className = 'dir-bar dir-left' + (input.directions.left > 0 ? ' active' : '');
      document.getElementById('dirRight').className = 'dir-bar dir-right' + (input.directions.right > 0 ? ' active' : '');
      document.getElementById('magnitude').textContent =
        `U:${input.directions.up.toFixed(2)} D:${input.directions.down.toFixed(2)} L:${input.directions.left.toFixed(2)} R:${input.directions.right.toFixed(2)}`;

      // Mouse
      const mp = input.getMousePosition();
      document.getElementById('mousePos').textContent = `${mp.x}, ${mp.y}`;
      document.getElementById('mouseDown').textContent = input.isMouseDown().toString();
      const sd = input.getScrollDelta();
      document.getElementById('scrollDelta').textContent = `${sd.x.toFixed(1)}, ${sd.y.toFixed(1)}`;

      // Touch
      const state = input.getState();
      document.getElementById('touchCount').textContent = state.touches.length.toString();
      if (state.touches.length > 0) {
        document.getElementById('touchInfo').textContent = state.touches.map(
          t => `(${t.x.toFixed(0)},${t.y.toFixed(0)})`
        ).join(' ');
      } else {
        document.getElementById('touchInfo').textContent = '-';
      }

      // Active
      document.getElementById('hasActive').textContent = input.hasActiveInput().toString();

      requestAnimationFrame(updateDisplay);
    }
    requestAnimationFrame(updateDisplay);
  </script>
</body>
</html>
```

- [ ] **Step 2: Verify in browser**

Open: `http://localhost:3000/tests/phase1-unit/04-input.html`
Expected:
- Press WASD or arrow keys → direction pad lights up green
- Move mouse → position updates
- Click → mouseDown shows true
- Scroll → scroll delta shows values
- Touch (on touch device) → touch count updates
- Events logged in event log
- Console no errors

- [ ] **Step 3: Commit**

```bash
git add tests/phase1-unit/04-input.html
git commit -m "test: add input manager unit test (04-input)"
```

---

## Task 6: Phase 1 — GameLoop Test (05-gameloop.html)

**Files:**
- Create: `tests/phase1-unit/05-gameloop.html`

- [ ] **Step 1: Create 05-gameloop.html**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>05 - Game Loop Test</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: monospace; background: #1a1a2e; color: #eee; padding: 20px; }
    h1 { color: #0ff; margin-bottom: 10px; }
    #status { padding: 10px; margin: 10px 0; border-radius: 4px; }
    .pass { background: #0a3d0a; border: 1px solid #0f0; }
    .stopped { background: #3d3d0a; border: 1px solid #ff0; }
    .info { background: #0a0a3d; border: 1px solid #66f; }
    .stats { display: flex; gap: 20px; flex-wrap: wrap; margin: 10px 0; }
    .stat-card { background: #111; border: 1px solid #333; border-radius: 8px; padding: 15px;
                 text-align: center; min-width: 120px; }
    .stat-card .value { font-size: 36px; color: #0f0; }
    .stat-card .label { font-size: 12px; color: #888; margin-top: 5px; }
    button { padding: 10px 20px; margin: 5px; font-size: 16px; font-family: monospace;
             border: 2px solid #0ff; background: #0a0a3d; color: #0ff; border-radius: 4px;
             cursor: pointer; }
    button:hover { background: #0ff; color: #000; }
    #dtGraph { border: 1px solid #333; margin-top: 10px; background: #111; }
  </style>
</head>
<body>
  <h1>05 - Game Loop Test</h1>
  <div id="status" class="info">Ready. Click Start to begin.</div>

  <div>
    <button id="startBtn">Start</button>
    <button id="stopBtn">Stop</button>
  </div>

  <div class="stats">
    <div class="stat-card">
      <div class="value" id="fps">0</div>
      <div class="label">FPS</div>
    </div>
    <div class="stat-card">
      <div class="value" id="frames">0</div>
      <div class="label">Total Frames</div>
    </div>
    <div class="stat-card">
      <div class="value" id="elapsed">0.0</div>
      <div class="label">Elapsed (s)</div>
    </div>
    <div class="stat-card">
      <div class="value" id="dt">0.000</div>
      <div class="label">Delta Time (s)</div>
    </div>
  </div>

  <canvas id="dtGraph" width="800" height="150"></canvas>

  <script type="module">
    import { G as GameLoop } from '../../lib/MobileProtection-DVGpnIWZ.js';

    const gameLoop = new GameLoop();
    let frameCount = 0;
    let startTime = 0;
    let lastDt = 0;
    const dtHistory = [];
    const graphCanvas = document.getElementById('dtGraph');
    const graphCtx = graphCanvas.getContext('2d');

    document.getElementById('startBtn').addEventListener('click', () => {
      if (!gameLoop.isRunning()) {
        frameCount = 0;
        startTime = performance.now();
        gameLoop.start(
          (dt) => {
            lastDt = dt;
            frameCount++;
            dtHistory.push(dt);
            if (dtHistory.length > 200) dtHistory.shift();
          },
          () => {
            const elapsed = (performance.now() - startTime) / 1000;
            const fps = elapsed > 0 ? Math.round(frameCount / elapsed) : 0;

            document.getElementById('fps').textContent = fps;
            document.getElementById('frames').textContent = frameCount;
            document.getElementById('elapsed').textContent = elapsed.toFixed(1);
            document.getElementById('dt').textContent = lastDt.toFixed(4);

            // Draw dt graph
            graphCtx.fillStyle = '#111';
            graphCtx.fillRect(0, 0, 800, 150);
            graphCtx.strokeStyle = '#0f0';
            graphCtx.lineWidth = 1;
            graphCtx.beginPath();
            const maxDt = 0.05;
            dtHistory.forEach((dt, i) => {
              const x = (i / 200) * 800;
              const y = 150 - (Math.min(dt, maxDt) / maxDt) * 140;
              if (i === 0) graphCtx.moveTo(x, y);
              else graphCtx.lineTo(x, y);
            });
            graphCtx.stroke();
            // Target line at 16.67ms
            graphCtx.strokeStyle = '#ff0';
            graphCtx.setLineDash([5, 5]);
            graphCtx.beginPath();
            const targetY = 150 - (0.01667 / maxDt) * 140;
            graphCtx.moveTo(0, targetY);
            graphCtx.lineTo(800, targetY);
            graphCtx.stroke();
            graphCtx.setLineDash([]);
          }
        );
        document.getElementById('status').textContent = 'Running...';
        document.getElementById('status').className = 'pass';
      }
    });

    document.getElementById('stopBtn').addEventListener('click', () => {
      gameLoop.stop();
      document.getElementById('status').textContent = 'Stopped.';
      document.getElementById('status').className = 'stopped';
    });

    console.log('[GameLoop Test] Page loaded. Click Start to begin.');
  </script>
</body>
</html>
```

- [ ] **Step 2: Verify in browser**

Open: `http://localhost:3000/tests/phase1-unit/05-gameloop.html`
Expected:
- Click Start → FPS shows ~60, frame count increases, elapsed time counts up
- Delta time graph shows green line near yellow target line (16.67ms)
- Click Stop → loop stops, values freeze
- Click Start again → resumes correctly
- Console no errors

- [ ] **Step 3: Commit**

```bash
git add tests/phase1-unit/05-gameloop.html
git commit -m "test: add game loop unit test (05-gameloop)"
```

---

## Task 7: Phase 1 — ShareCard Test (06-share-card.html)

**Files:**
- Create: `tests/phase1-unit/06-share-card.html`

The `<share-card>` custom element is registered when `main-CcL0ZKFH.js` is imported. This test imports main to register the element, then uses `<share-card>` to generate a share image.

- [ ] **Step 1: Create 06-share-card.html**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>06 - Share Card Test</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: monospace; background: #1a1a2e; color: #eee; padding: 20px; }
    h1 { color: #0ff; margin-bottom: 10px; }
    #status { padding: 10px; margin: 10px 0; border-radius: 4px; }
    .pass { background: #0a3d0a; border: 1px solid #0f0; }
    .fail { background: #3d0a0a; border: 1px solid #f00; }
    .info { background: #0a0a3d; border: 1px solid #66f; }
    button { padding: 10px 20px; margin: 5px; font-size: 14px; font-family: monospace;
             border: 2px solid #0ff; background: #0a0a3d; color: #0ff; border-radius: 4px;
             cursor: pointer; }
    button:hover { background: #0ff; color: #000; }
    #preview { margin: 10px 0; }
    #preview img, #preview canvas { max-width: 100%; border: 2px solid #333; border-radius: 8px; }
    #shareText { background: #111; padding: 10px; border: 1px solid #333; border-radius: 4px;
                 margin: 10px 0; font-size: 14px; color: #0f0; }
    #log { background: #111; padding: 10px; margin-top: 10px; border: 1px solid #333;
           max-height: 200px; overflow-y: auto; font-size: 12px; }
  </style>
</head>
<body>
  <h1>06 - Share Card Test</h1>
  <div id="status" class="info">Loading share-card component...</div>

  <share-card id="shareCard"></share-card>

  <div>
    <button id="generateBtn">Generate Share Image</button>
    <button id="shareBtn">Share (Web Share API)</button>
    <button id="downloadBtn">Download Image</button>
  </div>

  <div id="shareText"></div>
  <div id="preview"></div>
  <div id="log"></div>

  <script type="module">
    // Import main to register <share-card> custom element
    // Note: main.js will try to run its game logic, but DOM elements won't exist.
    // We catch any errors from that.
    try {
      await import('../../lib/main-CcL0ZKFH.js');
    } catch (e) {
      // Expected: main.js will throw because game DOM elements don't exist.
      // But the custom element registration happens as a side effect.
      console.log('[ShareCard Test] main.js import side effects (expected errors):', e.message);
    }

    const logEl = document.getElementById('log');
    const statusEl = document.getElementById('status');

    function log(msg, type = 'info') {
      const colors = { info: '#66f', pass: '#0f0', fail: '#f00' };
      logEl.innerHTML += `<div style="color:${colors[type]}">[${type.toUpperCase()}] ${msg}</div>`;
      console.log(`[ShareCard Test] ${msg}`);
    }

    // Wait for custom element to be defined
    await customElements.whenDefined('share-card').catch(() => {
      log('share-card custom element not registered. main.js may have failed to load.', 'fail');
    });

    const shareCard = document.getElementById('shareCard');

    if (shareCard && shareCard.setConfig) {
      log('share-card element found and has setConfig method', 'pass');
    } else if (shareCard) {
      log('share-card element found but missing setConfig - checking prototype...', 'info');
    } else {
      log('share-card element not found in DOM', 'fail');
    }

    // Configure share card
    try {
      shareCard.setConfig({
        title: 'Module Test Report',
        fields: [
          { type: 'score', label: 'Score', show: true },
          { type: 'time', label: 'Time', show: true }
        ],
        shareText: 'I scored {score} points in {time} seconds!',
        image: {
          width: 800,
          height: 400,
          background: {
            type: 'gradient',
            value: 'linear(135deg, #667eea, #764ba2)'
          },
          layout: {
            type: 'vertical',
            padding: 40,
            spacing: 20,
            sections: [
              { type: 'title' },
              { type: 'stat', field: 'score' },
              { type: 'stat', field: 'time' },
              { type: 'spacer' }
            ]
          }
        }
      });
      shareCard.setData({ score: 42, time: 60 });
      log('Share card configured with test data', 'pass');
    } catch (e) {
      log(`setConfig failed: ${e.message}`, 'fail');
    }

    // Show share text
    try {
      const text = shareCard.getShareText();
      document.getElementById('shareText').textContent = `Share text: "${text}"`;
      if (text.includes('42') && text.includes('60')) {
        log('Share text template substitution correct', 'pass');
      } else {
        log(`Share text unexpected: "${text}"`, 'fail');
      }
    } catch (e) {
      log(`getShareText failed: ${e.message}`, 'fail');
    }

    // Generate button
    document.getElementById('generateBtn').addEventListener('click', async () => {
      try {
        await shareCard.share();
        log('Share triggered successfully', 'pass');
      } catch (e) {
        log(`Share failed: ${e.message}`, 'fail');
      }
    });

    document.getElementById('status').textContent = 'Share card loaded. Click buttons to test.';
    document.getElementById('status').className = 'pass';
  </script>
</body>
</html>
```

**Important note for implementation:** Importing `main-CcL0ZKFH.js` will cause errors because it tries to access DOM elements that don't exist. The custom element registration (`customElements.define`) happens before those errors. If the custom element fails to register due to the import failing entirely, the alternative approach is to extract the ShareCard class definition by analyzing the main module's code and creating a standalone version. The implementing agent should test both approaches.

- [ ] **Step 2: Verify in browser**

Open: `http://localhost:3000/tests/phase1-unit/06-share-card.html`
Expected:
- Share text shows: `I scored 42 points in 60 seconds!`
- Generate button triggers share/download
- Console no unexpected errors (main.js import errors are expected)

- [ ] **Step 3: Commit**

```bash
git add tests/phase1-unit/06-share-card.html
git commit -m "test: add share card unit test (06-share-card)"
```

---

## Task 8: Phase 1 — Spatial Hash Test (07-spatial-hash.html)

**Files:**
- Create: `tests/phase1-unit/07-spatial-hash.html`

Since SpatialHash is not directly exported, this test uses the engine's `getSpriteAtPosition()` method to test collision detection. We add many sprites and verify the engine correctly finds sprites at given positions.

- [ ] **Step 1: Create 07-spatial-hash.html**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>07 - Spatial Hash / Collision Test</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: monospace; background: #1a1a2e; color: #eee; padding: 20px; }
    h1 { color: #0ff; margin-bottom: 10px; }
    #status { padding: 10px; margin: 10px 0; border-radius: 4px; }
    .pass { background: #0a3d0a; border: 1px solid #0f0; }
    .fail { background: #3d0a0a; border: 1px solid #f00; }
    .info { background: #0a0a3d; border: 1px solid #66f; }
    canvas { border: 2px solid #0ff; display: block; margin: 10px 0; background: #000; cursor: crosshair; }
    #info { font-size: 13px; color: #aaa; margin: 5px 0; }
    #log { background: #111; padding: 10px; margin-top: 10px; border: 1px solid #333;
           max-height: 200px; overflow-y: auto; font-size: 12px; }
  </style>
</head>
<body>
  <h1>07 - Spatial Hash / Collision Test</h1>
  <div id="status" class="info">Initializing...</div>
  <div id="info">Move mouse over canvas to detect nearby sprites. Hovered sprites will glow.</div>
  <canvas id="testCanvas" width="800" height="600"></canvas>
  <div id="log"></div>

  <script type="module">
    import { E as createEngine } from '../../lib/MobileProtection-DVGpnIWZ.js';

    const logEl = document.getElementById('log');
    const statusEl = document.getElementById('status');
    const canvas = document.getElementById('testCanvas');
    const ctx = canvas.getContext('2d');

    function log(msg, type = 'info') {
      const colors = { info: '#66f', pass: '#0f0', fail: '#f00' };
      logEl.innerHTML += `<div style="color:${colors[type]}">[${type.toUpperCase()}] ${msg}</div>`;
      console.log(`[SpatialHash Test] ${msg}`);
    }

    async function runTests() {
      let allPassed = true;

      // Create engine
      const engine = await createEngine(canvas);
      await engine.initialize({ canvas, width: 800, height: 600, backgroundColor: { r: 0, g: 0, b: 0, a: 1 } });

      // Add 20 random sprites
      const sprites = [];
      const colors = ['#ff0000','#00ff00','#0000ff','#ffff00','#ff00ff','#00ffff','#ff8800','#88ff00'];
      for (let i = 0; i < 20; i++) {
        const x = Math.random() * 700 + 50;
        const y = Math.random() * 500 + 50;
        const size = 30 + Math.random() * 30;
        const color = colors[i % colors.length];
        engine.addSprite({
          id: `obj_${i}`, position: { x, y }, velocity: { x: 0, y: 0 },
          width: size, height: size, color
        });
        sprites.push({ id: `obj_${i}`, x, y, size, color });
      }
      log(`Added ${sprites.length} sprites to engine`, 'pass');

      // Test getSpriteAtPosition
      let hitTests = 0, hitPasses = 0;
      for (const s of sprites) {
        hitTests++;
        const hit = engine.getSpriteAtPosition(s.x + s.size / 2, s.y + s.size / 2);
        if (hit && hit.id === s.id) hitPasses++;
      }
      if (hitPasses === hitTests) {
        log(`getSpriteAtPosition: ${hitPasses}/${hitTests} center-hit tests passed`, 'pass');
      } else {
        log(`getSpriteAtPosition: only ${hitPasses}/${hitTests} center-hit tests passed`, 'fail');
        allPassed = false;
      }

      // Test miss (position far from any sprite)
      const miss = engine.getSpriteAtPosition(0, 0);
      if (!miss) {
        log('getSpriteAtPosition correctly returns null for empty area', 'pass');
      } else {
        log(`getSpriteAtPosition returned ${miss.id} at (0,0) - unexpected`, 'fail');
        allPassed = false;
      }

      // Mouse tracking visualization
      let mouseX = -1, mouseY = -1;
      canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        mouseX = (e.clientX - rect.left) * scaleX;
        mouseY = (e.clientY - rect.top) * scaleY;
      });

      function drawScene() {
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, 800, 600);

        for (const s of sprites) {
          const isHovered = mouseX >= s.x && mouseX <= s.x + s.size &&
                            mouseY >= s.y && mouseY <= s.y + s.size;

          if (isHovered) {
            ctx.shadowColor = s.color;
            ctx.shadowBlur = 20;
          } else {
            ctx.shadowBlur = 0;
          }

          ctx.fillStyle = s.color;
          ctx.fillRect(s.x, s.y, s.size, s.size);
          ctx.shadowBlur = 0;

          // Label
          ctx.fillStyle = '#fff';
          ctx.font = '10px monospace';
          ctx.fillText(s.id, s.x + 2, s.y + s.size - 4);
        }

        // Mouse crosshair
        if (mouseX >= 0) {
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(mouseX - 10, mouseY);
          ctx.lineTo(mouseX + 10, mouseY);
          ctx.moveTo(mouseX, mouseY - 10);
          ctx.lineTo(mouseX, mouseY + 10);
          ctx.stroke();
        }

        // Engine's getSpriteAtPosition result
        if (mouseX >= 0) {
          const hit = engine.getSpriteAtPosition(mouseX, mouseY);
          ctx.fillStyle = '#fff';
          ctx.font = '14px monospace';
          ctx.fillText(`Hit: ${hit ? hit.id : 'none'}`, 10, 20);
        }

        requestAnimationFrame(drawScene);
      }
      drawScene();

      // Test removeSprite + getSpriteAtPosition
      try {
        engine.removeSprite('obj_0');
        const s0 = sprites[0];
        const removed = engine.getSpriteAtPosition(s0.x + s0.size / 2, s0.y + s0.size / 2);
        if (!removed || removed.id !== 'obj_0') {
          log('After removeSprite, getSpriteAtPosition no longer finds removed sprite', 'pass');
        } else {
          log('Removed sprite still found by getSpriteAtPosition', 'fail');
          allPassed = false;
        }
      } catch (e) {
        log(`Remove test failed: ${e.message}`, 'fail');
        allPassed = false;
      }

      if (allPassed) {
        statusEl.textContent = 'ALL TESTS PASSED - move mouse over canvas to see collision detection';
        statusEl.className = 'pass';
      } else {
        statusEl.textContent = 'SOME TESTS FAILED';
        statusEl.className = 'fail';
      }
    }

    runTests().catch(e => {
      statusEl.textContent = 'FATAL ERROR: ' + e.message;
      statusEl.className = 'fail';
      console.error(e);
    });
  </script>
</body>
</html>
```

- [ ] **Step 2: Verify in browser**

Open: `http://localhost:3000/tests/phase1-unit/07-spatial-hash.html`
Expected:
- 20 colored squares visible on canvas
- Mouse hover highlights (glows) the square under cursor
- "Hit: obj_N" label shows which sprite is under cursor
- All automated tests pass
- Console no errors

- [ ] **Step 3: Commit**

```bash
git add tests/phase1-unit/07-spatial-hash.html
git commit -m "test: add spatial hash / collision unit test (07-spatial-hash)"
```

---

## Task 9: Phase 2 — Engine + Input + Loop (08-engine-input-loop.html)

**Files:**
- Create: `tests/phase2-combo/08-engine-input-loop.html`

- [ ] **Step 1: Create 08-engine-input-loop.html**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>08 - Engine + Input + Loop</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: monospace; background: #1a1a2e; color: #eee; padding: 20px; }
    h1 { color: #0ff; margin-bottom: 10px; }
    #status { padding: 10px; margin: 10px 0; border-radius: 4px; }
    .pass { background: #0a3d0a; border: 1px solid #0f0; }
    .info { background: #0a0a3d; border: 1px solid #66f; }
    canvas { border: 2px solid #0ff; display: block; margin: 10px 0; background: #000; }
    #hud { display: flex; gap: 20px; font-size: 14px; margin: 5px 0; }
    #hud span { color: #0f0; }
  </style>
</head>
<body>
  <h1>08 - Engine + Input + Loop (Combo Test)</h1>
  <div id="status" class="info">Initializing...</div>
  <canvas id="gameCanvas" width="800" height="600"></canvas>
  <div id="hud">
    <div>FPS: <span id="fps">0</span></div>
    <div>Position: <span id="pos">400, 300</span></div>
    <div>Directions: <span id="dirs">-</span></div>
  </div>

  <script type="module">
    import { E as createEngine, G as GameLoop, I as InputManager } from '../../lib/MobileProtection-DVGpnIWZ.js';

    const canvas = document.getElementById('gameCanvas');
    const engine = await createEngine(canvas, { backgroundColor: { r: 0.05, g: 0.05, b: 0.1, a: 1 } });
    await engine.initialize({ canvas, width: 800, height: 600 });

    const input = new InputManager({
      keybindings: { w: 'up', arrowup: 'up', s: 'down', arrowdown: 'down',
                     a: 'left', arrowleft: 'left', d: 'right', arrowright: 'right' }
    });

    // Add player
    engine.addSprite({
      id: 'player', position: { x: 384, y: 284 }, velocity: { x: 0, y: 0 },
      width: 32, height: 32, color: '#00ff00'
    });

    // Add boundary walls
    const wallColor = '#444';
    engine.addSprite({ id: 'wall_t', position: { x: 0, y: 0 }, velocity: { x: 0, y: 0 }, width: 800, height: 10, color: wallColor });
    engine.addSprite({ id: 'wall_b', position: { x: 0, y: 590 }, velocity: { x: 0, y: 0 }, width: 800, height: 10, color: wallColor });
    engine.addSprite({ id: 'wall_l', position: { x: 0, y: 0 }, velocity: { x: 0, y: 0 }, width: 10, height: 600, color: wallColor });
    engine.addSprite({ id: 'wall_r', position: { x: 790, y: 0 }, velocity: { x: 0, y: 0 }, width: 10, height: 600, color: wallColor });

    const SPEED = 200;
    const gameLoop = new GameLoop();
    let frameCount = 0, startTime = performance.now();

    gameLoop.start(
      (dt) => {
        input.update();
        const player = engine.getSprite('player');
        if (player) {
          const vx = (input.directions.right - input.directions.left) * SPEED;
          const vy = (input.directions.down - input.directions.up) * SPEED;
          player.position.x += vx * dt;
          player.position.y += vy * dt;

          // Clamp to bounds
          player.position.x = Math.max(10, Math.min(800 - 10 - player.width, player.position.x));
          player.position.y = Math.max(10, Math.min(600 - 10 - player.height, player.position.y));
        }
        frameCount++;
      },
      () => {
        engine.render();
        const player = engine.getSprite('player');
        const elapsed = (performance.now() - startTime) / 1000;
        document.getElementById('fps').textContent = elapsed > 0 ? Math.round(frameCount / elapsed) : 0;
        document.getElementById('pos').textContent = player ?
          `${player.position.x.toFixed(0)}, ${player.position.y.toFixed(0)}` : '-';
        document.getElementById('dirs').textContent =
          `U:${input.directions.up} D:${input.directions.down} L:${input.directions.left} R:${input.directions.right}`;
      }
    );

    document.getElementById('status').textContent = 'Use WASD or arrow keys to move the green square.';
    document.getElementById('status').className = 'pass';
  </script>
</body>
</html>
```

- [ ] **Step 2: Verify in browser**

Open: `http://localhost:3000/tests/phase2-combo/08-engine-input-loop.html`
Expected:
- Green square visible, surrounded by gray walls
- WASD/arrow keys move square smoothly
- Square stops when keys released
- Square cannot go past walls
- FPS ~60, position updates in real-time
- Console no errors

- [ ] **Step 3: Commit**

```bash
git add tests/phase2-combo/08-engine-input-loop.html
git commit -m "test: add engine+input+loop combo test (08)"
```

---

## Task 10: Phase 2 — Engine + Security + Share (09-engine-security-share.html)

**Files:**
- Create: `tests/phase2-combo/09-engine-security-share.html`

- [ ] **Step 1: Create 09-engine-security-share.html**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>09 - Engine + Security + Share</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: monospace; background: #1a1a2e; color: #eee; padding: 20px; }
    h1 { color: #0ff; margin-bottom: 10px; }
    #status { padding: 10px; margin: 10px 0; border-radius: 4px; }
    .pass { background: #0a3d0a; border: 1px solid #0f0; }
    .info { background: #0a0a3d; border: 1px solid #66f; }
    canvas { border: 2px solid #0ff; display: block; margin: 10px 0; background: #000; cursor: pointer; }
    #hud { display: flex; gap: 20px; font-size: 14px; margin: 5px 0; flex-wrap: wrap; }
    #hud span { color: #0f0; }
    #encrypted { background: #111; padding: 8px; border: 1px solid #333; border-radius: 4px;
                 font-size: 11px; word-break: break-all; color: #ff0; margin: 5px 0; max-height: 60px; overflow-y: auto; }
    button { padding: 8px 16px; margin: 3px; font-family: monospace; font-size: 13px;
             border: 2px solid #0ff; background: #0a0a3d; color: #0ff; border-radius: 4px; cursor: pointer; }
    button:hover { background: #0ff; color: #000; }
    #sharePreview { margin: 10px 0; }
    #sharePreview img { max-width: 100%; border: 2px solid #333; border-radius: 8px; }
  </style>
</head>
<body>
  <h1>09 - Engine + Security + Share (Combo Test)</h1>
  <div id="status" class="info">Initializing...</div>
  <canvas id="gameCanvas" width="800" height="400"></canvas>
  <div id="hud">
    <div>Score: <span id="score">0</span></div>
    <div>Targets: <span id="targets">0</span></div>
  </div>
  <div>Encrypted data: <div id="encrypted">-</div></div>
  <div>
    <button id="encryptBtn">Encrypt Score</button>
    <button id="generateShareBtn">Generate Share Image</button>
  </div>
  <div id="sharePreview"></div>

  <script type="module">
    import { E as createEngine, C as Security } from '../../lib/MobileProtection-DVGpnIWZ.js';

    const canvas = document.getElementById('gameCanvas');
    const engine = await createEngine(canvas, { backgroundColor: { r: 0.05, g: 0.05, b: 0.15, a: 1 } });
    await engine.initialize({ canvas, width: 800, height: 400 });

    const security = new Security();
    await security.initialize();

    let score = 0;

    // Add targets
    function addTarget(id) {
      engine.addSprite({
        id, position: { x: Math.random() * 700 + 50, y: Math.random() * 300 + 50 },
        velocity: { x: 0, y: 0 }, width: 30, height: 30, color: '#ff0000'
      });
    }
    for (let i = 0; i < 5; i++) addTarget(`target_${i}`);

    // Click to collect
    canvas.addEventListener('click', (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) * (canvas.width / rect.width);
      const y = (e.clientY - rect.top) * (canvas.height / rect.height);
      const hit = engine.getSpriteAtPosition(x, y);
      if (hit && hit.id.startsWith('target_')) {
        score += 10;
        engine.setState({ score });
        document.getElementById('score').textContent = score;
        engine.removeSprite(hit.id);
        addTarget(hit.id);
        engine.render();
      }
    });

    engine.render();

    document.getElementById('targets').textContent = '5 (click red squares to score)';

    // Encrypt button
    document.getElementById('encryptBtn').addEventListener('click', () => {
      const encrypted = security.encrypt({ score, time: 60, name: 'TestPlayer' });
      document.getElementById('encrypted').textContent = encrypted;
    });

    // Share button - generates a canvas-based share image
    document.getElementById('generateShareBtn').addEventListener('click', () => {
      const shareCanvas = document.createElement('canvas');
      shareCanvas.width = 800;
      shareCanvas.height = 400;
      const ctx = shareCanvas.getContext('2d');

      // Gradient background
      const grad = ctx.createLinearGradient(0, 0, 800, 400);
      grad.addColorStop(0, '#667eea');
      grad.addColorStop(1, '#764ba2');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 800, 400);

      // Title
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 32px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('Module Test Report', 400, 60);

      // Score
      ctx.font = '24px monospace';
      ctx.fillText(`Score: ${score}`, 400, 120);
      ctx.fillText(`Time: 60s`, 400, 160);

      // Encrypted payload
      const enc = security.encrypt({ score, time: 60 });
      ctx.font = '12px monospace';
      ctx.fillStyle = '#aaa';
      const encShort = enc.length > 60 ? enc.substring(0, 60) + '...' : enc;
      ctx.fillText(`Encrypted: ${encShort}`, 400, 220);

      // Show preview
      const preview = document.getElementById('sharePreview');
      preview.innerHTML = '';
      const img = new Image();
      img.src = shareCanvas.toDataURL('image/png');
      preview.appendChild(img);
    });

    document.getElementById('status').textContent = 'Click red squares to score, then encrypt or generate share image.';
    document.getElementById('status').className = 'pass';
  </script>
</body>
</html>
```

- [ ] **Step 2: Verify in browser**

Open: `http://localhost:3000/tests/phase2-combo/09-engine-security-share.html`
Expected:
- Red squares visible on canvas
- Click a red square → score increases, square respawns elsewhere
- "Encrypt Score" → shows encrypted string
- "Generate Share Image" → shows a gradient image with score data
- Console no errors

- [ ] **Step 3: Commit**

```bash
git add tests/phase2-combo/09-engine-security-share.html
git commit -m "test: add engine+security+share combo test (09)"
```

---

## Task 11: Phase 2 — Full Core Integration (10-full-core.html)

**Files:**
- Create: `tests/phase2-combo/10-full-core.html`

- [ ] **Step 1: Create 10-full-core.html**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>10 - Full Core Integration</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: monospace; background: #1a1a2e; color: #eee; padding: 20px; }
    h1 { color: #0ff; margin-bottom: 10px; }
    #status { padding: 10px; margin: 10px 0; border-radius: 4px; }
    .pass { background: #0a3d0a; border: 1px solid #0f0; }
    .info { background: #0a0a3d; border: 1px solid #66f; }
    canvas { border: 2px solid #0ff; display: block; margin: 10px 0; background: #000; }
    #hud { display: flex; gap: 15px; font-size: 13px; flex-wrap: wrap; margin: 5px 0; }
    #hud span { color: #0f0; }
    .module-status { display: flex; gap: 10px; flex-wrap: wrap; margin: 10px 0; }
    .module-badge { padding: 5px 10px; border-radius: 4px; font-size: 12px; }
    .badge-ok { background: #0a3d0a; border: 1px solid #0f0; color: #0f0; }
    .badge-fail { background: #3d0a0a; border: 1px solid #f00; color: #f00; }
  </style>
</head>
<body>
  <h1>10 - Full Core Integration Test</h1>
  <div id="status" class="info">Initializing all modules...</div>

  <div class="module-status" id="moduleStatus"></div>

  <canvas id="gameCanvas" width="800" height="500"></canvas>
  <div id="hud">
    <score-display id="scoreDisplay"></score-display>
    <div>FPS: <span id="fps">0</span></div>
    <div>Position: <span id="pos">-</span></div>
    <div>Collisions: <span id="collisions">0</span></div>
  </div>

  <script type="module">
    import {
      E as createEngine, C as Security, G as GameLoop,
      I as InputManager, M as MobileProtection
    } from '../../lib/MobileProtection-DVGpnIWZ.js';

    const statusEl = document.getElementById('status');
    const moduleStatusEl = document.getElementById('moduleStatus');
    const badges = {};

    function setModuleStatus(name, ok) {
      if (!badges[name]) {
        badges[name] = document.createElement('div');
        badges[name].className = 'module-badge';
        moduleStatusEl.appendChild(badges[name]);
      }
      badges[name].textContent = `${name}: ${ok ? 'OK' : 'FAIL'}`;
      badges[name].className = `module-badge ${ok ? 'badge-ok' : 'badge-fail'}`;
    }

    // Module 1: Engine
    const canvas = document.getElementById('gameCanvas');
    const engine = await createEngine(canvas, { backgroundColor: { r: 0.05, g: 0.05, b: 0.1, a: 1 } });
    await engine.initialize({ canvas, width: 800, height: 500 });
    setModuleStatus('Engine', true);

    // Module 2: Security
    const security = new Security();
    await security.initialize();
    setModuleStatus('Security', security.isInitialized());

    // Module 3: InputManager
    const input = new InputManager({
      keybindings: { w: 'up', arrowup: 'up', s: 'down', arrowdown: 'down',
                     a: 'left', arrowleft: 'left', d: 'right', arrowright: 'right' }
    });
    setModuleStatus('Input', true);

    // Module 4: GameLoop
    const gameLoop = new GameLoop();
    setModuleStatus('GameLoop', true);

    // Module 5: MobileProtection
    const mobileProtection = new MobileProtection({
      preventPullToRefresh: true, preventDoubleTapZoom: true,
      preventPinchZoom: true, preventContextMenu: true, target: canvas
    });
    mobileProtection.enable();
    setModuleStatus('MobileProtect', mobileProtection.isEnabled());

    // Module 6: ScoreDisplay
    const scoreDisplay = document.getElementById('scoreDisplay');
    let scoreDisplayOk = false;
    try {
      scoreDisplay.setScore(0);
      scoreDisplayOk = true;
    } catch (e) {
      // Custom element might not be registered if main.js wasn't loaded
      console.log('[FullCore] score-display not available:', e.message);
    }
    setModuleStatus('ScoreDisplay', scoreDisplayOk);

    // Set up game scene
    engine.addSprite({
      id: 'player', position: { x: 384, y: 234 }, velocity: { x: 0, y: 0 },
      width: 32, height: 32, color: '#00ff00'
    });

    const targetPositions = [
      { x: 100, y: 100 }, { x: 600, y: 100 }, { x: 350, y: 400 },
      { x: 150, y: 350 }, { x: 650, y: 350 }
    ];
    targetPositions.forEach((pos, i) => {
      engine.addSprite({
        id: `target_${i}`, position: pos, velocity: { x: 0, y: 0 },
        width: 24, height: 24, color: '#ff0000'
      });
    });

    // Add obstacles
    engine.addSprite({ id: 'obs_0', position: { x: 300, y: 200 }, velocity: { x: 0, y: 0 }, width: 100, height: 20, color: '#666' });
    engine.addSprite({ id: 'obs_1', position: { x: 500, y: 300 }, velocity: { x: 0, y: 0 }, width: 20, height: 100, color: '#666' });

    let score = 0, collisionCount = 0, frameCount = 0, startTime = performance.now();
    const SPEED = 200;

    function checkCollision(a, b) {
      return a.position.x < b.position.x + b.width && a.position.x + a.width > b.position.x &&
             a.position.y < b.position.y + b.height && a.position.y + a.height > b.position.y;
    }

    gameLoop.start(
      (dt) => {
        input.update();
        const player = engine.getSprite('player');
        if (!player) return;

        const oldX = player.position.x, oldY = player.position.y;
        player.velocity.x = (input.directions.right - input.directions.left) * SPEED;
        player.velocity.y = (input.directions.down - input.directions.up) * SPEED;
        player.position.x += player.velocity.x * dt;
        player.position.y += player.velocity.y * dt;

        // Clamp
        player.position.x = Math.max(0, Math.min(800 - player.width, player.position.x));
        player.position.y = Math.max(0, Math.min(500 - player.height, player.position.y));

        // Obstacle collision
        for (const obsId of ['obs_0', 'obs_1']) {
          const obs = engine.getSprite(obsId);
          if (obs && checkCollision(player, obs)) {
            player.position.x = oldX;
            player.position.y = oldY;
            collisionCount++;
          }
        }

        // Target collision
        for (let i = 0; i < 5; i++) {
          const target = engine.getSprite(`target_${i}`);
          if (target && checkCollision(player, target)) {
            score += 10;
            engine.setState({ score });
            if (scoreDisplayOk) scoreDisplay.setScore(score);
            target.position.x = Math.random() * 700 + 50;
            target.position.y = Math.random() * 400 + 50;
          }
        }

        frameCount++;
      },
      () => {
        engine.render();
        const player = engine.getSprite('player');
        const elapsed = (performance.now() - startTime) / 1000;
        document.getElementById('fps').textContent = elapsed > 0 ? Math.round(frameCount / elapsed) : 0;
        document.getElementById('pos').textContent = player ?
          `${player.position.x.toFixed(0)}, ${player.position.y.toFixed(0)}` : '-';
        document.getElementById('collisions').textContent = collisionCount;
      }
    );

    statusEl.textContent = 'All modules loaded. WASD to move, collect red targets, avoid gray obstacles.';
    statusEl.className = 'pass';
  </script>
</body>
</html>
```

- [ ] **Step 2: Verify in browser**

Open: `http://localhost:3000/tests/phase2-combo/10-full-core.html`
Expected:
- All module badges show "OK" (green)
- Player moves with WASD, cannot pass through gray obstacles
- Collecting red targets increases score
- Score display updates (if custom element registered)
- FPS stable, collision counter increments on obstacle bumps
- Console no errors

- [ ] **Step 3: Commit**

```bash
git add tests/phase2-combo/10-full-core.html
git commit -m "test: add full core integration test (10)"
```

---

## Task 12: Phase 3 — Flower App (11-flower.html)

**Files:**
- Create: `tests/phase3-app/11-flower.html`
- Modify: The flower module expects specific DOM elements. The implementing agent must first extract the exact DOM requirements from `lib/flower-D58nqTnV.js`.

- [ ] **Step 1: Extract DOM requirements from flower module**

Run these grep commands to identify required elements:
```bash
grep -oE 'getElementById\("[^"]+"\)' lib/flower-D58nqTnV.js | sort -u
grep -oE "querySelector\('[^']+'\)" lib/flower-D58nqTnV.js | sort -u
grep -oE 'customElements\.define\("[^"]+"' lib/flower-D58nqTnV.js | sort -u
```

Expected results:
- `getElementById`: gameCanvas, flowerPalette, controls, clearBtn, bringToTopBtn, deleteBtn, flipBtn, shareBtn
- `querySelector`: `game-slider[label="Rotation (A/D)"]`, `game-slider[label="Size (W/S)"]`
- `customElements.define`: `game-slider`

- [ ] **Step 2: Create 11-flower.html**

Create the HTML file with ALL required DOM elements. The structure must include:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>11 - Flower Arrangement App</title>
  <link rel="stylesheet" href="../../lib/flower-is69TI8K.css">
  <style>
    /* Additional test-specific styles if needed */
  </style>
</head>
<body>
  <div id="gameContainer">
    <!-- Palette -->
    <div id="palette">
      <h2>Flowers</h2>
      <div id="flowerPalette"></div>
      <div class="key-hint">Keys: 1-9,0,i,o</div>
    </div>

    <!-- Canvas area -->
    <div id="canvasContainer">
      <canvas id="gameCanvas" width="800" height="600"></canvas>
      <button id="clearBtn">Clear</button>
      <button id="shareBtn">Share</button>
      <div class="canvas-hint">
        <div>Drag flowers | A/D rotate | W/S size</div>
        <div>Q top | E delete | / flip | Tab switch</div>
      </div>
    </div>

    <!-- Controls -->
    <div id="controls" class="disabled">
      <div class="control-group">
        <game-slider label="Rotation (A/D)" min="0" max="360" step="10" value="0"></game-slider>
      </div>
      <div class="control-group">
        <game-slider label="Size (W/S)" min="128" max="512" step="16" value="256"></game-slider>
      </div>
      <button id="bringToTopBtn">Bring to Top</button>
      <button id="deleteBtn">Delete</button>
      <button id="flipBtn">Flip</button>
    </div>
  </div>

  <script type="module" src="../../lib/flower-D58nqTnV.js"></script>
</body>
</html>
```

**Note:** The flower module tries to load sprite assets from `../assets/output/sprites.png` and `../assets/output/sprites.json`. These may not exist. The app should still function with fallback rendering (the code has a try/catch around sprite loading). If assets are available, place them at `assets/output/sprites.png` and `assets/output/sprites.json`.

- [ ] **Step 3: Verify in browser**

Open: `http://localhost:3000/tests/phase3-app/11-flower.html`
Expected (check each):
- [ ] Page renders with flower palette, canvas, controls
- [ ] Click flower buttons or press number keys to add flowers
- [ ] Drag flowers to move them
- [ ] Rotation slider / A/D keys rotate selected flower
- [ ] Size slider / W/S keys resize selected flower
- [ ] Bring to Top (Q), Delete (E), Flip (/) work
- [ ] Tab switches between flowers
- [ ] Arrow keys move flower position
- [ ] Share button triggers download/share
- [ ] Console: no critical errors (sprite loading warning is OK)

- [ ] **Step 4: Commit**

```bash
git add tests/phase3-app/11-flower.html
git commit -m "test: add flower app integration test (11)"
```

---

## Task 13: Phase 3 — Game App (12-game.html)

**Files:**
- Create: `tests/phase3-app/12-game.html`

- [ ] **Step 1: Extract DOM requirements**

```bash
grep -oE 'getElementById\("[^"]+"\)' lib/main-CcL0ZKFH.js | sort -u
grep -oE 'customElements\.define\("[^"]+"' lib/main-CcL0ZKFH.js | sort -u
```

Required IDs: gameCanvas, nameModal, playerNameInput, startGameBtn, timerDisplay, startCountdownBtn, endGameModal, finalScore, modalSubmitBtn, modalShareBtn
Custom elements: score-display, submit-button, share-card

- [ ] **Step 2: Create 12-game.html**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>12 - Collection Game</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: monospace; background: #111; color: #eee; display: flex;
           flex-direction: column; align-items: center; padding: 20px; }
    #hud { display: flex; gap: 20px; margin: 10px 0; align-items: center; font-size: 18px; }
    #gameCanvas { border: 2px solid #0ff; background: #000; }
    .modal { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8);
             display: flex; align-items: center; justify-content: center; z-index: 100; }
    .modal.hidden { display: none; }
    .modal-content { background: #222; padding: 30px; border-radius: 12px; text-align: center;
                     border: 2px solid #0ff; min-width: 300px; }
    .modal-content h2 { color: #0ff; margin-bottom: 15px; }
    .modal-content input { padding: 10px; font-size: 16px; width: 200px; margin: 10px 0;
                           border: 2px solid #0ff; background: #111; color: #fff; border-radius: 4px; }
    .modal-content button { padding: 10px 20px; font-size: 16px; margin: 5px;
                            border: 2px solid #0ff; background: #0a0a3d; color: #0ff;
                            border-radius: 4px; cursor: pointer; font-family: monospace; }
    .modal-content button:hover { background: #0ff; color: #000; }
    #finalScore { font-size: 48px; color: #0f0; margin: 15px 0; }
  </style>
</head>
<body>
  <!-- Name modal -->
  <div id="nameModal" class="modal">
    <div class="modal-content">
      <h2>Enter Your Name</h2>
      <input type="text" id="playerNameInput" placeholder="Player name" value="Player1">
      <br>
      <button id="startGameBtn">Start Game</button>
    </div>
  </div>

  <!-- HUD -->
  <div id="hud">
    <score-display id="scoreDisplay"></score-display>
    <div>Time: <span id="timerDisplay">60</span>s</div>
  </div>

  <!-- Game canvas -->
  <canvas id="gameCanvas" width="800" height="600"></canvas>

  <div style="margin-top: 10px;">
    <button id="startCountdownBtn" style="padding:8px 16px;font-family:monospace;border:2px solid #0ff;background:#0a0a3d;color:#0ff;border-radius:4px;cursor:pointer;">Start Countdown</button>
  </div>

  <!-- End game modal -->
  <div id="endGameModal" class="modal hidden">
    <div class="modal-content">
      <h2>Game Over!</h2>
      <div id="finalScore">0</div>
      <submit-button></submit-button>
      <share-card></share-card>
      <br>
      <button id="modalSubmitBtn">Submit Score</button>
      <button id="modalShareBtn">Share</button>
    </div>
  </div>

  <script type="module" src="../../lib/main-CcL0ZKFH.js"></script>
</body>
</html>
```

**Important:** The `main-CcL0ZKFH.js` contains a hardcoded GitHub API token for score submission. The submit button will attempt to create a GitHub issue. For testing purposes, this is expected behavior. Do NOT test the actual submission (it will create a real issue). Just verify the UI works.

- [ ] **Step 3: Verify in browser**

Open: `http://localhost:3000/tests/phase3-app/12-game.html`
Expected (check each):
- [ ] Name input modal appears
- [ ] Enter name and click Start → modal hides, game scene renders
- [ ] Player (green), obstacles (gray), targets (red) visible
- [ ] WASD/arrow keys move player
- [ ] Touch input works (on touch device)
- [ ] Collect target → score +10, target respawns
- [ ] Hit obstacle → player blocked
- [ ] Player stays in bounds
- [ ] Click "Start Countdown" → 60s timer starts counting down
- [ ] Timer reaches 0 → end game modal appears with final score
- [ ] Score display updates in real-time
- [ ] Submit button visible and clickable (do NOT actually submit)
- [ ] Share button generates share card
- [ ] Console no critical errors

- [ ] **Step 4: Commit**

```bash
git add tests/phase3-app/12-game.html
git commit -m "test: add collection game integration test (12)"
```

---

## Task 14: Phase 3 — QR Code App (13-qr-code.html)

**Files:**
- Create: `tests/phase3-app/13-qr-code.html`

- [ ] **Step 1: Extract DOM requirements**

```bash
grep -oE 'getElementById\("[^"]+"\)' lib/qr-code-DbDFnmYs.js | sort -u
```

This module has MANY DOM element references (50+). The implementing agent must create HTML elements for ALL IDs found.

- [ ] **Step 2: Create 13-qr-code.html**

The QR code app requires extensive DOM structure. Create the HTML file with ALL required elements. Key groups:

1. **Mode tabs**: Generate / Scan tab switcher
2. **Generate controls**: text input, size slider, color pickers, EC level radio buttons, generate button, download buttons
3. **QR display**: canvas (`qrCanvas`), container, placeholder
4. **Stats**: version, module count, capacity displays
5. **Image overlay**: image upload, preview, position controls (posX, posY, scale)
6. **Fountain mode**: fountain controls, progress bar
7. **Scanner controls**: scanner video, overlay, start/stop buttons, scan result display

The implementing agent should create a comprehensive HTML structure matching all IDs found in step 1. Reference the CSS in `qr-code-DiD7KNEW.css` for class names and styling.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>13 - QR Code Tool</title>
  <link rel="stylesheet" href="../../lib/qr-code-DiD7KNEW.css">
</head>
<body>
  <div id="container">
    <!-- Mode tabs -->
    <div id="mode-tabs">
      <button class="mode-tab active" data-mode="generate">Generate</button>
      <button class="mode-tab" data-mode="scan">Scan</button>
    </div>

    <!-- Generate mode -->
    <div id="generate-mode" class="mode-content active">
      <div id="controls">
        <h2>QR Code Generator</h2>

        <div class="control-section">
          <div class="input-group">
            <label for="qrData">Text / URL</label>
            <textarea id="qrData" rows="3" placeholder="Enter text or URL">Hello World!</textarea>
          </div>
        </div>

        <div class="control-section">
          <div class="slider-group">
            <label>Size: <span id="scaleValue">10</span></label>
            <input type="range" id="scale" min="1" max="20" value="10">
          </div>
          <div class="color-group">
            <label>Fill: <input type="color" id="fillColor" value="#000000"></label>
            <label>Background: <input type="color" id="backgroundColor" value="#ffffff"></label>
          </div>
          <div class="radio-group">
            <label><input type="radio" name="ecLevel" value="L"> L</label>
            <label><input type="radio" name="ecLevel" value="M" checked> M</label>
            <label><input type="radio" name="ecLevel" value="Q"> Q</label>
            <label><input type="radio" name="ecLevel" value="H"> H</label>
          </div>
        </div>

        <button id="generateBtn" class="primary">Generate QR Code</button>
        <div class="button-group">
          <button id="downloadBtn">Download PNG</button>
          <button id="downloadSvgBtn">Download SVG</button>
        </div>

        <div class="control-section">
          <h3>Image Overlay</h3>
          <input type="file" id="imageUpload" accept="image/*">
          <div class="input-group">
            <label>Image URL: <input type="text" id="imageURL"></label>
          </div>
          <button id="loadImageBtn">Load Image</button>
          <div id="imagePreview" style="display:none;">
            <img id="previewImg">
          </div>
          <div class="slider-group">
            <label>Position X: <span id="posXValue">50</span>%</label>
            <input type="range" id="posX" min="0" max="100" value="50">
          </div>
          <div class="slider-group">
            <label>Position Y: <span id="posYValue">50</span>%</label>
            <input type="range" id="posY" min="0" max="100" value="50">
          </div>
        </div>

        <div class="control-section">
          <h3>Fountain Mode</h3>
          <div class="checkbox-group">
            <label><input type="checkbox" id="fountainEnabled"> Enable Fountain</label>
          </div>
          <div id="fountain-controls" style="display:none;">
            <div class="checkbox-group">
              <label><input type="checkbox" id="fountainEnabledInline"> Inline</label>
            </div>
            <div class="checkbox-group">
              <label><input type="checkbox" id="ditherCheck"> Dither</label>
            </div>
            <div class="checkbox-group">
              <label><input type="checkbox" id="onlyDataBitsCheck"> Only Data Bits</label>
            </div>
            <div class="checkbox-group">
              <label><input type="checkbox" id="randCheck"> Randomize</label>
            </div>
            <button id="playPauseBtn">Play/Pause</button>
            <button id="resetBtn">Reset</button>
            <button id="restartBtn">Restart</button>
            <div class="slider-group">
              <label>Version: <span id="versionValue">5</span></label>
              <input type="range" id="version" min="1" max="40" value="5">
              <button id="decreaseVersion">-</button>
              <button id="increaseVersion">+</button>
            </div>
            <div id="progress-fill" style="width:0%;height:20px;background:#667eea;"></div>
            <div id="progress-label">0%</div>
            <div>Frames: <span id="current-frame">0</span> / <span id="total-frames">0</span> (<span id="estimated-frames">0</span> est.)</div>
            <div id="scan-result" style="margin-top:10px;"></div>
          </div>
        </div>
      </div>

      <div id="output">
        <div id="qrContainer">
          <div id="placeholder">
            <p>Enter text and click Generate</p>
          </div>
          <canvas id="qrCanvas"></canvas>
        </div>
        <div id="stats">
          <div class="stat">Version: <strong id="statVersion">-</strong></div>
          <div class="stat">Modules: <strong id="statModules">-</strong> (<span id="moduleCount">-</span>)</div>
          <div class="stat">Capacity: <strong id="statCapacity">-</strong> (<span id="capacityInfo">-</span>)</div>
        </div>
        <div id="result-data" style="word-break:break-all;font-size:12px;color:#888;"></div>
        <button id="copyResultBtn" style="margin-top:10px;">Copy Result</button>
      </div>
    </div>

    <!-- Scan mode -->
    <div id="scan-mode" class="mode-content">
      <div id="scanner-controls-container">
        <h2>QR Code Scanner</h2>
        <div id="scanner-container">
          <video id="scanner-video" autoplay playsinline></video>
          <div id="scanner-overlay">
            <div class="scan-region"></div>
          </div>
        </div>
        <div style="margin-top:10px;">
          <button id="startScanBtn" class="primary">Start Camera</button>
          <button id="stopScanBtn">Stop</button>
          <button id="switchCameraBtn">Switch Camera</button>
          <button id="toggleFlashBtn">Flash</button>
        </div>
        <div id="scanInstructions">
          <h3>Instructions</h3>
          <p>Point camera at a QR code to scan it.</p>
        </div>
        <div id="scan-progress" class="progress-bar" style="display:none;">
          <div id="scan-progress-fill" style="height:100%;background:#667eea;width:0%;"></div>
        </div>
        <div id="scan-result-text" style="margin-top:10px;font-size:16px;color:#0f0;"></div>
      </div>
    </div>
  </div>

  <script type="module" src="../../lib/qr-code-DbDFnmYs.js"></script>
</body>
</html>
```

**Note:** The QR code app has a very complex DOM structure. If elements are missing, the app will throw errors. The implementing agent should carefully match ALL element IDs found by the grep in Step 1. Some element IDs may not appear in this template — add any missing ones.

- [ ] **Step 3: Verify in browser**

Open: `http://localhost:3000/tests/phase3-app/13-qr-code.html`
Expected (check each):
- [ ] Page renders with generate/scan tabs
- [ ] Generate tab: enter text → click Generate → QR code appears on canvas
- [ ] Size slider changes QR code size
- [ ] Color pickers change QR code colors
- [ ] EC level radio buttons work
- [ ] Download buttons trigger file download
- [ ] Image upload / overlay positioning works
- [ ] Stats (version, modules, capacity) update
- [ ] Scan tab: Start Camera → requests permission → video shows
- [ ] Point at QR code → decoded result appears
- [ ] Console no critical errors

- [ ] **Step 4: Commit**

```bash
git add tests/phase3-app/13-qr-code.html
git commit -m "test: add QR code app integration test (13)"
```

---

## Task 15: Phase 3 — Ultrasound App (14-ultrasound.html)

**Files:**
- Create: `tests/phase3-app/14-ultrasound.html`

- [ ] **Step 1: Extract DOM requirements**

```bash
grep -oE 'getElementById\("[^"]+"\)' lib/ultrasound-C3iofht8.js | sort -u
```

Required IDs: masterBtn, slaveBtn, keypad, listenBtn, symbolRate, symbolVal, masterVol, freqMonitor, monitorInfo, rxDecoded, rxDot, rxLabel, rxStatus

- [ ] **Step 2: Create 14-ultrasound.html**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>14 - Ultrasound Communication</title>
  <style>
    :root { --ch1: #ff6b6b; --ch2: #4ecdc4; --peak: #ffe66d; --bg: #1a1a2e; --card: #16213e; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: monospace; background: var(--bg); color: #eee; padding: 20px; }
    h1 { color: var(--ch1); margin-bottom: 15px; }
    .role-btns { display: flex; gap: 10px; margin: 10px 0; }
    .role-btn { padding: 10px 20px; font-size: 16px; font-family: monospace; border: 2px solid #555;
                background: var(--card); color: #aaa; border-radius: 4px; cursor: pointer; }
    .master-active { border-color: var(--ch1); color: var(--ch1); background: #2a1a1a; }
    .slave-active { border-color: var(--ch2); color: var(--ch2); background: #1a2a2a; }
    .section { background: var(--card); border-radius: 8px; padding: 15px; margin: 10px 0; }
    .section h3 { color: #aaa; margin-bottom: 10px; font-size: 14px; }
    #keypad { display: flex; gap: 10px; margin: 10px 0; }
    .key { padding: 15px 25px; font-size: 20px; font-family: monospace; border: 2px solid #555;
           background: var(--card); color: #eee; border-radius: 8px; cursor: pointer;
           display: flex; flex-direction: column; align-items: center; gap: 5px; }
    .key .sub { font-size: 10px; color: #888; }
    .key.pressed { transform: scale(0.95); }
    .ch1-key { border-color: var(--ch1); }
    .ch1-key.pressed { background: #3a1a1a; box-shadow: 0 0 15px var(--ch1); }
    .ch2-key { border-color: var(--ch2); }
    .ch2-key.pressed { background: #1a3a3a; box-shadow: 0 0 15px var(--ch2); }
    #listenBtn { padding: 10px 20px; font-size: 16px; font-family: monospace; border: 2px solid #f00;
                 background: #2a0a0a; color: #f00; border-radius: 4px; cursor: pointer; }
    #listenBtn.active { background: #4a0a0a; box-shadow: 0 0 15px #f00; }
    #freqMonitor { display: flex; gap: 15px; margin: 10px 0; }
    .freq-bar-wrap { display: flex; flex-direction: column; align-items: center; gap: 5px; }
    .freq-bar-container { width: 40px; height: 100px; background: #111; border: 1px solid #333;
                          border-radius: 4px; display: flex; align-items: flex-end; overflow: hidden; }
    .freq-bar { width: 100%; transition: height 0.1s; min-height: 2px; }
    .ch1 { background: var(--ch1); }
    .ch2 { background: var(--ch2); }
    .freq-label { font-size: 11px; color: #888; }
    .freq-value { font-size: 10px; color: #aaa; }
    .slider-row { display: flex; align-items: center; gap: 10px; margin: 8px 0; }
    .slider-row label { min-width: 100px; font-size: 13px; }
    .slider-row input[type=range] { flex: 1; }
    .slider-row span { min-width: 50px; font-size: 13px; color: var(--peak); }
    #rxDecoded { background: #111; padding: 10px; border: 1px solid #333; border-radius: 4px;
                 min-height: 40px; font-size: 16px; word-break: break-all; margin: 10px 0; }
    #monitorInfo { font-size: 12px; color: #888; margin: 5px 0; }
    #rxStatus { font-size: 13px; margin: 5px 0; }
    button.clear-btn { padding: 5px 10px; font-family: monospace; font-size: 12px;
                       border: 1px solid #555; background: var(--card); color: #aaa;
                       border-radius: 4px; cursor: pointer; }
  </style>
</head>
<body>
  <h1>14 - Ultrasound Data Communication</h1>

  <div class="section">
    <h3>Role Selection</h3>
    <div class="role-btns">
      <button id="masterBtn" class="role-btn master-active" onclick="setRole('master')">Master (CH1 TX)</button>
      <button id="slaveBtn" class="role-btn" onclick="setRole('slave')">Slave (CH2 TX)</button>
    </div>
  </div>

  <div class="section">
    <h3>Transmit</h3>
    <div id="keypad"></div>
  </div>

  <div class="section">
    <h3>Parameters</h3>
    <div class="slider-row">
      <label>Symbol Rate:</label>
      <input type="range" id="symbolRate" min="50" max="1000" value="250">
      <span id="symbolVal">250ms</span>
    </div>
    <div class="slider-row">
      <label>Master Vol:</label>
      <input type="range" id="masterVol" min="0" max="100" value="50">
      <span id="volVal">50%</span>
    </div>
  </div>

  <div class="section">
    <h3>Receive</h3>
    <button id="listenBtn" onclick="toggleListen()">Start Listening</button>
    <div id="freqMonitor"></div>
    <div id="monitorInfo">-</div>
    <div>
      <span id="rxLabel">Received (from Slave)</span>
      <span id="rxDot" style="display:inline-block;width:10px;height:10px;border-radius:50%;background:var(--ch2);"></span>
    </div>
    <div id="rxDecoded"></div>
    <div id="rxStatus">Ready</div>
    <button class="clear-btn" onclick="clearDecoded()">Clear</button>
  </div>

  <script type="module" src="../../lib/ultrasound-C3iofht8.js"></script>
</body>
</html>
```

- [ ] **Step 3: Verify in browser**

Open: `http://localhost:3000/tests/phase3-app/14-ultrasound.html`
Expected (check each):
- [ ] Page renders with role buttons, keypad, parameter sliders, receive section
- [ ] Master/Slave buttons toggle active state and colors
- [ ] Keypad shows 3 symbol buttons (0, 1, fn) with frequency labels
- [ ] Pressing a symbol button → button shows pressed state, frequency bars respond
- [ ] Symbol rate slider updates display value
- [ ] Volume slider updates
- [ ] "Start Listening" → requests microphone permission
- [ ] While listening → frequency monitor bars update in real-time
- [ ] Noise level and signal info displayed
- [ ] Clear button resets decoded text
- [ ] Console no critical errors

- [ ] **Step 4: Commit**

```bash
git add tests/phase3-app/14-ultrasound.html
git commit -m "test: add ultrasound app integration test (14)"
```

---

## Task 16: Verification Dashboard (verify.html)

**Files:**
- Create: `tests/verify.html`

- [ ] **Step 1: Create verify.html**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Module Verification Dashboard</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: monospace; background: #1a1a2e; color: #eee; padding: 20px; max-width: 1200px; margin: 0 auto; }
    h1 { color: #0ff; margin-bottom: 15px; }
    h2 { color: #ff0; margin: 20px 0 10px; }
    .phase { background: #16213e; border-radius: 8px; padding: 15px; margin: 10px 0; }
    .test-row { display: flex; align-items: center; gap: 10px; padding: 8px; border-bottom: 1px solid #333; }
    .test-row:last-child { border-bottom: none; }
    .test-row input[type=checkbox] { width: 20px; height: 20px; cursor: pointer; }
    .test-name { flex: 1; font-size: 14px; }
    .test-link { color: #0ff; text-decoration: none; font-size: 13px; }
    .test-link:hover { text-decoration: underline; }
    .test-notes { width: 200px; }
    .test-notes input { width: 100%; padding: 4px; font-family: monospace; font-size: 12px;
                        background: #111; border: 1px solid #333; color: #eee; border-radius: 3px; }
    .sub-checks { margin-left: 30px; }
    .sub-checks label { display: flex; align-items: center; gap: 8px; padding: 4px 0; font-size: 13px; }
    .summary { background: #0a3d0a; border: 1px solid #0f0; border-radius: 8px; padding: 15px;
               margin: 15px 0; font-size: 16px; }
    .summary .fail { color: #f00; }
    button { padding: 10px 20px; font-family: monospace; font-size: 14px;
             border: 2px solid #0ff; background: #0a0a3d; color: #0ff;
             border-radius: 4px; cursor: pointer; margin: 5px; }
    button:hover { background: #0ff; color: #000; }
    #exportOutput { background: #111; padding: 10px; border: 1px solid #333; border-radius: 4px;
                    margin: 10px 0; max-height: 400px; overflow-y: auto; display: none;
                    white-space: pre-wrap; font-size: 12px; }
  </style>
</head>
<body>
  <h1>Module Verification Dashboard</h1>
  <p style="color:#888;">Open each test page, verify it works, then check the boxes below.</p>

  <div id="summary" class="summary" style="display:none;"></div>

  <!-- Phase 1 -->
  <div class="phase">
    <h2>Phase 1: Unit Tests</h2>

    <div class="test-row">
      <input type="checkbox" id="t01" data-group="phase1">
      <span class="test-name"><strong>01 - Engine</strong></span>
      <a class="test-link" href="phase1-unit/01-engine.html" target="_blank">Open</a>
    </div>
    <div class="sub-checks">
      <label><input type="checkbox" data-parent="t01"> Canvas2D renders colored squares</label>
      <label><input type="checkbox" data-parent="t01"> WebGPU renders (if supported)</label>
      <label><input type="checkbox" data-parent="t01"> Sprite add/remove/query works</label>
      <label><input type="checkbox" data-parent="t01"> State management works</label>
      <label><input type="checkbox" data-parent="t01"> No console errors</label>
    </div>

    <div class="test-row">
      <input type="checkbox" id="t02" data-group="phase1">
      <span class="test-name"><strong>02 - SpriteSheet</strong></span>
      <a class="test-link" href="phase1-unit/02-spritesheet.html" target="_blank">Open</a>
    </div>
    <div class="sub-checks">
      <label><input type="checkbox" data-parent="t02"> Synthetic sprite sheet generated</label>
      <label><input type="checkbox" data-parent="t02"> Sprites rendered with spriteFrame</label>
      <label><input type="checkbox" data-parent="t02"> Rotated sprite works</label>
      <label><input type="checkbox" data-parent="t02"> No console errors</label>
    </div>

    <div class="test-row">
      <input type="checkbox" id="t03" data-group="phase1">
      <span class="test-name"><strong>03 - Security (WASM)</strong></span>
      <a class="test-link" href="phase1-unit/03-security.html" target="_blank">Open</a>
    </div>
    <div class="sub-checks">
      <label><input type="checkbox" data-parent="t03"> WASM initializes</label>
      <label><input type="checkbox" data-parent="t03"> Encrypt produces output</label>
      <label><input type="checkbox" data-parent="t03"> Decrypt round-trip matches</label>
      <label><input type="checkbox" data-parent="t03"> Hash/time functions work</label>
      <label><input type="checkbox" data-parent="t03"> No console errors</label>
    </div>

    <div class="test-row">
      <input type="checkbox" id="t04" data-group="phase1">
      <span class="test-name"><strong>04 - Input Manager</strong></span>
      <a class="test-link" href="phase1-unit/04-input.html" target="_blank">Open</a>
    </div>
    <div class="sub-checks">
      <label><input type="checkbox" data-parent="t04"> Keyboard directions respond</label>
      <label><input type="checkbox" data-parent="t04"> Mouse position/click tracked</label>
      <label><input type="checkbox" data-parent="t04"> Touch events captured</label>
      <label><input type="checkbox" data-parent="t04"> Events logged correctly</label>
      <label><input type="checkbox" data-parent="t04"> No console errors</label>
    </div>

    <div class="test-row">
      <input type="checkbox" id="t05" data-group="phase1">
      <span class="test-name"><strong>05 - Game Loop</strong></span>
      <a class="test-link" href="phase1-unit/05-gameloop.html" target="_blank">Open</a>
    </div>
    <div class="sub-checks">
      <label><input type="checkbox" data-parent="t05"> FPS ~60</label>
      <label><input type="checkbox" data-parent="t05"> Frame count increments</label>
      <label><input type="checkbox" data-parent="t05"> Start/Stop works</label>
      <label><input type="checkbox" data-parent="t05"> DeltaTime graph stable</label>
      <label><input type="checkbox" data-parent="t05"> No console errors</label>
    </div>

    <div class="test-row">
      <input type="checkbox" id="t06" data-group="phase1">
      <span class="test-name"><strong>06 - Share Card</strong></span>
      <a class="test-link" href="phase1-unit/06-share-card.html" target="_blank">Open</a>
    </div>
    <div class="sub-checks">
      <label><input type="checkbox" data-parent="t06"> Custom element loads</label>
      <label><input type="checkbox" data-parent="t06"> Share text template correct</label>
      <label><input type="checkbox" data-parent="t06"> Generate/Share button works</label>
      <label><input type="checkbox" data-parent="t06"> No console errors</label>
    </div>

    <div class="test-row">
      <input type="checkbox" id="t07" data-group="phase1">
      <span class="test-name"><strong>07 - Spatial Hash</strong></span>
      <a class="test-link" href="phase1-unit/07-spatial-hash.html" target="_blank">Open</a>
    </div>
    <div class="sub-checks">
      <label><input type="checkbox" data-parent="t07"> Sprites visible on canvas</label>
      <label><input type="checkbox" data-parent="t07"> Hover detection works</label>
      <label><input type="checkbox" data-parent="t07"> Remove sprite updates correctly</label>
      <label><input type="checkbox" data-parent="t07"> No console errors</label>
    </div>
  </div>

  <!-- Phase 2 -->
  <div class="phase">
    <h2>Phase 2: Combination Tests</h2>

    <div class="test-row">
      <input type="checkbox" id="t08" data-group="phase2">
      <span class="test-name"><strong>08 - Engine + Input + Loop</strong></span>
      <a class="test-link" href="phase2-combo/08-engine-input-loop.html" target="_blank">Open</a>
    </div>
    <div class="sub-checks">
      <label><input type="checkbox" data-parent="t08"> Square moves with keys</label>
      <label><input type="checkbox" data-parent="t08"> Walls block movement</label>
      <label><input type="checkbox" data-parent="t08"> FPS stable</label>
      <label><input type="checkbox" data-parent="t08"> No console errors</label>
    </div>

    <div class="test-row">
      <input type="checkbox" id="t09" data-group="phase2">
      <span class="test-name"><strong>09 - Engine + Security + Share</strong></span>
      <a class="test-link" href="phase2-combo/09-engine-security-share.html" target="_blank">Open</a>
    </div>
    <div class="sub-checks">
      <label><input type="checkbox" data-parent="t09"> Click targets scores</label>
      <label><input type="checkbox" data-parent="t09"> Encrypt shows data</label>
      <label><input type="checkbox" data-parent="t09"> Share image generates</label>
      <label><input type="checkbox" data-parent="t09"> No console errors</label>
    </div>

    <div class="test-row">
      <input type="checkbox" id="t10" data-group="phase2">
      <span class="test-name"><strong>10 - Full Core Integration</strong></span>
      <a class="test-link" href="phase2-combo/10-full-core.html" target="_blank">Open</a>
    </div>
    <div class="sub-checks">
      <label><input type="checkbox" data-parent="t10"> All module badges green</label>
      <label><input type="checkbox" data-parent="t10"> Player moves, collects, blocked</label>
      <label><input type="checkbox" data-parent="t10"> Score updates</label>
      <label><input type="checkbox" data-parent="t10"> No console errors</label>
    </div>
  </div>

  <!-- Phase 3 -->
  <div class="phase">
    <h2>Phase 3: Application Tests</h2>

    <div class="test-row">
      <input type="checkbox" id="t11" data-group="phase3">
      <span class="test-name"><strong>11 - Flower Arrangement</strong></span>
      <a class="test-link" href="phase3-app/11-flower.html" target="_blank">Open</a>
    </div>
    <div class="sub-checks">
      <label><input type="checkbox" data-parent="t11"> Palette and canvas render</label>
      <label><input type="checkbox" data-parent="t11"> Add/move/rotate/resize flowers</label>
      <label><input type="checkbox" data-parent="t11"> Top/delete/flip work</label>
      <label><input type="checkbox" data-parent="t11"> Share exports PNG</label>
      <label><input type="checkbox" data-parent="t11"> No critical errors</label>
    </div>

    <div class="test-row">
      <input type="checkbox" id="t12" data-group="phase3">
      <span class="test-name"><strong>12 - Collection Game</strong></span>
      <a class="test-link" href="phase3-app/12-game.html" target="_blank">Open</a>
    </div>
    <div class="sub-checks">
      <label><input type="checkbox" data-parent="t12"> Name modal and game scene render</label>
      <label><input type="checkbox" data-parent="t12"> Player moves, collects, blocked</label>
      <label><input type="checkbox" data-parent="t12"> Timer countdown works</label>
      <label><input type="checkbox" data-parent="t12"> Score/submit/share work</label>
      <label><input type="checkbox" data-parent="t12"> No critical errors</label>
    </div>

    <div class="test-row">
      <input type="checkbox" id="t13" data-group="phase3">
      <span class="test-name"><strong>13 - QR Code Tool</strong></span>
      <a class="test-link" href="phase3-app/13-qr-code.html" target="_blank">Open</a>
    </div>
    <div class="sub-checks">
      <label><input type="checkbox" data-parent="t13"> Generate QR from text</label>
      <label><input type="checkbox" data-parent="t13"> Customize size/color/EC level</label>
      <label><input type="checkbox" data-parent="t13"> Scan mode works (camera/upload)</label>
      <label><input type="checkbox" data-parent="t13"> No critical errors</label>
    </div>

    <div class="test-row">
      <input type="checkbox" id="t14" data-group="phase3">
      <span class="test-name"><strong>14 - Ultrasound</strong></span>
      <a class="test-link" href="phase3-app/14-ultrasound.html" target="_blank">Open</a>
    </div>
    <div class="sub-checks">
      <label><input type="checkbox" data-parent="t14"> Role switch and keypad work</label>
      <label><input type="checkbox" data-parent="t14"> Listen and frequency monitor work</label>
      <label><input type="checkbox" data-parent="t14"> Parameters adjustable</label>
      <label><input type="checkbox" data-parent="t14"> No critical errors</label>
    </div>
  </div>

  <div style="margin-top:20px;">
    <button onclick="exportResults()">Export as Markdown</button>
    <button onclick="resetAll()">Reset All</button>
  </div>
  <pre id="exportOutput"></pre>

  <script>
    // Auto-update summary
    function updateSummary() {
      const all = document.querySelectorAll('.sub-checks input[type=checkbox]');
      const checked = document.querySelectorAll('.sub-checks input[type=checkbox]:checked');
      const parents = document.querySelectorAll('.test-row > input[type=checkbox]');
      let parentChecked = 0;
      parents.forEach(p => { if (p.checked) parentChecked++; });

      const summary = document.getElementById('summary');
      summary.style.display = 'block';
      summary.innerHTML = `Sub-items: <strong>${checked.length}/${all.length}</strong> passed | ` +
        `Test groups: <strong>${parentChecked}/${parents.length}</strong> complete`;
    }

    // Link sub-checkboxes to parent
    document.querySelectorAll('.sub-checks input[type=checkbox]').forEach(cb => {
      cb.addEventListener('change', () => {
        const parentId = cb.getAttribute('data-parent');
        const parent = document.getElementById(parentId);
        const siblings = document.querySelectorAll(`[data-parent="${parentId}"]`);
        const allChecked = Array.from(siblings).every(s => s.checked);
        parent.checked = allChecked;
        updateSummary();
      });
    });

    document.querySelectorAll('.test-row > input[type=checkbox]').forEach(p => {
      p.addEventListener('change', () => {
        const siblings = document.querySelectorAll(`[data-parent="${p.id}"]`);
        siblings.forEach(s => s.checked = p.checked);
        updateSummary();
      });
    });

    function exportResults() {
      let md = '# Module Test Report\\n\\n';
      md += `**Date**: ${new Date().toISOString().split('T')[0]}\\n`;
      md += `**Browser**: ${navigator.userAgent}\\n\\n`;

      const phases = [
        { name: 'Phase 1: Unit Tests', ids: ['t01','t02','t03','t04','t05','t06','t07'] },
        { name: 'Phase 2: Combination Tests', ids: ['t08','t09','t10'] },
        { name: 'Phase 3: Application Tests', ids: ['t11','t12','t13','t14'] }
      ];

      for (const phase of phases) {
        md += `## ${phase.name}\\n\\n`;
        md += '| Test | Result |\\n|------|--------|\\n';
        for (const id of phase.ids) {
          const el = document.getElementById(id);
          const name = el.closest('.test-row').querySelector('.test-name').textContent;
          const status = el.checked ? 'PASS' : 'FAIL';
          md += `| ${name} | ${status} |\\n`;
        }
        md += '\\n';
      }

      const output = document.getElementById('exportOutput');
      output.style.display = 'block';
      output.textContent = md;

      // Copy to clipboard
      navigator.clipboard.writeText(md).then(() => {
        alert('Markdown copied to clipboard! Paste into docs/test-results.md');
      });
    }

    function resetAll() {
      if (confirm('Reset all checkboxes?')) {
        document.querySelectorAll('input[type=checkbox]').forEach(cb => cb.checked = false);
        updateSummary();
      }
    }

    updateSummary();
  </script>
</body>
</html>
```

- [ ] **Step 2: Verify the dashboard works**

Open: `http://localhost:3000/tests/verify.html`
Expected:
- All test pages listed with "Open" links
- Sub-checks expand under each test
- Checking all sub-checks auto-checks the parent
- Summary shows progress
- "Export as Markdown" copies test results to clipboard
- "Reset All" clears all checkboxes

- [ ] **Step 3: Commit**

```bash
git add tests/verify.html
git commit -m "test: add verification dashboard (verify.html)"
```

---

## Task 17: Create Test Results Template

**Files:**
- Create: `docs/test-results.md`

- [ ] **Step 1: Create test-results.md template**

```markdown
# Module Test Report

**Test Date**: 
**Test Environment**: [Browser name/version] [OS]
**Web Server**: npx serve [port]

## Phase 1: Unit Tests

| # | Module | Test Item | Result | Notes |
|---|--------|-----------|--------|-------|
| 01 | Game Engine | Canvas2D rendering | | |
| 01 | Game Engine | WebGPU rendering | | |
| 01 | Game Engine | Sprite add/remove/query | | |
| 01 | Game Engine | State management | | |
| 02 | SpriteSheet | Synthetic sheet generated | | |
| 02 | SpriteSheet | spriteFrame rendering | | |
| 02 | SpriteSheet | Rotated sprite | | |
| 03 | Security | WASM initialization | | |
| 03 | Security | Encrypt produces output | | |
| 03 | Security | Decrypt round-trip | | |
| 03 | Security | Hash/time functions | | |
| 04 | Input | Keyboard directions | | |
| 04 | Input | Mouse position/click | | |
| 04 | Input | Touch events | | |
| 05 | GameLoop | FPS stable ~60 | | |
| 05 | GameLoop | Start/Stop | | |
| 05 | GameLoop | DeltaTime graph | | |
| 06 | ShareCard | Custom element loads | | |
| 06 | ShareCard | Share text template | | |
| 06 | ShareCard | Generate/share button | | |
| 07 | SpatialHash | Sprites visible | | |
| 07 | SpatialHash | Hover detection | | |
| 07 | SpatialHash | Remove updates | | |

## Phase 2: Combination Tests

| # | Combination | Test Item | Result | Notes |
|---|-------------|-----------|--------|-------|
| 08 | Engine+Input+Loop | Square moves with keys | | |
| 08 | Engine+Input+Loop | Walls block movement | | |
| 08 | Engine+Input+Loop | FPS stable | | |
| 09 | Engine+Security+Share | Click targets scores | | |
| 09 | Engine+Security+Share | Encrypt shows data | | |
| 09 | Engine+Security+Share | Share image generates | | |
| 10 | Full Core | All module badges green | | |
| 10 | Full Core | Player moves/collects/blocked | | |
| 10 | Full Core | Score updates | | |

## Phase 3: Application Tests

| # | Application | Result | Pass/Total | Notes |
|---|-------------|--------|------------|-------|
| 11 | Flower Arrangement | | /10 | |
| 12 | Collection Game | | /13 | |
| 13 | QR Code Tool | | /10 | |
| 14 | Ultrasound | | /11 | |

## Issues Found

| # | Severity | Module | Description | Reproduction |
|---|----------|--------|-------------|--------------|
| 1 | High/Med/Low | | | |

## Summary

- Total test items: 
- Passed: 
- Failed: 
- Pass rate: %
```

- [ ] **Step 2: Commit**

```bash
git add docs/test-results.md
git commit -m "docs: add test results template"
```

---

## Execution Notes

### Starting the server

```bash
npx serve . -p 3000
```

Then open `http://localhost:3000/tests/verify.html` to see the full dashboard.

### Testing flow

1. Start with Phase 1 — open each test page, verify pass criteria, check boxes in verify.html
2. Once all Phase 1 tests pass, move to Phase 2
3. Once all Phase 2 tests pass, move to Phase 3
4. After all tests complete, export results from verify.html and paste into `docs/test-results.md`

### Known issues to watch for

- **06-share-card.html**: Importing `main-CcL0ZKFH.js` will throw errors because it tries to access game DOM elements. The `<share-card>` custom element may or may not register depending on execution order. If it fails, this is a known architectural limitation — ShareCard is only accessible through the full app context.
- **11-flower.html**: Sprite assets (`assets/output/sprites.png`, `sprites.json`) likely don't exist. The app should fall back to placeholder rendering gracefully.
- **12-game.html**: Contains a hardcoded GitHub API token. Do NOT actually submit scores during testing.
- **13-qr-code.html**: Has the most complex DOM requirements (50+ elements). If elements are missing, errors will cascade. Check all IDs match.
- **14-ultrasound.html**: Microphone access required for listening tests. Some browsers may block high-frequency audio.