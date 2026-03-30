import { useState, useRef, useEffect } from 'react';
import useShellStream from '../hooks/useShellStream';

/**
 * CustomDeployPage
 * 一個自定義頁面的範例，包含特定的 UI 配置、說明文件與 Shell 執行功能。
 */
export default function CustomDeployPage({ page }) {
  const { logs, running, exitInfo, run, stop, clear } = useShellStream();
  const [env, setEnv] = useState('staging');
  const [version, setVersion] = useState('latest');
  const logEndRef = useRef(null);

  // 自動捲動
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleRun = () => {
    // 自定義參數組合邏輯
    const args = `--env ${env} --version ${version}`;
    run(page.script, args);
  };

  return (
    <div className="terminal-panel custom-page">
      {/* 1. Header 與 頁面註記 */}
      <div className="terminal-panel__header">
        <h2 className="terminal-panel__title">🚀 專案部署控制台</h2>
        <span className="badge badge--success">Production Quality</span>
      </div>

      <div className="custom-notice-board">
        <div className="notice-item">
          <h4>📌 部署說明</h4>
          <p>
            此頁面專用於專案部署。在執行前，請確保後端服務已完成測試。
            本腳本會自動同步靜態檔案並重啟後端服務。
          </p>
        </div>
        <div className="notice-item">
          <h4>📊 系統狀態圖</h4>
          <div className="placeholder-image">
            <span style={{ fontSize: '48px' }}>📈</span>
            <p>【此處可放置 Grafana 或服務架構圖圖片】</p>
          </div>
        </div>
      </div>

      {/* 2. 自定義控制輸入 */}
      <div className="terminal-panel__controls custom-controls">
        <div className="control-row">
          <label className="control-label">部署環境</label>
          <select value={env} onChange={e => setEnv(e.target.value)} disabled={running} className="control-select">
            <option value="staging">Staging (測試環境)</option>
            <option value="production">Production (正式環境)</option>
          </select>
        </div>
        <div className="control-row">
          <label className="control-label">版本號</label>
          <input 
            type="text" 
            value={version} 
            onChange={e => setVersion(e.target.value)} 
            disabled={running} 
            placeholder="例如: 1.0.4"
            className="control-input"
          />
        </div>

        <div className="control-actions">
          <button onClick={handleRun} disabled={running} className="btn btn--run">
            {running ? '⏳ 部署中...' : '🚀 開始部署'}
          </button>
          {running && <button onClick={stop} className="btn btn--stop">⏹ 強制中止</button>}
          {logs.length > 0 && !running && <button onClick={clear} className="btn btn--clear">🗑️ 清除日誌</button>}
        </div>
      </div>

      {/* 3. Terminal 輸出 */}
      <div className="terminal">
        <div className="terminal__header">
          <span className="terminal__title">📋 部署日誌輸出</span>
          {running && <span className="terminal__status pulse">● DEPLOYING</span>}
        </div>
        <div className="terminal__body">
          {logs.length === 0 && !running && <div className="terminal__placeholder">等待部署任務開始...</div>}
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
              <span className="log-text">
                {exitInfo.success ? '✅ 部署成功！所有服務已就緒。' : `❌ 部署失敗，請檢查錯誤日誌 (Code: ${exitInfo.code})`}
              </span>
            </div>
          )}
          <div ref={logEndRef} />
        </div>
      </div>

      {/* 額外 CSS 可以在 App.css 中定義，或使用 inline style */}
      <style>{`
        .custom-notice-board {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 20px;
        }
        .notice-item {
          background: var(--surface-card);
          padding: 16px;
          border-radius: var(--radius-md);
          border: 1px solid var(--border-subtle);
        }
        .notice-item h4 { margin-bottom: 8px; color: var(--accent-primary); }
        .notice-item p { font-size: 13px; line-height: 1.6; color: var(--text-secondary); }
        .placeholder-image {
          height: 100px;
          background: var(--bg-primary);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          border-radius: var(--radius-sm);
          color: var(--text-muted);
          font-size: 12px;
          margin-top: 10px;
        }
        .badge {
          font-size: 12px;
          padding: 4px 8px;
          border-radius: 4px;
          font-weight: 700;
        }
        .badge--success { background: var(--accent-success); color: white; }
      `}</style>
    </div>
  );
}
