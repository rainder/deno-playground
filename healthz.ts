import { Application, Router } from 'https://deno.land/x/oak/mod.ts';


const app = new Application();
const router = new Router();

const state = {
  hostname: Deno.hostname(),
  ready: false,
  live: true,
};

const SHUTDOWN_DELAY = Number(Deno.env.get('SHUTDOWN_DELAY') ?? '30000');

console.log(`SHUTDOWN_DELAY ${ SHUTDOWN_DELAY }`);

Deno.signals.terminate().then(() => {
  console.log('got term signal');
  state.ready = false;
  setTimeout(() => {
    Deno.exit(0);
  }, SHUTDOWN_DELAY);
});

setTimeout(() => {
  state.ready = true;
  console.log('now ready');
}, 10000);

router.get('/healthy', (ctx) => {
  ctx.response.status = state.ready ? 200 : 503;
});

router.get('/healthz', (ctx) => {
  ctx.response.status = state.live ? 200 : 503;
});

router.get('/toggle/ready', (ctx) => {
  state.ready = !state.ready;
  ctx.response.body = `now set to ${ state.ready }`;
});

router.get('/toggle/live', (ctx) => {
  state.live = !state.live;
  ctx.response.body = `now set to ${ state.live }`;
});

router.get('/', (ctx) => {
  ctx.response.body = `${ new Date().toISOString() } ${ state.hostname }`;
});


// Logger
app.use(async (ctx, next) => {
  await next();
  const rt = ctx.response.headers.get('X-Response-Time');
  console.log(`${ ctx.request.method } ${ ctx.request.url } - ${ rt }`);
});

// Timing
app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  ctx.response.headers.set('X-Response-Time', `${ ms }ms`);
});

app.use(router.routes());
app.use(router.allowedMethods());

await app.listen({ port: 8080 });
