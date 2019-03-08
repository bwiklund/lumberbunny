import * as koa from 'koa';
import * as koaRouter from 'koa-router';
import * as bodyParser from 'koa-bodyparser';
import * as cors from '@koa/cors';


function logBlob(blobString: string) {
  // return new Promise((res, rej) => {
  //   var stmt = db.prepare("INSERT INTO blobs (blob) VALUES (?)");
  //   stmt.run(blobString);
  //   stmt.finalize(() => res());
  // });
}

function getAll() {
  // return new Promise<any[]>((res, rej) => {
  //   db.all("SELECT * FROM blobs", (err, rows) => {
  //     res(rows);
  //   })
  // });
}

const app = new koa();
const router = new koaRouter();

router.get('/', (ctx, next) => {
  ctx.body = "hi";
});

router.post('/logs/blobs', async (ctx, next) => {
  await logBlob(ctx.request.rawBody);
  ctx.body = "thanks";
});

router.get('/logs/all', async (ctx, next) => {
  // var blobs: any[] = await getAll();
  // var asObjects = blobs.map(b => {
  //   try { return JSON.parse(b.blob); }
  //   catch (e) { }
  // });
  // ctx.body = JSON.stringify(asObjects);
  ctx.body = "hi";
});

app.use(cors());
app.use(bodyParser());
app.use(router.routes());
app.use(router.allowedMethods);

app.listen(3001);