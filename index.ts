import * as koa from 'koa';
import * as koaRouter from 'koa-router';
import * as bodyParser from 'koa-bodyparser';
import * as sqlite from 'sqlite3';
import * as cors from '@koa/cors';

const db = new sqlite.Database('db.db');
db.run("CREATE TABLE IF NOT EXISTS blobs (blob TEXT)");

function logBlob(blobString: string) {
  return new Promise((res, rej) => {
    var stmt = db.prepare("INSERT INTO blobs (blob) VALUES (?)");
    stmt.run(blobString);
    stmt.finalize(() => res());
  });
}

const app = new koa();
const router = new koaRouter();

router.get('/', (ctx, next) => {
  ctx.body = "hi";
});

router.post('/blobs', async (ctx, next) => {
  await logBlob(ctx.request.rawBody);
  ctx.body = "thanks";
});

app.use(cors());
app.use(bodyParser());
app.use(router.routes());
app.use(router.allowedMethods);

app.listen(3001);