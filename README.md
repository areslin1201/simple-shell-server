# ⚡ ShellHub — Shell Script 管理與執行平台

一個基於 **React + Express** 的 Web 平台，可透過瀏覽器管理與即時執行 Shell Script，支援分類管理、參數輸入、SSE 串流即時輸出。

---

## 環境要求

在運行本專案前，請確認您的電腦已安裝以下工具與套件：

- **Node.js** (建議 v18 以上) 與 **npm**：用於安裝前後端專案依賴。
- **Docker** 與 **Docker Compose**：用於容器化運行前後端服務。

---

## 🚀 快速開始

### 一鍵安裝所需環境

```bash
./first-time-install.sh
```

### 啟動

```bash
docker-compose up -d
```

開啟前端連結：[http://localhost:5173](http://localhost:5173)

### 暫停

```bash
docker-compose stop
```

### 重啟

```bash
docker-compose restart server
```

### 監聽該容器狀態

```bash
docker-compose logs -f {name}

# ready
docker-compose logs -f server
docker-compose logs -f client
```

---

## 📖 建立新功能流程

若要新增一個自動化腳本到平台，請遵循以下步驟：

### 1. 建立 Shell Script

在專案根目錄的 `shell/` 資料夾下，建立一個 `.sh` 檔案。
例如：`shell/deploy.sh`

```bash
#!/bin/bash
echo "🚀 開始部署專案至 $1 環境..."
```

> [!TIP]
> 系統會以 `bash` 呼叫腳本，請確保腳本內容符合 Bash 語法。

### 2. (核心) 選擇 UI 渲染模式

ShellHub 支援兩種頁面渲染方式，請根據需求選擇：

#### 🔹 模式 A：預設動態表單 (Default)

**適合：** 簡單的參數輸入，不需要特殊 UI 佈局。

- **作法：** 無需撰寫前端代碼。在「管理平台」新增頁面時，將「使用組件」設為 **Default**。
- **功能：** 透過 JSON 配置自動產生 Input 或 Select 欄位。

#### 🔹 模式 B：自定義 React 頁面 (Custom)

**適合：** 需要顯示圖片、架構圖、詳細文件註解或複雜邏輯的頁面。

1. **建立組件**：在 `client/src/pages/` 下建立 `.jsx` 組件（可參考 `CustomDeployPage.jsx`）。
2. **使用 Hook**：透過 `import useShellStream from '../hooks/useShellStream'` 來獲取執行腳本的能力。
3. **註冊組件**：在 `client/src/pages/index.js` 的 `PageRegistry` 中註冊您的組件。

### 3. 管理平台配置

1. 開啟 [http://localhost:5173](http://localhost:5173) -> **⚙️ 管理平台**。
2. **新增頁面**：輸入名稱、選擇圖標，並依照上述選擇 **對應腳本** 與 **使用組件**。
3. **儲存配置**：若使用 `Default` 模式，可進一步在卡片中新增「自定義輸入欄位」。

### 4. 執行與測試

回到首頁點擊左側新頁面，輸入參數並點擊 **「▶ 執行」** 即可看到即時輸出！
