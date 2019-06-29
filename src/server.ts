import express from "express";
import bodyParser from "body-parser";
import cors from "cors";

import { logBlob, getAll, CACHE, getControllerDetail } from "./api";
import { Ctx } from "./context";

declare global {
  namespace Express {
    interface Request {
      ctx: Ctx;
    }
  }
}

const _server = express();
_server.use(bodyParser.urlencoded({ extended: false }));
_server.use(bodyParser.json());
_server.use(cors());

_server.get("/", (req, res) => {
  res.send("hi");
});

_server.post("/logs/blobs", async (req, res) => {
  var logItem = {
    data: req.body,
    ip: req.ip,
    headers: req.headers
  };
  await logBlob(req.ctx, logItem);
  res.send("thanks");
});

_server.get("/logs/all", async (req, res) => {
  var blobs: any[] = await getAll(req.ctx);
  res.send(blobs);
});

_server.get("/logs/matrix", async (req, res) => {
  res.send(CACHE.matrixCache);
});

_server.get("/logs/controllers", async (req, res) => {
  res.send(CACHE.controllersCache);
});

_server.get("/logs/controllers/:id", async (req, res) => {
  var data = await getControllerDetail(req.ctx, req.params.id);
  res.send(data);
});

export const server = _server;
