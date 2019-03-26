import * as bodyparser from 'body-parser';
import * as cors from "cors";
import * as express from "express";
import * as mongo from 'mongodb';
import * as useragent from 'useragent';

const dbHost = "mongodb://" + process.env.MONGODB_USER + ":" + process.env.MONGODB_PWD + "@mongo"; // hostname set by docker compose
const dbName = "gamepads";

const client = new mongo.MongoClient(dbHost);
client.connect();

function logBlob(logItem: any) {
  var db = client.db(dbName);
  return db.collection('gamepads').insert(logItem);
}

function getAll() {
  var db = client.db(dbName);
  return db.collection('gamepads').find().toArray();
}

async function getMatrix() {
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

  var byUserAgent = {}
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

const app = express();

app.get('/', (req, res) => {
  res.send("hi");
});

app.post('/logs/blobs', async (req, res) => {
  var logItem = {
    data: JSON.parse(req.body),
    ip: req.ip,
    headers: req.headers
  }
  await logBlob(logItem);
  res.send("thanks");
});

app.get('/logs/all', async (req, res) => {
  var blobs: any[] = await getAll();
  res.send(JSON.stringify(blobs));
});

// simple cache mechanism that never delays a request...
var matrixCache = {};
async function updateMatrixCache() { matrixCache = JSON.stringify(await getMatrix()); }
setInterval(updateMatrixCache, 10 * 60 * 1000);
updateMatrixCache();

app.get('/logs/matrix', async (req, res) => {
  res.send(matrixCache);
});

app.use(cors());
app.use(bodyparser());

app.listen(3001);
