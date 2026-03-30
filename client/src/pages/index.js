import DefaultPage from './DefaultPage';
import CustomDeployPage from './CustomDeployPage';

/**
 * PageRegistry
 * 映射「組件名稱」到對應的 React 組件。
 * 管理員可以在後台選擇要為某個路由使用哪個組件。
 */
export const PageRegistry = {
  Default: DefaultPage,
  CustomDeploy: CustomDeployPage,
};

// 供 AdminPanel 顯示選單使用
export const AVAILABLE_COMPONENTS = [
  { value: 'Default', label: '預設動態表單' },
  { value: 'CustomDeploy', label: '自定義頁面-cleanup範例' },
];
