import { useState, useEffect, useRef } from 'react';

export default function Terminal({ page }) {
  const [formState, setFormState] = useState({});
  const [logs, setLogs] = useState([]);
  const [running, setRunning] = useState(false);
  const [exitInfo, setExitInfo] = useState(null);
  const logEndRef = useRef(null);
  const eventSourceRef = useRef(null);

  // 當頁面改變時，初始化表單狀態
  useEffect(() => {
    const initialState = {};
    (page.inputs || []).forEach(input => {
      initialState[input.id] = input.default || '';
    });
    setFormState(initialState);
    setLogs([]);
    setExitInfo(null);
  }, [page]);

  // 自動捲動到底部
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // 更新表單欄位
  const handleInputChange = (id, value) => {
    setFormState(prev => ({ ...prev, [id]: value }));
  };

  // 執行選中的 shell script（串流模式）
  const handleRun = () => {
    if (!page.script || running) return;

    setRunning(true);
    setLogs([]);
    setExitInfo(null);

    // 根據 page.inputs 與 formState 組合參數
    const assembledArgs = (page.inputs || [])
      .map(input => {
        const value = formState[input.id];
        if (value === undefined || value === '') return '';
        const prefix = input.prefix || '';
        return `${prefix}${value}`;
      })
      .filter(Boolean)
      .join(' ');

    const params = new URLSearchParams({ script: page.script, args: assembledArgs });
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
        <h2 className="terminal-panel__title">{page.name}</h2>
        <code className="terminal-panel__script-name">{page.script}</code>
      </div>

      {/* Controls */}
      <div className="terminal-panel__controls">
        {(page.inputs || []).length > 0 ? (
          <div className="dynamic-form">
            {page.inputs.map(input => (
              <div key={input.id} className="control-row">
                <label className="control-label">{input.label}</label>
                {input.type === 'select' ? (
                  <select
                    className="control-select"
                    value={formState[input.id] || ''}
                    onChange={e => handleInputChange(input.id, e.target.value)}
                    disabled={running}
                  >
                    {(input.options || []).map(opt => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    className="control-input"
                    type="text"
                    value={formState[input.id] || ''}
                    onChange={e => handleInputChange(input.id, e.target.value)}
                    placeholder={input.placeholder || ''}
                    disabled={running}
                  />
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="control-row empty-inputs">
            <span className="control-label text-muted">此腳本不需要輸入參數</span>
          </div>
        )}

        <div className="control-actions">
          <button onClick={handleRun} disabled={running || !page.script} className="btn btn--run">
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
