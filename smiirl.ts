import {
  Application,
  Middleware,
  Router,
} from 'https://deno.land/x/oak@v10.5.1/mod.ts';

const app = new Application();
const router = new Router();
const host = Deno.env.get('host');

const memory: {
  total: number;
  today: number;
} = {
  total: 0,
  today: 0,
};

router
  .get('/api/today', respond(() => memory.today))
  .get('/api/total', respond(() => memory.total));

app.use(router.routes());

app.listen({ port: 3080, hostname: '0.0.0.0' });

(async function refresh(): Promise<void> {
  while (true) {
    await Promise.all([
      getTotalNumber().then((r) => memory.total = r),
      getTodayNumber().then((r) => memory.today = r),
    ]).catch((e) => {
      console.error(e);
    });

    await new Promise((resolve) => {
      setTimeout(resolve, 1000);
    });
  }
})();

/**
 *
 * @param path
 */
async function client<T>(path: string): Promise<T> {
  return fetch(`https://${host}${ path }`, {})
    .then((r) => r.json());
}

/**
 *
 * @returns {Promise<number>}
 */
async function getTotalNumber(): Promise<number> {
  return client<{
    count: number;
  }>('/total-bookings').then((r) => r.count);
}

/**
 *
 * @returns {Promise<number>}
 */
async function getTodayNumber(): Promise<number> {
  return client<{
    count: number;
  }>('/bookings-today').then((r) => r.count);
}

/**
 *
 * @param {() => number} fn
 * @returns {Application.Middleware}
 */
function respond(fn: () => number): Middleware {
  return async (ctx: any) => {
    ctx.response.body = { number: fn() };
  };
}

console.log('Ready');
