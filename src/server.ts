import express from "express";
import bodyParser from "body-parser";
import cors from "cors";

import { logBlob, getAll, CACHE, getControllerDetail } from "./api";
import { Ctx } from "./context";

export function createServer(ctx: Ctx) {
  const server = express();
  server.use(bodyParser.urlencoded({ extended: false }));
  server.use(bodyParser.json());
  server.use(cors());

  server.get("/", (req, res) => {
    res.send("hi");
  });

  server.post("/logs/blobs", async (req, res) => {
    var logItem = {
      data: req.body,
      ip: req.ip,
      headers: req.headers
    };
    await logBlob(ctx, logItem);
    res.send("thanks");
  });

  server.get("/logs/all", async (req, res) => {
    var blobs: any[] = await getAll(ctx);
    res.send(blobs);
  });

  server.get("/logs/matrix", async (req, res) => {
    res.send(CACHE.matrixCache);
  });

  server.get("/logs/controllers", async (req, res) => {
    res.send(CACHE.controllersCache);
  });

  server.get("/logs/controllers/:id", async (req, res) => {
    var data = await getControllerDetail(ctx, req.params.id);
    res.send(data);
  });

  return server;
}
