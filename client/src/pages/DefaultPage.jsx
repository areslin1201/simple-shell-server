import { useState, useEffect, useRef } from 'react';
import useShellStream from '../hooks/useShellStream';

/**
 * DefaultPage
 * 預設的動態配置頁面。根據 page.inputs 自動產生表單。
 */
export default function DefaultPage({ page }) {
  const { logs, running, exitInfo, run, stop, clear } = useShellStream();
  const [formState, setFormState] = useState({});
  const logEndRef = useRef(null);

  // 初始化或頁面改變時重設表單
  useEffect(() => {
    const initialState = {};
    (page.inputs || []).forEach(input => {
      initialState[input.id] = input.default || '';
    });
    setFormState(initialState);
    clear();
  }, [page, clear]);

  // 自動捲動
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleInputChange = (id, value) => {
    setFormState(prev => ({ ...prev, [id]: value }));
  };

  const handleRun = () => {
    if (!page.script || running) return;

    // 組合參數
    const assembledArgs = (page.inputs || [])
      .map(input => {
        const value = formState[input.id];
        if (value === undefined || value === '') return '';
        const prefix = input.prefix || '';
        return `${prefix}${value}`;
      })
      .filter(Boolean)
      .join(' ');

    run(page.script, assembledArgs);
  };

  return (
    <div className="terminal-panel">
      {/* 頁面標題 */}
      <div className="terminal-panel__header">
        <h2 className="terminal-panel__title">{page.name}</h2>
        <code className="terminal-panel__script-name">{page.script}</code>
      </div>

      {/* 控制區域 */}
      <div className="terminal-panel__controls">
        <div className="dynamic-form">
          {(page.inputs || []).length > 0 ? (
            page.inputs.map(input => (
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
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    className="control-input"
                    type="text"
                    value={formState[input.id] || ''}
                    onChange={e => handleInputChange(input.id, e.target.value)}
                    placeholder={input.placeholder}
                    disabled={running}
                  />
                )}
              </div>
            ))
          ) : (
            <div className="control-row empty-inputs">
              <span className="control-label text-muted">此腳本無需額外參數</span>
            </div>
          )}
        </div>

        <div className="control-actions">
          <button onClick={handleRun} disabled={running || !page.script} className="btn btn--run">
            {running ? '⏳ 執行中...' : '▶ 執行'}
          </button>
          {running && <button onClick={stop} className="btn btn--stop">⏹ 停止</button>}
          {logs.length > 0 && !running && <button onClick={clear} className="btn btn--clear">🗑️ 清除</button>}
        </div>
      </div>

      {/* 即時輸出 */}
      <div className="terminal">
        <div className="terminal__header">
          <span className="terminal__title">📟 即時輸出</span>
          {running && <span className="terminal__status pulse">● LIVE</span>}
        </div>
        <div className="terminal__body">
          {logs.length === 0 && !running && <div className="terminal__placeholder">點擊「執行」來查看系統輸出...</div>}
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
              <span className="log-text">{exitInfo.success ? '執行成功' : `執行失敗 (Exit Code: ${exitInfo.code})`}</span>
            </div>
          )}
          <div ref={logEndRef} />
        </div>
      </div>
    </div>
  );
}
