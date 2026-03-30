import { useState, useEffect } from 'react';
import { AVAILABLE_COMPONENTS } from '../pages';

const ICON_OPTIONS = [
  { value: 'rocket', label: '🚀 Rocket' },
  { value: 'flask', label: '🧪 Flask' },
  { value: 'deploy', label: '📦 Deploy' },
  { value: 'terminal', label: '💻 Terminal' },
  { value: 'gear', label: '⚙️ Gear' },
  { value: 'server', label: '🖥️ Server' },
  { value: 'database', label: '🗄️ Database' },
  { value: 'cloud', label: '☁️ Cloud' },
  { value: 'shield', label: '🛡️ Shield' },
  { value: 'code', label: '📝 Code' },
  { value: 'bug', label: '🐛 Bug' },
  { value: 'chart', label: '📊 Chart' },
  { value: 'folder', label: '📁 Folder' },
];

export default function AdminPanel({ pages, onClose, onRefresh }) {
  const [shellFiles, setShellFiles] = useState([]);
  const [editPages, setEditPages] = useState([]);
  const [saving, setSaving] = useState(false);
  const [newName, setNewName] = useState('');
  const [newIcon, setNewIcon] = useState('terminal');
  const [newScript, setNewScript] = useState('');
  const [newComponent, setNewComponent] = useState('Default');
  const [message, setMessage] = useState(null);

  useEffect(() => {
    // 載入所有可用 shell 檔案
    fetch('/api/shell-files')
      .then(res => res.json())
      .then(data => {
        const files = data.files || [];
        setShellFiles(files);
        if (files.length > 0 && !newScript) {
          setNewScript(files[0]);
        }
      })
      .catch(() => setShellFiles([]));

    // 複製一份用於編輯
    setEditPages(
      pages.map(p => ({ ...p, inputs: p.inputs ? [...p.inputs.map(i => ({ ...i }))] : [] }))
    );
  }, [pages]);

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  // 新增頁面
  const handleAdd = async () => {
    if (!newName.trim()) return;
    setSaving(true);
    try {
      const res = await fetch('/api/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName.trim(),
          icon: newIcon,
          script: newScript,
          component: newComponent,
          inputs: [],
        }),
      });
      if (res.ok) {
        showMessage('✅ 新增成功');
        setNewName('');
        setNewIcon('terminal');
        // 不重設 newScript，方便連續新增
        onRefresh();
      }
    } catch {
      showMessage('❌ 新增失敗', 'error');
    }
    setSaving(false);
  };

  // 更新頁面
  const handleUpdate = async page => {
    setSaving(true);
    try {
      const res = await fetch(`/api/pages/${page.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: page.name,
          icon: page.icon,
          script: page.script,
          inputs: page.inputs,
          component: page.component,
        }),
      });
      if (res.ok) {
        showMessage('✅ 已儲存');
        onRefresh();
      }
    } catch {
      showMessage('❌ 儲存失敗', 'error');
    }
    setSaving(false);
  };

  // 刪除頁面
  const handleDelete = async id => {
    if (!confirm('確定要刪除此頁面嗎？')) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/pages/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showMessage('🗑️ 已刪除');
        onRefresh();
      }
    } catch {
      showMessage('❌ 刪除失敗', 'error');
    }
    setSaving(false);
  };

  // 更新基本欄位
  const updatePageField = (idx, field, value) => {
    setEditPages(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      return next;
    });
  };

  // --- Input Fields 管理 ---

  const addInput = idx => {
    setEditPages(prev => {
      const next = [...prev];
      const page = { ...next[idx] };
      page.inputs = [
        ...page.inputs,
        { id: `input_${Date.now()}`, label: '', type: 'text', placeholder: '', prefix: '' },
      ];
      next[idx] = page;
      return next;
    });
  };

  const removeInput = (pageIdx, inputIdx) => {
    setEditPages(prev => {
      const next = [...prev];
      const page = { ...next[pageIdx] };
      page.inputs = page.inputs.filter((_, i) => i !== inputIdx);
      next[pageIdx] = page;
      return next;
    });
  };

  const updateInput = (pageIdx, inputIdx, field, value) => {
    setEditPages(prev => {
      const next = [...prev];
      const page = { ...next[pageIdx] };
      const inputs = [...page.inputs];
      inputs[inputIdx] = { ...inputs[inputIdx], [field]: value };
      page.inputs = inputs;
      next[pageIdx] = page;
      return next;
    });
  };

  return (
    <div className="admin-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="admin-panel admin-panel--pages">
        {/* Header */}
        <div className="admin-panel__header">
          <h2 className="admin-panel__title">⚙️ 路由管理</h2>
          <button className="admin-panel__close" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Message toast */}
        {message && (
          <div className={`admin-toast admin-toast--${message.type}`}>{message.text}</div>
        )}

        <div className="admin-panel__body">
          {/* Add new page */}
          <div className="admin-section">
            <h3 className="admin-section__title">新增導航頁面</h3>
            <div className="admin-add-form">
              <input
                className="admin-input"
                type="text"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="頁面名稱（如：🚀 部署服務）"
              />
              <select
                className="admin-select"
                value={newIcon}
                onChange={e => setNewIcon(e.target.value)}
                title="選擇圖標"
              >
                {ICON_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <select
                className="admin-select"
                value={newScript}
                onChange={e => setNewScript(e.target.value)}
                title="選擇對應腳本"
              >
                <option value="">— 選擇腳本 —</option>
                {shellFiles.map(f => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
              <select
                className="admin-select"
                value={newComponent}
                onChange={e => setNewComponent(e.target.value)}
                title="選擇頁面組件"
              >
                {AVAILABLE_COMPONENTS.map(c => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="btn btn--add"
                disabled={saving || !newName.trim()}
                onClick={handleAdd}
              >
                ＋ 新增
              </button>
            </div>
          </div>

          {/* Existing pages */}
          <div className="admin-section">
            <h3 className="admin-section__title">頁面配置 ({editPages.length})</h3>
            <div className="admin-cards">
              {editPages.map((page, pgIdx) => (
                <div key={page.id} className="admin-card admin-card--page">
                  <div className="admin-card__main-info">
                    <div className="admin-form-group">
                      <label>名稱與圖標</label>
                      <div className="admin-input-group">
                        <input
                          className="admin-card__name"
                          value={page.name}
                          onChange={e => updatePageField(pgIdx, 'name', e.target.value)}
                        />
                        <select
                          className="admin-card__icon-select"
                          value={page.icon}
                          onChange={e => updatePageField(pgIdx, 'icon', e.target.value)}
                        >
                          {ICON_OPTIONS.map(o => (
                            <option key={o.value} value={o.value}>
                              {o.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="admin-form-group">
                      <label>對應 Shell Script</label>
                      <select
                        className="admin-select admin-select--full"
                        value={page.script}
                        onChange={e => updatePageField(pgIdx, 'script', e.target.value)}
                      >
                        <option value="">— 請選擇腳本 —</option>
                        {shellFiles.map(f => (
                          <option key={f} value={f}>
                            {f}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="admin-form-group">
                      <label>使用組件 (UI)</label>
                      <select
                        className="admin-select admin-select--full"
                        value={page.component || 'Default'}
                        onChange={e => updatePageField(pgIdx, 'component', e.target.value)}
                      >
                        {AVAILABLE_COMPONENTS.map(c => (
                          <option key={c.value} value={c.value}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="admin-card__inputs-section">
                    <div className="admin-card__inputs-header">
                      <label>自定義輸入欄位</label>
                      <button
                        className="btn btn--small btn--add-field"
                        onClick={() => addInput(pgIdx)}
                      >
                        ＋ 新增欄位
                      </button>
                    </div>
                    <div className="admin-inputs-list">
                      {page.inputs.length === 0 && (
                        <div className="admin-no-data">尚未設定任何輸入欄位</div>
                      )}
                      {page.inputs.map((input, inputIdx) => (
                        <div key={input.id || inputIdx} className="admin-input-edit-card">
                          <div className="admin-input-edit-row">
                            <div className="admin-form-group" style={{ flex: 2 }}>
                              <label>欄位標籤 (Label)</label>
                              <input
                                placeholder="如: 環境名稱"
                                value={input.label}
                                onChange={e =>
                                  updateInput(pgIdx, inputIdx, 'label', e.target.value)
                                }
                              />
                            </div>
                            <div className="admin-form-group" style={{ flex: 1.5 }}>
                              <label>欄位類型</label>
                              <select
                                value={input.type}
                                onChange={e => updateInput(pgIdx, inputIdx, 'type', e.target.value)}
                              >
                                <option value="text">文字輸入</option>
                                <option value="select">下拉選單</option>
                              </select>
                            </div>
                            <div className="admin-form-group" style={{ flex: 1.5 }}>
                              <label>參數 Flag (Prefix)</label>
                              <input
                                placeholder="如: --env "
                                value={input.prefix}
                                onChange={e =>
                                  updateInput(pgIdx, inputIdx, 'prefix', e.target.value)
                                }
                              />
                            </div>
                            <button
                              className="btn--remove-field"
                              onClick={() => removeInput(pgIdx, inputIdx)}
                              title="刪除此欄位"
                            >
                              ✕
                            </button>
                          </div>

                          <div className="admin-input-edit-row">
                            <div className="admin-form-group" style={{ flex: 1 }}>
                              <label>
                                {input.type === 'select'
                                  ? '選項 (用逗號分隔)'
                                  : '提示字 (Placeholder) / 預設值'}
                              </label>
                              {input.type === 'select' ? (
                                <input
                                  className="admin-input-full"
                                  placeholder="如: dev,stag,prod"
                                  value={
                                    Array.isArray(input.options)
                                      ? input.options.join(',')
                                      : input.options || ''
                                  }
                                  onChange={e =>
                                    updateInput(
                                      pgIdx,
                                      inputIdx,
                                      'options',
                                      e.target.value.split(',').map(s => s.trim())
                                    )
                                  }
                                />
                              ) : (
                                <input
                                  className="admin-input-full"
                                  placeholder="如: 請輸入環境..."
                                  value={input.placeholder || ''}
                                  onChange={e =>
                                    updateInput(pgIdx, inputIdx, 'placeholder', e.target.value)
                                  }
                                />
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="admin-card__actions">
                    <button
                      className="btn btn--save"
                      onClick={() => handleUpdate(page)}
                      disabled={saving}
                    >
                      💾 儲存頁面配置
                    </button>
                    <button
                      className="btn btn--delete"
                      onClick={() => handleDelete(page.id)}
                      disabled={saving}
                    >
                      🗑️ 刪除頁面
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
