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

## 建立新 Shell 與頁面流程

若要新增一個功能，請遵循以下步驟：

### 1. 建立 Shell Script

在專案根目錄的 `shell/` 資料夾下，建立一個新的 `.sh` 檔案。
例如：`shell/hello.sh`

```bash
#!/bin/bash
echo "Hello, $1! Welcome to $2."
```

> [!TIP]
> 記得確保腳本具備執行權限（系統會嘗試以 `bash` 呼叫，但建議開發時檢查腳本內容）。

### 2. 開啟管理平台

啟動專案後，造訪 [http://localhost:5173](http://localhost:5173)，點擊左側側邊欄最下方的 **「⚙️ 管理平台」**。

### 3. 新增導航頁面

1. 在「新增導航頁面」區塊，輸入頁面名稱並選擇一個圖標，點擊 **「＋ 新增」**。
2. 在下方出現的頁面配置卡片中：
   - **對應 Shell Script**: 選擇剛才建立的 `hello.sh`。
   - **自定義輸入欄位**: 點擊 **「＋ 新增欄位」**。
     - 欄位 1: 標籤「名稱」, Flag「」 (留空即可，腳本對應 $1)。
     - 欄位 2: 標籤「環境」, Flag「」 (留空即可，腳本對應 $2)。
3. 點擊 **「💾 儲存頁面配置」**。

### 4. 開始執行

回到主介面，點擊左側新出現的頁面，輸入參數後即可點擊 **「▶ 執行」** 看到即時輸出！
