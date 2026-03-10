FROM node:20-alpine

WORKDIR /app/client

COPY package*.json ./
RUN npm install

COPY . .

# Vite 預設 port
EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
