import * as koa from 'koa';
import * as koaRouter from 'koa-router';
import * as sqlite from 'sqlite3';

const app = new koa();

app.use(async (ctx, next) => {
  ctx.body = "hi";
})

app.listen(3001);