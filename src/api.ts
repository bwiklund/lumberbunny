
import * as mongo from 'mongodb';
import * as useragent from 'useragent';


const dbHost = "mongodb://" + process.env.MONGODB_USER + ":" + process.env.MONGODB_PWD + "@mongo"; // hostname set by docker compose
const dbName = "gamepads";

interface BrowserSupportData { [s: string]: { [s: string]: number } };

const client = new mongo.MongoClient(dbHost);
client.connect(() => {
  updateCache();
  setInterval(updateCache, 10 * 60 * 1000);
});

export const CACHE = {
  matrixCache: "[]",
  controllersCache: "[]"
}

// simple cache mechanism that never delays a request...

async function updateCache() {
  CACHE.matrixCache = JSON.stringify(await getMatrix());
  CACHE.controllersCache = JSON.stringify(await getControllers());
}

export function logBlob(logItem: {}) {
  var db = client.db(dbName);
  return db.collection('gamepads').insertOne(logItem);
}

export function getAll() {
  var db = client.db(dbName);
  return db.collection('gamepads').find().toArray();
}

export async function getControllerDetail(id: string) {
  var db = client.db(dbName);
  var raw = await db.collection('gamepads').aggregate([
    {$match: {"data.gamepad.id": id}},
    {$limit: 1},
    {$project: {
      id: "$data.gamepad.id",
      axesCount: {$size: "$data.gamepad.axes"},
      buttonsCount: {$size: "$data.gamepad.buttons"},
      mapping: "$data.gamepad.mapping",
    }}
  ]).toArray();

  return raw[0];
}

export async function getControllers() {
  var db = client.db(dbName);

  var raw = await db.collection('gamepads').aggregate([
    {
      $match: {
        "data.gamepad.id": { $exists: 1 }
      }
    },
    {
      $group: {
        _id: "$data.gamepad.id",
        total: { $sum: 1 }
      }
    },
    {
      $sort: {
        total: -1
      }
    }
  ]).toArray();

  return raw;
}

export async function getMatrix() {
  var db = client.db(dbName);

  var raw = await db.collection('gamepads').aggregate([
    {
      $match: {
        "data.gamepad.id": { $exists: 1 }
      }
    },
    {
      $group: {
        _id: { gamepadId: "$data.gamepad.id", 'user-agent': "$headers.user-agent" },
        total: { $sum: 1 }
      }
    },
    {
      $sort: {
        total: 1
      }
    }
  ]).toArray();

  var byUserAgent: BrowserSupportData = {}
  raw.forEach((r) => {
    var ua = useragent.parse(r._id['user-agent']).toAgent();
    var json = useragent.parse(r._id['user-agent']).toJSON();

    var gamepadId = r._id.gamepadId;

    if (!byUserAgent[json.family]) byUserAgent[json.family] = {};
    if (!byUserAgent[json.family][json.major]) byUserAgent[json.family][json.major] = 0;
    byUserAgent[json.family][json.major] += r.total;

  })
  return byUserAgent;
}