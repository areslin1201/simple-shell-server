import { useState, useEffect } from 'react';

const ICON_OPTIONS = [
  { value: 'rocket', label: '🚀 Rocket' },
  { value: 'flask', label: '🧪 Flask' },
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

export default function AdminPanel({ categories, onClose, onRefresh }) {
  const [shellFiles, setShellFiles] = useState([]);
  const [editCategories, setEditCategories] = useState([]);
  const [saving, setSaving] = useState(false);
  const [newName, setNewName] = useState('');
  const [newIcon, setNewIcon] = useState('terminal');
  const [message, setMessage] = useState(null);

  useEffect(() => {
    // 載入所有可用 shell 檔案
    fetch('/api/shell-files')
      .then(res => res.json())
      .then(data => setShellFiles(data.files || []))
      .catch(() => setShellFiles([]));

    // 複製一份用於編輯
    setEditCategories(categories.map(c => ({ ...c, scripts: [...c.scripts] })));
  }, [categories]);

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  // 新增分類
  const handleAdd = async () => {
    if (!newName.trim()) return;
    setSaving(true);
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim(), icon: newIcon, scripts: [] }),
      });
      if (res.ok) {
        showMessage('✅ 新增成功');
        setNewName('');
        setNewIcon('terminal');
        onRefresh();
      }
    } catch {
      showMessage('❌ 新增失敗', 'error');
    }
    setSaving(false);
  };

  // 更新分類
  const handleUpdate = async (cat) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/categories/${cat.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: cat.name, icon: cat.icon, scripts: cat.scripts }),
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

  // 刪除分類
  const handleDelete = async (id) => {
    if (!confirm('確定要刪除此分類嗎？')) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showMessage('🗑️ 已刪除');
        onRefresh();
      }
    } catch {
      showMessage('❌ 刪除失敗', 'error');
    }
    setSaving(false);
  };

  // 切換 script 綁定
  const toggleScript = (catIdx, scriptName) => {
    setEditCategories(prev => {
      const copy = prev.map(c => ({ ...c, scripts: [...c.scripts] }));
      const scripts = copy[catIdx].scripts;
      const idx = scripts.indexOf(scriptName);
      if (idx >= 0) {
        scripts.splice(idx, 1);
      } else {
        scripts.push(scriptName);
      }
      return copy;
    });
  };

  // 更新 name
  const updateName = (catIdx, name) => {
    setEditCategories(prev => {
      const copy = prev.map(c => ({ ...c, scripts: [...c.scripts] }));
      copy[catIdx].name = name;
      return copy;
    });
  };

  // 更新 icon
  const updateIcon = (catIdx, icon) => {
    setEditCategories(prev => {
      const copy = prev.map(c => ({ ...c, scripts: [...c.scripts] }));
      copy[catIdx].icon = icon;
      return copy;
    });
  };

  return (
    <div className="admin-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="admin-panel">
        {/* Header */}
        <div className="admin-panel__header">
          <h2 className="admin-panel__title">⚙️ 管理平台</h2>
          <button className="admin-panel__close" onClick={onClose}>✕</button>
        </div>

        {/* Message toast */}
        {message && (
          <div className={`admin-toast admin-toast--${message.type}`}>
            {message.text}
          </div>
        )}

        <div className="admin-panel__body">
          {/* Add new category */}
          <div className="admin-section">
            <h3 className="admin-section__title">新增分類</h3>
            <div className="admin-add-form">
              <input
                className="admin-input"
                type="text"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="分類名稱（如：🔥 監控）"
                onKeyDown={e => e.key === 'Enter' && handleAdd()}
              />
              <select
                className="admin-select"
                value={newIcon}
                onChange={e => setNewIcon(e.target.value)}
              >
                {ICON_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <button className="btn btn--add" onClick={handleAdd} disabled={saving || !newName.trim()}>
                ＋ 新增
              </button>
            </div>
          </div>

          {/* Existing categories */}
          <div className="admin-section">
            <h3 className="admin-section__title">已有分類 ({editCategories.length})</h3>
            <div className="admin-cards">
              {editCategories.map((cat, catIdx) => (
                <div key={cat.id} className="admin-card">
                  <div className="admin-card__header">
                    <input
                      className="admin-card__name"
                      value={cat.name}
                      onChange={e => updateName(catIdx, e.target.value)}
                    />
                    <select
                      className="admin-card__icon-select"
                      value={cat.icon}
                      onChange={e => updateIcon(catIdx, e.target.value)}
                    >
                      {ICON_OPTIONS.map(o => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="admin-card__scripts">
                    <span className="admin-card__scripts-label">綁定 Scripts：</span>
                    <div className="admin-card__script-list">
                      {shellFiles.map(file => (
                        <label key={file} className="admin-checkbox">
                          <input
                            type="checkbox"
                            checked={cat.scripts.includes(file)}
                            onChange={() => toggleScript(catIdx, file)}
                          />
                          <span className="admin-checkbox__text">{file}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="admin-card__actions">
                    <button
                      className="btn btn--save"
                      onClick={() => handleUpdate(cat)}
                      disabled={saving}
                    >
                      💾 儲存
                    </button>
                    <button
                      className="btn btn--delete"
                      onClick={() => handleDelete(cat.id)}
                      disabled={saving}
                    >
                      🗑️ 刪除
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
