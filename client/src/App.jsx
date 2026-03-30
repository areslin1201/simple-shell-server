import { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import AdminPanel from './components/AdminPanel';
import { PageRegistry } from './pages';
import DefaultPage from './pages/DefaultPage';
import './App.css';

function App() {
  const [pages, setPages] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [showAdmin, setShowAdmin] = useState(false);

  // 載入頁面配置
  const loadPages = useCallback(() => {
    fetch('/api/pages')
      .then(res => res.json())
      .then(data => {
        const pgList = data.pages || [];
        setPages(pgList);
        // 如果當前選中的 id 不存在，選第一個
        setActiveId(prev => {
          if (prev && pgList.some(p => p.id === prev)) return prev;
          return pgList.length > 0 ? pgList[0].id : null;
        });
      })
      .catch(err => console.error('載入頁面失敗:', err));
  }, []);

  useEffect(() => {
    loadPages();
  }, [loadPages]);

  const activePage = pages.find(p => p.id === activeId);

  // 根據配置決定渲染哪個組件
  const renderContent = () => {
    if (!activePage) {
      return (
        <div className="empty-state">
          <div className="empty-state__icon">？</div>
          <h2 className="empty-state__title">尚無功能頁面</h2>
          <p className="empty-state__desc">點擊左側「管理平台」來新增你的第一個功能頁面</p>
        </div>
      );
    }

    const PageComponent = PageRegistry[activePage.component] || DefaultPage;
    return <PageComponent page={activePage} />;
  };

  return (
    <div className="app-layout">
      <Sidebar
        pages={pages}
        activeId={activeId}
        onSelect={setActiveId}
        onOpenAdmin={() => setShowAdmin(true)}
      />

      <main className="main-content">
        {renderContent()}
      </main>

      {showAdmin && (
        <AdminPanel
          pages={pages}
          onClose={() => setShowAdmin(false)}
          onRefresh={loadPages}
        />
      )}
    </div>
  );
}

export default App;
