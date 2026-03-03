import { useState, useEffect, useRef } from 'react';
import './App.css';

function App() {
  const [scripts, setScripts] = useState([]);
  const [selectedScript, setSelectedScript] = useState('');
  const [args, setArgs] = useState('');
  const [logs, setLogs] = useState([]);
  const [running, setRunning] = useState(false);
  const [exitInfo, setExitInfo] = useState(null);
  const logEndRef = useRef(null);
  const eventSourceRef = useRef(null);

  // 自動捲動到底部
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // 載入可用的 shell scripts 列表
  useEffect(() => {
    fetch('/api/scripts')
      .then(res => res.json())
      .then(data => {
        setScripts(data.scripts || []);
        if (data.scripts?.length > 0) {
          setSelectedScript(data.scripts[0]);
        }
      })
      .catch(err => console.error('載入 scripts 失敗:', err));
  }, []);

  // 執行選中的 shell script（串流模式）
  const handleRun = () => {
    if (!selectedScript || running) return;

    setRunning(true);
    setLogs([]);
    setExitInfo(null);

    const params = new URLSearchParams({ script: selectedScript, args: args.trim() });
    const url = `/api/run-stream?${params.toString()}`;

    const es = new EventSource(url);
    eventSourceRef.current = es;

    es.onmessage = (event) => {
      if (event.data === '[DONE]') {
        es.close();
        setRunning(false);
        return;
      }

      try {
        const { type, data } = JSON.parse(event.data);

        if (type === 'exit') {
          setExitInfo(data);
        } else {
          setLogs(prev => [...prev, { type, text: typeof data === 'string' ? data : JSON.stringify(data) }]);
        }
      } catch {
        // ignore parse errors
      }
    };

    es.onerror = () => {
      es.close();
      setRunning(false);
      setLogs(prev => [...prev, { type: 'error', text: '⚠️ 連線中斷' }]);
    };
  };

  // 停止執行
  const handleStop = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      setRunning(false);
      setLogs(prev => [...prev, { type: 'stderr', text: '🛑 已手動中止' }]);
    }
  };

  // 清除 logs
  const handleClear = () => {
    setLogs([]);
    setExitInfo(null);
  };

  return (
    <div className="app">
      <h1>🖥️ Shell Script 控制面板</h1>

      {/* Script 選擇器 */}
      <div className="control-group">
        <label>選擇 Script：</label>
        <select
          value={selectedScript}
          onChange={e => setSelectedScript(e.target.value)}
          disabled={running}
        >
          {scripts.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* 參數輸入 */}
      <div className="control-group">
        <label>輸入參數：</label>
        <input
          type="text"
          value={args}
          onChange={e => setArgs(e.target.value)}
          placeholder='例如: --env production --verbose'
          onKeyDown={e => e.key === 'Enter' && handleRun()}
          disabled={running}
        />
      </div>

      {/* 按鈕列 */}
      <div className="button-group">
        <button onClick={handleRun} disabled={running || !selectedScript} className="btn-run">
          {running ? '⏳ 執行中...' : '▶ 執行'}
        </button>
        {running && (
          <button onClick={handleStop} className="btn-stop">
            ⏹ 停止
          </button>
        )}
        {logs.length > 0 && !running && (
          <button onClick={handleClear} className="btn-clear">
            🗑️ 清除
          </button>
        )}
      </div>

      {/* 即時輸出終端機 */}
      {(logs.length > 0 || running) && (
        <div className="terminal">
          <div className="terminal-header">
            <span className="terminal-title">📟 即時輸出</span>
            {running && <span className="terminal-status pulse">● LIVE</span>}
          </div>
          <div className="terminal-body">
            {logs.map((log, i) => (
              <div key={i} className={`log-line log-${log.type}`}>
                <span className="log-prefix">
                  {log.type === 'stdout' ? '❯' : log.type === 'stderr' ? '⚠' : log.type === 'start' ? '▶' : '●'}
                </span>
                <span className="log-text">{log.text}</span>
              </div>
            ))}
            {exitInfo && (
              <div className={`log-line log-exit ${exitInfo.success ? 'exit-success' : 'exit-fail'}`}>
                <span className="log-prefix">{exitInfo.success ? '✅' : '❌'}</span>
                <span className="log-text">
                  {exitInfo.success ? '執行完成' : `執行失敗 (exit code: ${exitInfo.code})`}
                </span>
              </div>
            )}
            <div ref={logEndRef} />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
