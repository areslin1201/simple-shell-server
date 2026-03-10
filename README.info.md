# 重要資訊

---

## 📁 專案架構

```
simple-shell-server/
├── server/                  # 後端 (Express API Server)
│   ├── index.js             # 主程式：API 路由、SSE 串流執行
│   ├── config.json          # 分類配置（categories ↔ scripts 對應）
│   └── package.json         # 後端依賴 (express, cors)
│
├── client/                  # 前端 (React + Vite)
│   ├── src/
│   │   ├── App.jsx          # 主要佈局：Sidebar + Terminal + AdminPanel
│   │   ├── App.css          # 全域樣式
│   │   ├── components/
│   │   │   ├── Sidebar.jsx      # 側邊欄：分類選單 + 收合功能
│   │   │   ├── Terminal.jsx     # 終端機：選擇 script → 執行 → 即時輸出
│   │   │   └── AdminPanel.jsx   # 管理面板：新增/編輯/刪除分類、綁定 scripts
│   │   └── main.jsx         # React 入口
│   ├── vite.config.js       # Vite 設定（含 /api → :4000 反向代理）
│   └── package.json         # 前端依賴 (react, vite)
│
├── shell/                   # Shell Scripts 存放目錄
│   ├── deploy.sh            # 範例：部署腳本
│   ├── backup.sh            # 範例：備份腳本（輸出至 output/）
│   └── cleanup.sh           # 範例：清理腳本
│
├── output/                  # Shell 執行輸出目錄（已 gitignore）
└── .gitignore
```

---

## 速開始

### 環境需求

- **Node.js** >= 18
- **npm**

### 安裝與啟動

```bash
# 1. 安裝後端依賴
cd server && npm install

# 2. 啟動後端 (port 4000)
node index.js

# 3. 開另一個終端，安裝前端依賴
cd client && npm install

# 4. 啟動前端 (port 5173)
npm run dev
```

啟動完成後，打開瀏覽器訪問：**http://localhost:5173**

---

## 🔄 使用流程

```
┌─────────────┐    /api/categories     ┌──────────────┐    讀取 config.json
│   瀏覽器     │ ◄──────────────────►  │  Express API  │ ◄────────────────►  config.json
│  (React)    │    /api/run-stream     │  (port 4000)  │    執行 shell
│  port 5173  │ ◄──── SSE 串流 ─────── │               │ ──► shell/*.sh
└─────────────┘                        └──────────────┘
      │                                       │
      │  Vite Proxy (/api → :4000)            │
      └───────────────────────────────────────┘
```

### 一般使用

1. 在 **側邊欄 (Sidebar)** 選擇功能分類（如「部署」、「測試」）
2. 在 **終端面板 (Terminal)** 的下拉選單中選擇 Script
3. 可選填入執行參數
4. 點擊 **▶ 執行** — 透過 SSE 即時串流顯示 stdout / stderr 輸出
5. 執行中可點擊 **⏹ 停止** 中止腳本

### 管理員操作

1. 點擊側邊欄底部的 **⚙️ 管理平台**
2. 可進行以下操作：
   - **新增分類**：輸入名稱、選擇圖示
   - **綁定 Scripts**：勾選 `shell/` 目錄下的 `.sh` 檔案
   - **編輯 / 刪除** 現有分類

### 新增自訂 Script

1. 將 `.sh` 檔案放入 `shell/` 資料夾
2. 到 **管理平台** 將該 script 綁定至對應分類
3. 回到主頁面即可選擇並執行

---

## 📡 API 一覽

| 方法     | 路徑                  | 說明                         |
| -------- | --------------------- | ---------------------------- |
| `GET`    | `/api/scripts`        | 列出所有 shell scripts       |
| `GET`    | `/api/shell-files`    | 列出可用 .sh 檔案（管理用）  |
| `GET`    | `/api/categories`     | 取得所有分類及綁定的 scripts |
| `POST`   | `/api/categories`     | 新增分類                     |
| `PUT`    | `/api/categories/:id` | 修改分類                     |
| `DELETE` | `/api/categories/:id` | 刪除分類                     |
| `GET`    | `/api/run-stream`     | SSE 串流執行 script          |

### SSE 串流 (`/api/run-stream`)

```
GET /api/run-stream?script=deploy.sh&args=--env production
```

回應為 Server-Sent Events，事件格式：

```json
{ "type": "start",  "data": "▶ 開始執行: bash deploy.sh" }
{ "type": "stdout", "data": "🚀 開始部署..." }
{ "type": "stderr", "data": "warning: ..." }
{ "type": "exit",   "data": { "code": 0, "success": true } }
```

---

## 🛡️ 安全機制

- **路徑穿越防護**：script 名稱不允許包含 `..` 或 `/`
- **參數注入過濾**：自動過濾 `; & | \` $ ( ) { }` 等危險字元
- **指定目錄執行**：僅執行 `shell/` 目錄下的 `.sh` 檔案
- **客戶端斷線處理**：前端斷開連接時自動終止子進程

---

## 🔧 其他指令

```bash
# 強制釋放 port 4000（伺服器異常退出時使用）
lsof -ti:4000 | xargs kill -9

# 前端 production build
cd client && npm run build
```

---

## 🛠 技術棧

| 層級 | 技術                                |
| ---- | ----------------------------------- |
| 前端 | React 19 + Vite 7                   |
| 後端 | Express 5 + Node.js                 |
| 通訊 | REST API + SSE (Server-Sent Events) |
| 設定 | JSON 檔案 (`config.json`)           |
