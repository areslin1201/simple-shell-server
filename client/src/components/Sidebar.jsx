import { useState } from 'react';

export default function Sidebar({ categories, activeId, onSelect, onOpenAdmin }) {
  const [collapsed, setCollapsed] = useState(false);

  const iconMap = {
    rocket: '🚀',
    flask: '🧪',
    terminal: '💻',
    gear: '⚙️',
    server: '🖥️',
    database: '🗄️',
    cloud: '☁️',
    shield: '🛡️',
    code: '📝',
    bug: '🐛',
    chart: '📊',
    folder: '📁',
  };

  return (
    <aside className={`sidebar ${collapsed ? 'sidebar--collapsed' : ''}`}>
      {/* Logo / Title */}
      <div className="sidebar__header">
        <div
          className={`sidebar__logo ${collapsed ? 'sidebar__logo--clickable' : ''}`}
          onClick={() => collapsed && setCollapsed(false)}
          title={collapsed ? '點擊展開' : undefined}
        >
          <span className="sidebar__logo-icon">⚡</span>
          {!collapsed && <span className="sidebar__logo-text">ShellHub</span>}
        </div>
        <button
          className="sidebar__toggle"
          onClick={() => setCollapsed(c => !c)}
          title={collapsed ? '展開' : '收合'}
        >
          {collapsed ? '▶' : '◀'}
        </button>
      </div>

      {/* Category list */}
      <nav className="sidebar__nav">
        <div className="sidebar__label">{!collapsed && '功能分類'}</div>
        {categories.map(cat => (
          <button
            key={cat.id}
            className={`sidebar__item ${activeId === cat.id ? 'sidebar__item--active' : ''}`}
            onClick={() => onSelect(cat.id)}
            title={cat.name}
          >
            <span className="sidebar__item-icon">
              {iconMap[cat.icon] || '📋'}
            </span>
            {!collapsed && <span className="sidebar__item-text">{cat.name}</span>}
            {!collapsed && (
              <span className="sidebar__item-badge">{cat.scripts.length}</span>
            )}
          </button>
        ))}
      </nav>

      {/* Admin button */}
      <div className="sidebar__footer">
        <button className="sidebar__admin-btn" onClick={onOpenAdmin} title="管理平台">
          <span className="sidebar__item-icon">⚙️</span>
          {!collapsed && <span className="sidebar__item-text">管理平台</span>}
        </button>
      </div>
    </aside>
  );
}
