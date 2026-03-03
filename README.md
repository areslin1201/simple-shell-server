# Shell Server

## how to start

```bash
# start server
cd server && node index.js

# start client
cd client && npm run dev
```

## other

kill port 4000

```bash
lsof -ti:4000 | xargs kill -9
```
