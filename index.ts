import * as bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import { CACHE, getAll, logBlob, getControllerDetail } from "./src/api";
import { createContext, Ctx } from "./src/context";

process.on("unhandledRejection", (reason: any, promise) => {
  console.log("Unhandled Rejection at:", reason ? reason.stack : reason);
});

// hostname set by docker compose
const env = process.env;
const dbHost = `mongodb://${env.MONGODB_USER}:${env.MONGODB_PWD}@mongo`;
const dbName = "gamepads";

async function start() {
  const ctx = await createContext({ dbHost, dbName });
  app.listen(3001);
  app.use((req, res) => (req.ctx = ctx));
}

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("hi");
});

app.post("/logs/blobs", async (req, res) => {
  var logItem = {
    data: req.body,
    ip: req.ip,
    headers: req.headers
  };
  await logBlob(req.ctx, logItem);
  res.send("thanks");
});

app.get("/logs/all", async (req, res) => {
  var blobs: any[] = await getAll(req.ctx);
  res.send(blobs);
});

app.get("/logs/matrix", async (req, res) => {
  res.send(CACHE.matrixCache);
});

app.get("/logs/controllers", async (req, res) => {
  res.send(CACHE.controllersCache);
});

app.get("/logs/controllers/:id", async (req, res) => {
  var data = await getControllerDetail(req.ctx, req.params.id);
  res.send(data);
});
