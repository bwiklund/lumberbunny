import { createContext } from "./src/context";
import { server } from "./src/server";
import { updateCache } from "./src/api";

process.on("unhandledRejection", (reason: any, promise) => {
  console.log("Unhandled Rejection at:", reason ? reason.stack : reason);
});

// hostname set by docker compose
const env = process.env;
const dbHost = `mongodb://${env.MONGODB_USER}:${env.MONGODB_PWD}@mongo`;
const dbName = "gamepads";

async function start() {
  const ctx = await createContext({ dbHost, dbName });
  server.listen(3001);
  server.use((req, res, next) => {
    req.ctx = ctx;
    next();
  });

  updateCache(ctx);
  setInterval(() => updateCache(ctx), 10 * 60 * 1000);
}

start();
