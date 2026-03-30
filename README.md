# ⚡ ShellHub — Shell Script 管理與執行平台

一個基於 **React + Express** 的專業維運平台，可透過瀏覽器管理與執行 Shell Script。

### ✨ 特色功能

- **🖥️ 專屬中控台**：內建專為「部署」與「維護」設計的專業 UI 頁面。
- **📊 即時資訊**：整合系統狀態指標（磁碟、健康度）與即時日誌串流。
- **🛡️ 生產環境安全鎖**：防止在正式環境下誤轉執行敏感腳本。
- **⚙️ 高度可擴充性**：支援自定義 React 組件作為功能頁面。

---

## 🚀 快速開始

### 1. 安裝環境

```bash
./first-time-install.sh
```

### 2. 啟動服務

記得更改`docker-compose`名稱跟路徑

```bash
docker-compose up -d
```

訪問：[http://localhost:5173](http://localhost:5173)

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

## 記得開機即用

設定Restart Policy

```bash
# check all
docker ps -a

# check restart policy
docker inspect -f '{{.HostConfig.RestartPolicy.Name}}' simple-shell-server-server-1
```
