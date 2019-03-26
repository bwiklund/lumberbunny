import * as koa from 'koa';
import * as koaRouter from 'koa-router';
import * as bodyParser from 'koa-bodyparser';
import * as cors from '@koa/cors';
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

    // simple count
    if (!byUserAgent[json.family]) byUserAgent[json.family] = {};
    if (!byUserAgent[json.family][json.major]) byUserAgent[json.family][json.major] = 0;
    byUserAgent[json.family][json.major] += r.total;

    // by os and gamepad
    //if (!byUserAgent[ua]) byUserAgent[ua] = {};
    // if (!byUserAgent[ua][gamepadId]) byUserAgent[ua][gamepadId] = 0;
    // byUserAgent[ua][gamepadId] += r.total;
  })
  return byUserAgent;
}

const app = new koa();
const router = new koaRouter();

router.get('/', (ctx, next) => {
  ctx.body = "hi";
});

router.post('/logs/blobs', async (ctx, next) => {
  var logItem = {
    data: JSON.parse(ctx.request.rawBody),
    ip: ctx.request.ip,
    headers: ctx.request.headers
  }
  await logBlob(logItem);
  ctx.body = "thanks";
});

router.get('/logs/all', async (ctx, next) => {
  var blobs: any[] = await getAll();
  ctx.body = JSON.stringify(blobs);
});

router.get('/logs/matrix', async (ctx, next) => {
  var blobs = await getMatrix();
  ctx.body = JSON.stringify(blobs);
});

app.use(cors());
app.use(bodyParser());
app.use(router.routes());
app.use(router.allowedMethods);

app.listen(3001);
