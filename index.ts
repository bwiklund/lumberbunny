import * as koa from 'koa';
import * as koaRouter from 'koa-router';
import * as bodyParser from 'koa-bodyparser';
import * as sqlite from 'sqlite3';

const db = new sqlite.Database('db.db');
db.run("CREATE TABLE IF NOT EXISTS blobs (blob TEXT)");

function logBlob(blobString: string) {
  var stmt = db.prepare("INSERT INTO blobs (blob) VALUES (?)");
  stmt.run(blobString);
  stmt.finalize();
}

const app = new koa();
const router = new koaRouter();

router.get('/', (ctx, next) => {
  ctx.body = "hi";
});

router.post('/blobs', (ctx, next) => {
  logBlob(ctx.request.rawBody); // don't even wait for response... but we should probably
  ctx.body = "thanks";
});

app.use(bodyParser());
app.use(router.routes());
app.use(router.allowedMethods);

app.listen(3001);