import { useState, useRef, useEffect } from 'react';
import useShellStream from '../hooks/useShellStream';

/**
 * DeployDashboard
 * 專為專案部署與發佈流程設計。
 */
export default function DeployDashboard({ page }) {
  const { logs, running, exitInfo, run, stop, clear } = useShellStream();
  const [env, setEnv] = useState('staging');
  const [version, setVersion] = useState('v1.2.0');
  const [isLocked, setIsLocked] = useState(true);
  const logEndRef = useRef(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleRun = () => {
    if (env === 'production' && isLocked) {
      alert('請先解除「生產環境安全鎖」再執行！');
      return;
    }
    const args = `--env ${env} --version ${version}`;
    run(page.script, args);
  };

  return (
    <div className="terminal-panel deploy-dashboard">
      <div className="terminal-panel__header">
        <h2 className="terminal-panel__title">🚀 專案發佈控制台 (Deploy Dashboard)</h2>
        <div className="header-actions">
          <code className="terminal-panel__script-name">{page.script}</code>
        </div>
      </div>

      <div className="deploy-info-grid">
        <div className="info-card doc-card">
          <h4>📌 部署流程說明</h4>
          <ul>
            <li>全自動化 CI/CD 流程同步。</li>
            <li>正式環境 (Production) 具備安全防護機制。</li>
            <li>部署後會自動執行快取刷新與服務存活檢查。</li>
          </ul>
        </div>
        <div className="info-card status-card">
          <h4>📊 服務健康度</h4>
          <div className="health-grid">
            <div className="health-item">
              <span className="dot online"></span> API Server
            </div>
            <div className="health-item">
              <span className="dot online"></span> Database
            </div>
            <div className="health-item">
              <span className="dot online"></span> Redis
            </div>
          </div>
        </div>
      </div>

      <div className="deploy-controls">
        <div className="control-group">
          <label>目標環境</label>
          <div className="env-selector">
            <button
              className={env === 'staging' ? 'active' : ''}
              onClick={() => setEnv('staging')}
              disabled={running}
            >
              Staging
            </button>
            <button
              className={env === 'production' ? 'active alert' : ''}
              onClick={() => setEnv('production')}
              disabled={running}
            >
              Production
            </button>
          </div>
        </div>

        <div className="control-group">
          <label>版本號 (Tag/Hash)</label>
          <input
            type="text"
            value={version}
            onChange={e => setVersion(e.target.value)}
            disabled={running}
          />
        </div>

        {env === 'production' && (
          <div className="control-group lock-group">
            <label>🔥 安全鎖</label>
            <button
              className={`lock-btn ${isLocked ? 'locked' : 'unlocked'}`}
              onClick={() => setIsLocked(!isLocked)}
            >
              {isLocked ? '🔒 已鎖定 (點擊解鎖)' : '🔓 已解鎖 (可執行)'}
            </button>
          </div>
        )}
      </div>

      <div className="action-bar">
        <button className="btn btn--run btn--large" onClick={handleRun} disabled={running}>
          {running ? '⌛ 正在執行部署...' : '🚀 啟動部署任務'}
        </button>
        {running && (
          <button className="btn btn--stop" onClick={stop}>
            終止執行
          </button>
        )}
        {!running && logs.length > 0 && (
          <button className="btn btn--clear" onClick={clear}>
            清除日誌
          </button>
        )}
      </div>

      <div className="terminal">
        <div className="terminal__header">日誌串流輸出</div>
        <div className="terminal__body">
          {logs.length === 0 && !running && (
            <div className="terminal__placeholder">等待啟動...</div>
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
                  ? '✅ 部署完成！'
                  : '❌ 部署失敗，請檢查日誌回傳碼：' + exitInfo.code}
              </span>
            </div>
          )}
          <div ref={logEndRef} />
        </div>
      </div>

      <style>{`
        .deploy-dashboard .terminal-panel__header { display: flex; justify-content: space-between; align-items: center; }
        .status-indicator { font-size: 10px; font-weight: 800; padding: 4px 10px; border-radius: 20px; border: 1px solid #ccc; }
        .status-indicator.idle { color: #10b981; border-color: #d1fae5; background: #f0fdf4; }
        .status-indicator.running { background: #3b82f6; color: white; border-color: #3b82f6; }
        
        .deploy-info-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 16px; margin-bottom: 24px; }
        .info-card { background: var(--surface-card); padding: 16px; border-radius: var(--radius-md); border: 1px solid var(--border-subtle); }
        .info-card h4 { font-size: 14px; margin-bottom: 12px; color: var(--text-secondary); border-bottom: 1px solid var(--border-subtle); padding-bottom: 6px; }
        .info-card ul { list-style: none; padding: 0; font-size: 13px; color: var(--text-muted); }
        .info-card li { margin-bottom: 6px; position: relative; padding-left: 14px; }
        .info-card li::before { content: "•"; position: absolute; left: 0; color: var(--accent-primary); }
        
        .health-grid { display: flex; flex-direction: column; gap: 8px; }
        .health-item { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 600; color: var(--text-primary); }
        .dot { width: 8px; height: 8px; border-radius: 50%; }
        .dot.online { background: #10b981; box-shadow: 0 0 6px rgba(16, 185, 129, 0.5); }
        
        .deploy-controls { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-bottom: 24px; align-items: flex-start; }
        .control-group label { display: block; font-size: 12px; font-weight: 700; color: var(--text-muted); margin-bottom: 8px; text-transform: uppercase; }
        .env-selector { display: flex; background: var(--bg-primary); padding: 4px; border-radius: 8px; border: 1px solid var(--border-default); }
        .env-selector button { flex: 1; padding: 8px; border: none; background: transparent; cursor: pointer; border-radius: 6px; font-size: 13px; font-weight: 600; color: var(--text-muted); transition: all 0.2s; }
        .env-selector button.active { background: white; color: var(--accent-primary); box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
        .env-selector button.active.alert { color: var(--accent-danger); }
        .control-group input { width: 100%; padding: 10px; background: var(--bg-primary); border: 1px solid var(--border-default); border-radius: 8px; color: var(--text-primary); font-family: 'SF Mono', monospace; font-size: 13px; }
        
        .lock-btn { width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 8px; font-size: 13px; font-weight: 700; cursor: pointer; transition: all 0.22s; }
        .lock-btn.locked { background: #fee2e2; color: #b91c1c; border-color: #fecaca; }
        .lock-btn.unlocked { background: #dcfce7; color: #15803d; border-color: #bbf7d0; }
        
        .action-bar { margin-bottom: 24px; display: flex; gap: 12px; }
        .btn--large { flex: 1; padding: 14px; font-size: 16px; font-weight: 700; }
      `}</style>
    </div>
  );
}
