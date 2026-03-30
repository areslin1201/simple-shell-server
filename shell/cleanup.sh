#!/bin/bash

# 1. 初始化變數預設值
VERSION=""
ENV=""

# 2. 使用 while 迴圈與 case 來解析參數
while [[ "$#" -gt 0 ]]; do
    case $1 in
        --version)
            VERSION="$2"   # 取得 --version 後面的值
            shift 2        # 處理完兩個參數（鍵與值），將參數位置向左移兩格
            ;;
        --env)
            ENV="$2"       # 取得 --env 後面的值
            shift 2        # 同樣向左移兩格
            ;;
        *)
            echo "❌ 未知的參數: $1"
            exit 1
            ;;
    esac
done

# 3. 檢查是否有成功讀取到參數 (可選)
if [[ -z "$VERSION" || -z "$ENV" ]]; then
    echo "⚠️ 請提供完整的參數，例如: $0 --version 1.2.0 --env prod"
    exit 1
fi

# 4. 輸出結果，確認變數已成功帶入
echo "✅ 成功載入設定！"
echo "👉 部署版本: $VERSION"
echo "👉 執行環境: $ENV"
