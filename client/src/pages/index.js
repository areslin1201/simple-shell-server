import DefaultPage from './DefaultPage';
import DeployDashboard from './DeployDashboard';
import SystemMaintenance from './SystemMaintenance';

/**
 * 頁面註冊表 (Page Registry)
 * 這裡將後端 config.json 中的 "component" 字串對應到實際的 React 組件。
 */
export const PageRegistry = {
  Default: DefaultPage,
  DeployDashboard: DeployDashboard,
  SystemMaintenance: SystemMaintenance,
};

// 供 AdminPanel 顯示選單使用
export const AVAILABLE_COMPONENTS = [
  { value: 'Default', label: '預設動態表單' },
  { value: 'DeployDashboard', label: '🚀 專案發佈控制中心' },
  { value: 'SystemMaintenance', label: '🧹 系統維護清理中心' },
];
