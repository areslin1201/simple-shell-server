#!/bin/bash

# --- 環境變數與輔助函式 ---

# ANSI Color Codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 模擬步驟的輔助函式
simulate_step() {
    local msg=$1
    local duration=$2
    echo -ne " ${BLUE}●${NC} ${msg}..."
    sleep $duration
    echo -e "  ${GREEN}DONE${NC}"
}

# --- 1. 解析參數 (預設值) ---
ENV="staging"
VERSION="latest"

while [[ "$#" -gt 0 ]]; do
    case $1 in
        --env) ENV="$2"; shift 2 ;;
        --version) VERSION="$2"; shift 2 ;;
        *) shift ;;
    esac
done

echo -e "${BLUE}=== 🚀 啟動自動化部署程序 ===${NC}"
echo -e "目標環境: ${YELLOW}${ENV}${NC}"
echo -e "發佈版本: ${YELLOW}${VERSION}${NC}"
echo ""

# 取得當前目錄 (會在 /app/shell)
CURRENT_DIR=$(pwd)

# --- 2. Next.js 專案建置與打包 (Workspace 整合) ---
WORKSPACE_DIR="/app/workspace"
PROJECT_NAME="project-a"
OUTPUT_DIR="/app/output/project-a"

# 確保輸出目錄存在
mkdir -p "$OUTPUT_DIR"

if [ -d "$WORKSPACE_DIR/$PROJECT_NAME" ]; then
    echo -e "${YELLOW}=== 📦 進入 Workspace 進行實際專案建置: ${PROJECT_NAME} ===${NC}"
    cd "$WORKSPACE_DIR/$PROJECT_NAME"

    # 1. 安裝依賴
    echo -e "${BLUE}●${NC} 正在執行 npm install..."
    npm install --no-audit --no-fund --quiet
    if [ $? -ne 0 ]; then echo -e "${RED}❌ npm install 失敗${NC}"; exit 1; fi

    # 2. 執行建置
    echo -e "${BLUE}●${NC} 正在執行 npm run build (next build)..."
    npm run build
    if [ $? -ne 0 ]; then echo -e "${RED}❌ npm run build 失敗${NC}"; exit 1; fi

    # 3. 判斷建置輸出路徑
    BUILD_FOLDER=".next"
    if [ -d "out" ]; then BUILD_FOLDER="out"; fi
    
    # 4. 壓縮產物
    ZIP_NAME="dist.zip"
    echo -e "${BLUE}●${NC} 正在壓縮建置產物 (${BUILD_FOLDER} -> ${ZIP_NAME})..."
    zip -r "$ZIP_NAME" "$BUILD_FOLDER" > /dev/null

    # 5. 移動至輸出目錄
    echo -e "${BLUE}●${NC} 正在將打包檔傳送至輸出磁碟..."
    mv "$ZIP_NAME" "$OUTPUT_DIR/"

    echo -e "${GREEN}✅ 專案建置與打包完成！輸出位置: ${OUTPUT_DIR}/${ZIP_NAME}${NC}"
    
    # 切換回原來的 shell 目錄
    cd "$CURRENT_DIR"
else
    echo -e "${RED}❌ 找不到 Workspace 專案目錄: $WORKSPACE_DIR/$PROJECT_NAME${NC}"
    echo -e "請確認 docker-compose.yml 中的掛載路徑是否正確。"
fi

echo ""
echo -e "${GREEN}🎉 所有任務已完成！${NC}"