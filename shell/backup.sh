#!/bin/bash

# ─────────────────────────────────────────
# 路徑設定
# ─────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"  # shell/ 的絕對路徑
OUTPUT_DIR="$SCRIPT_DIR/../output"                           # 往上一層找 output/
OUTPUT_FILE="$OUTPUT_DIR/output.txt"

# 確保 output 資料夾存在
mkdir -p "$OUTPUT_DIR"

# ─────────────────────────────────────────
echo "🚀 執行開始..."

# ─────────────────────────────────────────
# 隨機英文字產生
# ─────────────────────────────────────────
WORDS=("apple" "banana" "cloud" "dragon" "echo" "forest" "galaxy" "horizon"
       "island" "jungle" "knight" "lemon" "mountain" "nebula" "ocean"
       "phoenix" "quest" "river" "storm" "thunder" "universe" "valley"
       "whisper" "xenon" "yellow" "zenith")

RANDOM_TEXT=""
LINE_COUNT=5
WORDS_PER_LINE=6

for ((i=1; i<=LINE_COUNT; i++)); do
  LINE=""
  for ((j=1; j<=WORDS_PER_LINE; j++)); do
    WORD=${WORDS[$RANDOM % ${#WORDS[@]}]}
    LINE="$LINE $WORD"
  done
  RANDOM_TEXT="$RANDOM_TEXT$(echo $LINE | xargs)\n"
done

printf "$RANDOM_TEXT" > "$OUTPUT_FILE"
echo "📝 已寫入 → $OUTPUT_FILE"

# ─────────────────────────────────────────
echo "✅ 已完成"
