import * as koa from 'koa';
import * as koaRouter from 'koa-router';
import * as bodyParser from 'koa-bodyparser';
import * as cors from '@koa/cors';
import * as mongo from 'mongodb';

const dbHost = "mongodb://mongo"; // hostname set by docker compose
const dbName = "gamepads";

const client = new mongo.MongoClient(dbHost);
client.connect();

function logBlob(logItem: any) {
  var db = client.db(dbName);
  var coll = db.collection('gamepads');


  return coll.insert(logItem);
}

function getAll() {
  var db = client.db(dbName);
  var coll = db.collection('gamepads');

  return coll.find().toArray();
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

app.use(cors());
app.use(bodyParser());
app.use(router.routes());
app.use(router.allowedMethods);

app.listen(3001);