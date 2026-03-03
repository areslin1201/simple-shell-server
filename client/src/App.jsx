import { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Terminal from './components/Terminal';
import AdminPanel from './components/AdminPanel';
import './App.css';

function App() {
  const [categories, setCategories] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [showAdmin, setShowAdmin] = useState(false);

  // 載入分類
  const loadCategories = useCallback(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => {
        const cats = data.categories || [];
        setCategories(cats);
        // 如果當前選中的 id 不存在，選第一個
        setActiveId(prev => {
          if (prev && cats.some(c => c.id === prev)) return prev;
          return cats.length > 0 ? cats[0].id : null;
        });
      })
      .catch(err => console.error('載入分類失敗:', err));
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const activeCategory = categories.find(c => c.id === activeId);

  return (
    <div className="app-layout">
      <Sidebar
        categories={categories}
        activeId={activeId}
        onSelect={setActiveId}
        onOpenAdmin={() => setShowAdmin(true)}
      />

      <main className="main-content">
        {activeCategory ? (
          <Terminal
            scripts={activeCategory.scripts}
            categoryName={activeCategory.name}
          />
        ) : (
          <div className="empty-state">
            <div className="empty-state__icon">�</div>
            <h2 className="empty-state__title">尚無功能分類</h2>
            <p className="empty-state__desc">
              點擊左側「管理平台」來新增你的第一個功能分類
            </p>
          </div>
        )}
      </main>

      {showAdmin && (
        <AdminPanel
          categories={categories}
          onClose={() => setShowAdmin(false)}
          onRefresh={loadCategories}
        />
      )}
    </div>
  );
}

export default App;
