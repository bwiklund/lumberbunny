import * as useragent from "useragent";
import { Ctx } from "./context";

interface BrowserSupportData {
  [s: string]: { [s: string]: number };
}

export const CACHE = {
  matrixCache: "[]",
  controllersCache: "[]",
};

// simple cache mechanism that never delays a request...

export async function updateCache(ctx: Ctx) {
  CACHE.matrixCache = JSON.stringify(await getMatrix(ctx));
  CACHE.controllersCache = JSON.stringify(await getControllers(ctx));
}

export function logBlob(ctx: Ctx, logItem: {}) {
  return ctx.db.collection("gamepads").insertOne(logItem);
}

export function getAll(ctx: Ctx) {
  return ctx.db.collection("gamepads").find().toArray();
}

export async function getControllerDetail(ctx: Ctx, id: string) {
  var raw = await ctx.db
    .collection("gamepads")
    .aggregate([
      { $match: { "data.gamepad.id": id } },
      { $limit: 1 },
      {
        $project: {
          id: "$data.gamepad.id",
          axesCount: { $size: "$data.gamepad.axes" },
          buttonsCount: { $size: "$data.gamepad.buttons" },
          mapping: "$data.gamepad.mapping",
        },
      },
    ])
    .toArray();

  return raw[0];
}

export async function getControllers(ctx: Ctx) {
  var raw = await ctx.db
    .collection("gamepads")
    .aggregate([
      {
        $match: {
          "data.gamepad.id": { $exists: 1 },
        },
      },
      {
        $group: {
          _id: "$data.gamepad.id",
          total: { $sum: 1 },
        },
      },
      {
        $sort: {
          total: -1,
        },
      },
    ])
    .toArray();

  return raw;
}

export async function getMatrix(ctx: Ctx) {
  var raw = await ctx.db
    .collection("gamepads")
    .aggregate([
      {
        $match: {
          "data.gamepad.id": { $exists: 1 },
        },
      },
      {
        $group: {
          _id: {
            gamepadId: "$data.gamepad.id",
            "user-agent": "$headers.user-agent",
          },
          total: { $sum: 1 },
        },
      },
      {
        $sort: {
          total: 1,
        },
      },
    ])
    .toArray();

  return await new Promise<any>((resolve) => {
    var byUserAgent: BrowserSupportData = {};

    let i = 0;
    function step() {
      const r = raw[i++];
      const json = useragent.parse(r._id["user-agent"]).toJSON();

      if (!byUserAgent[json.family]) byUserAgent[json.family] = {};
      if (!byUserAgent[json.family][json.major])
        byUserAgent[json.family][json.major] = 0;
      byUserAgent[json.family][json.major] += r.total;

      if (i >= raw.length) {
        resolve(byUserAgent);
      } else {
        setImmediate(step);
      }
    }
    step();
  });
}
