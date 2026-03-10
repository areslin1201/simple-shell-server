import { useState, useEffect, useRef } from 'react';

export default function Terminal({ scripts, categoryName }) {
  const [selectedScript, setSelectedScript] = useState('');
  const [args, setArgs] = useState('');
  const [logs, setLogs] = useState([]);
  const [running, setRunning] = useState(false);
  const [exitInfo, setExitInfo] = useState(null);
  const logEndRef = useRef(null);
  const eventSourceRef = useRef(null);

  // 當 scripts 改變時重設選中項
  useEffect(() => {
    if (scripts.length > 0) {
      setSelectedScript(scripts[0]);
    } else {
      setSelectedScript('');
    }
    setLogs([]);
    setExitInfo(null);
  }, [scripts]);

  // 自動捲動到底部
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

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

    es.onmessage = event => {
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
          setLogs(prev => [
            ...prev,
            { type, text: typeof data === 'string' ? data : JSON.stringify(data) },
          ]);
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
    <div className="terminal-panel">
      {/* Header bar */}
      <div className="terminal-panel__header">
        <h2 className="terminal-panel__title">{categoryName}</h2>
      </div>

      {/* Controls */}
      <div className="terminal-panel__controls">
        <div className="control-row">
          <label className="control-label">Script</label>
          <select
            className="control-select"
            value={selectedScript}
            onChange={e => setSelectedScript(e.target.value)}
            disabled={running}
          >
            {scripts.length === 0 && <option value="">— 無可用 Script —</option>}
            {scripts.map(s => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div className="control-row">
          <label className="control-label">參數</label>
          <input
            className="control-input"
            type="text"
            value={args}
            onChange={e => setArgs(e.target.value)}
            placeholder="例如: --env production --verbose"
            onKeyDown={e => e.key === 'Enter' && handleRun()}
            disabled={running}
          />
        </div>

        <div className="control-actions">
          <button
            onClick={handleRun}
            disabled={running || !selectedScript}
            className="btn btn--run"
          >
            {running ? '⏳ 執行中...' : '▶ 執行'}
          </button>
          {running && (
            <button onClick={handleStop} className="btn btn--stop">
              ⏹ 停止
            </button>
          )}
          {logs.length > 0 && !running && (
            <button onClick={handleClear} className="btn btn--clear">
              🗑️ 清除
            </button>
          )}
        </div>
      </div>

      {/* Terminal output */}
      <div className="terminal">
        <div className="terminal__header">
          <span className="terminal__title">📟 即時輸出</span>
          {running && <span className="terminal__status pulse">● LIVE</span>}
        </div>
        <div className="terminal__body">
          {logs.length === 0 && !running && (
            <div className="terminal__placeholder">選擇一個 Script 並點擊「執行」來查看輸出...</div>
          )}
          {logs.map((log, i) => (
            <div key={i} className={`log-line log-${log.type}`}>
              <span className="log-prefix">
                {log.type === 'stdout'
                  ? '❯'
                  : log.type === 'stderr'
                    ? '⚠'
                    : log.type === 'start'
                      ? '▶'
                      : '●'}
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
    </div>
  );
}
