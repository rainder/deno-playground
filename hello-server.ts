import { serve } from 'https://deno.land/std@0.137.0/http/server.ts';

await serve(async (req, connInfo) => {
  // req.respond({ body: "Hello World\n" });
  return new Response('Hello World\n');
}, {
  port: 8080,
});
