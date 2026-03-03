const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 4000;

// Shell 資料夾的絕對路徑
const SHELL_DIR = path.resolve(__dirname, '../shell');

app.use(cors());
app.use(express.json());

// ✅ API 1：列出所有可用的 shell scripts
app.get('/api/scripts', (req, res) => {
  fs.readdir(SHELL_DIR, (err, files) => {
    if (err) return res.status(500).json({ error: '無法讀取 shell 資料夾' });
    const shellFiles = files.filter(f => f.endsWith('.sh'));
    res.json({ scripts: shellFiles });
  });
});

// ✅ API 2：以 SSE 串流方式執行 shell script（即時輸出）
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
    'Connection': 'keep-alive',
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

  child.stdout.on('data', (chunk) => {
    const lines = chunk.toString().split('\n');
    lines.forEach(line => {
      if (line.trim()) sendEvent('stdout', line);
    });
  });

  child.stderr.on('data', (chunk) => {
    const lines = chunk.toString().split('\n');
    lines.forEach(line => {
      if (line.trim()) sendEvent('stderr', line);
    });
  });

  child.on('close', (code) => {
    sendEvent('exit', { code, success: code === 0 });
    res.write('data: [DONE]\n\n');
    res.end();
  });

  child.on('error', (err) => {
    sendEvent('error', err.message);
    res.write('data: [DONE]\n\n');
    res.end();
  });

  // 如果客戶端斷開連接，終止子進程
  req.on('close', () => {
    child.kill('SIGTERM');
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Shell API Server 啟動於 http://localhost:${PORT}`);
});
