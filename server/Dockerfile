FROM node:20-alpine

# 安裝 bash 或其他你在 script 中會用到的工具
RUN apk add --no-cache bash curl openssh

WORKDIR /app/server

# 只先複製 package.json 進行依賴安裝，善用 Docker cache
COPY package*.json ./
RUN npm install

# 複製其他原始碼
COPY . .

# server 預設 port
EXPOSE 4000

CMD ["node", "index.js"]
