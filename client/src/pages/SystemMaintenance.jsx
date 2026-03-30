import { useState, useRef, useEffect } from 'react';
import useShellStream from '../hooks/useShellStream';

/**
 * SystemMaintenance
 * 專為系統清理與維護設計的自定義頁面。
 */
export default function SystemMaintenance({ page }) {
  const { logs, running, exitInfo, run, stop, clear } = useShellStream();
  const [env, setEnv] = useState('production');
  const [targetVersion, setTargetVersion] = useState('');
  const logEndRef = useRef(null);

  // 自動捲動
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleRun = () => {
    const args = `--env ${env} ${targetVersion ? `--version ${targetVersion}` : ''}`;
    run(page.script, args);
  };

  return (
    <div className="terminal-panel maintenance-page">
      <div className="terminal-panel__header">
        <h2 className="terminal-panel__title">🧹 系統維護中心 (Maintenance)</h2>
        <code className="terminal-panel__script-name">{page.script}</code>
      </div>

      {/* 系統狀態快看 */}
      <div className="maintenance-stats">
        <div className="stat-card">
          <div className="stat-icon">💾</div>
          <div className="stat-info">
            <span className="stat-label">磁碟佔用</span>
            <span className="stat-value">82%</span>
          </div>
          <div className="stat-progress">
            <div className="progress-bar warning" style={{ width: '82%' }}></div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⚡</div>
          <div className="stat-info">
            <span className="stat-label">系統健康度</span>
            <span className="stat-value">優良</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-info">
            <span className="stat-label">上次維護日期</span>
            <span className="stat-value">2026/03/25</span>
          </div>
        </div>
      </div>

      <div className="maintenance-controls">
        <div className="control-section">
          <h4>🛠️ 維護設定</h4>
          <div className="control-row">
            <label>執行範圍 (環境)</label>
            <select value={env} onChange={e => setEnv(e.target.value)} disabled={running}>
              <option value="production">Production Server (正式機)</option>
              <option value="staging">Staging Server (測試機)</option>
            </select>
          </div>
          <div className="control-row">
            <label>指定清理版本 (選填)</label>
            <input
              type="text"
              placeholder="如: 1.0.0"
              value={targetVersion}
              onChange={e => setTargetVersion(e.target.value)}
              disabled={running}
            />
          </div>
        </div>

        <div className="maintenance-actions">
          <button
            className={`btn btn--run ${running ? 'pulse' : ''}`}
            onClick={handleRun}
            disabled={running}
          >
            {running ? '⚙️ 處理中...' : '🔥 啟動全面清理'}
          </button>
          {running && (
            <button className="btn btn--stop" onClick={stop}>
              中止任務
            </button>
          )}
          {logs.length > 0 && !running && (
            <button className="btn btn--clear" onClick={clear}>
              清除日誌
            </button>
          )}
        </div>
      </div>

      {/* 終端機日誌 */}
      <div className="terminal">
        <div className="terminal__header">
          <span className="terminal__title">系統日誌輸出</span>
        </div>
        <div className="terminal__body">
          {logs.length === 0 && !running && (
            <div className="terminal__placeholder">等待任務啟動...</div>
          )}
          {logs.map((log, i) => (
            <div key={i} className={`log-line log-${log.type}`}>
              <span className="log-text">{log.text}</span>
            </div>
          ))}
          {exitInfo && (
            <div className={`log-line log-exit ${exitInfo.success ? 'exit-success' : 'exit-fail'}`}>
              <span className="log-text">
                {exitInfo.success
                  ? '✅ [SUCCESS] 系統維護已於 ' + new Date().toLocaleTimeString() + ' 完成。'
                  : '❌ [ERROR] 維護過程發生非預期錯誤。'}
              </span>
            </div>
          )}
          <div ref={logEndRef} />
        </div>
      </div>

      <style>{`
        .maintenance-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-bottom: 24px;
        }
        .stat-card {
          background: var(--surface-card);
          padding: 16px;
          border-radius: var(--radius-md);
          border: 1px solid var(--border-subtle);
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 12px;
        }
        .stat-icon { font-size: 24px; }
        .stat-info { display: flex; flex-direction: column; flex: 1; }
        .stat-label { font-size: 11px; color: var(--text-muted); text-transform: uppercase; font-weight: 700; }
        .stat-value { font-size: 16px; font-weight: 700; color: var(--text-primary); }
        .stat-progress { width: 100%; height: 4px; background: var(--bg-primary); border-radius: 2px; margin-top: 8px; overflow: hidden; }
        .progress-bar { height: 100%; transition: width 0.3s ease; }
        .progress-bar.warning { background: var(--accent-warning); }

        .maintenance-controls {
          background: rgba(0, 0, 0, 0.02);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-lg);
          padding: 20px;
          margin-bottom: 24px;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 20px;
        }
        .control-section { flex: 1; }
        .control-section h4 { margin-bottom: 16px; font-size: 14px; color: var(--text-secondary); }
        .control-row { margin-bottom: 12px; }
        .control-row label { display: block; font-size: 12px; font-weight: 600; color: var(--text-muted); margin-bottom: 4px; }
        .control-row input, .control-row select {
          width: 100%;
          padding: 8px 12px;
          background: var(--bg-primary);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-sm);
          color: var(--text-primary);
          outline: none;
        }
        .maintenance-actions { display: flex; flex-direction: column; gap: 8px; min-width: 160px; }
        .badge--warning { background: #f59e0b; color: white; }
      `}</style>
    </div>
  );
}
