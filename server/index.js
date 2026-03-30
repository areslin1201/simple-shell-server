const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 4000;

// Shell 資料夾的絕對路徑
const SHELL_DIR = path.resolve(__dirname, '../shell');
const CONFIG_PATH = path.resolve(__dirname, 'config.json');

app.use(cors());
app.use(express.json());

function readConfig() {
  try {
    const raw = fs.readFileSync(CONFIG_PATH, 'utf-8');
    const data = JSON.parse(raw);
    return { pages: data.pages || [] };
  } catch {
    return { pages: [] };
  }
}

function writeConfig(config) {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf-8');
}

// ✅ API：列出所有可用的 shell scripts
app.get('/api/scripts', (req, res) => {
  fs.readdir(SHELL_DIR, (err, files) => {
    if (err) return res.status(500).json({ error: '無法讀取 shell 資料夾' });
    const shellFiles = files.filter(f => f.endsWith('.sh'));
    res.json({ scripts: shellFiles });
  });
});

// ✅ API：列出 shell/ 目錄下所有可用 .sh 檔案（供管理介面選擇）
app.get('/api/shell-files', (req, res) => {
  fs.readdir(SHELL_DIR, (err, files) => {
    if (err) return res.status(500).json({ error: '無法讀取 shell 資料夾' });
    const shellFiles = files.filter(f => f.endsWith('.sh'));
    res.json({ files: shellFiles });
  });
});

// ✅ API：取得所有頁面（含對應 script 與 inputs）
app.get('/api/pages', (req, res) => {
  const config = readConfig();
  res.json({ pages: config.pages });
});

// ✅ API：新增頁面
app.post('/api/pages', (req, res) => {
  const { name, icon, script, inputs, component } = req.body;
  if (!name) return res.status(400).json({ error: '名稱為必填' });

  const config = readConfig();
  const id = name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase() + '_' + Date.now();
  const newPage = {
    id,
    name,
    icon: icon || 'terminal',
    script: script || '',
    inputs: inputs || [],
    component: component || 'Default',
  };
  config.pages.push(newPage);
  writeConfig(config);
  res.json({ success: true, page: newPage });
});

// ✅ API：修改頁面
app.put('/api/pages/:id', (req, res) => {
  const { id } = req.params;
  const { name, icon, script, inputs, component } = req.body;
  const config = readConfig();
  const idx = config.pages.findIndex(p => p.id === id);
  if (idx === -1) return res.status(404).json({ error: '找不到該頁面' });

  if (name !== undefined) config.pages[idx].name = name;
  if (icon !== undefined) config.pages[idx].icon = icon;
  if (script !== undefined) config.pages[idx].script = script;
  if (inputs !== undefined) config.pages[idx].inputs = inputs;
  if (component !== undefined) config.pages[idx].component = component;

  writeConfig(config);
  res.json({ success: true, page: config.pages[idx] });
});

// ✅ API：刪除頁面
app.delete('/api/pages/:id', (req, res) => {
  const { id } = req.params;
  const config = readConfig();
  const idx = config.pages.findIndex(p => p.id === id);
  if (idx === -1) return res.status(404).json({ error: '找不到該頁面' });

  config.pages.splice(idx, 1);
  writeConfig(config);
  res.json({ success: true });
});

// ✅ API：以 SSE 串流方式執行 shell script（即時輸出）
app.get('/api/run-stream', (req, res) => {
  const { script, args = '' } = req.query;

  // 🛡️ 安全檢查：防止路徑穿越攻擊
  if (!script || script.includes('..') || script.includes('/')) {
    res.status(400).json({ error: '無效的 script 名稱' });
    return;
  }

  const scriptPath = path.join(SHELL_DIR, script);

  // 檢查檔案是否存在
  if (!fs.existsSync(scriptPath)) {
    res.status(404).json({ error: `找不到 script: ${script}` });
    return;
  }

  // 🛡️ 對參數做基本的安全過濾（防止注入）
  const sanitizedArgs = args.replace(/[;&|`$(){}]/g, '');
  const argList = sanitizedArgs.trim() ? sanitizedArgs.trim().split(/\s+/) : [];

  // 設定 SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  });

  // 送出 SSE event 的輔助函式
  const sendEvent = (type, data) => {
    res.write(`data: ${JSON.stringify({ type, data })}\n\n`);
  };

  sendEvent('start', `▶ 開始執行: bash ${script} ${sanitizedArgs}`);

  const child = spawn('bash', [scriptPath, ...argList], {
    cwd: SHELL_DIR,
    env: { ...process.env },
  });

  child.stdout.on('data', chunk => {
    const lines = chunk.toString().split('\n');
    lines.forEach(line => {
      if (line.trim()) sendEvent('stdout', line);
    });
  });

  child.stderr.on('data', chunk => {
    const lines = chunk.toString().split('\n');
    lines.forEach(line => {
      if (line.trim()) sendEvent('stderr', line);
    });
  });

  child.on('close', code => {
    sendEvent('exit', { code, success: code === 0 });
    res.write('data: [DONE]\n\n');
    res.end();
  });

  child.on('error', err => {
    sendEvent('error', err.message);
    res.write('data: [DONE]\n\n');
    res.end();
  });

  // 如果客戶端斷開連接，終止子進程
  req.on('close', () => {
    child.kill('SIGTERM');
  });
});

const server = app.listen(PORT, () => {
  console.log(`🚀 Shell API Server 啟動於 http://localhost:${PORT}`);
});

// ✅ Graceful shutdown：Ctrl+C 時正確關閉 server 並釋放 port
function gracefulShutdown(signal) {
  console.log(`\n⏹ 收到 ${signal}，正在關閉 server...`);
  server.close(() => {
    console.log('✅ Server 已關閉，port 已釋放');
    process.exit(0);
  });

  // 如果 5 秒內沒關完，強制結束
  setTimeout(() => {
    console.error('⚠️ 強制關閉 server');
    process.exit(1);
  }, 5000);
}

process.on('SIGINT', () => gracefulShutdown('SIGINT')); // Ctrl+C
process.on('SIGTERM', () => gracefulShutdown('SIGTERM')); // kill command
