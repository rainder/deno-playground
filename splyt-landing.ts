import { join } from 'https://deno.land/std@0.131.0/path/mod.ts';
import { serve } from 'https://deno.land/std@0.137.0/http/server.ts';

console.log('v3');

const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Splyt</title>

    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-beta/css/bootstrap.min.css" integrity="sha384-/Y6pD6FV/Vv2HJnA6t+vslU6fwYXjCFtcEpHbNJ0lyAFsXTsjBbfaDjzALeQsN6M" crossorigin="anonymous">

    <style>
    html, body {
        height: 100%;
    }
    </style>
</head>
<body class="d-flex justify-content-center align-items-center">

    <div class="text-center">
        <h1>
            <img src="data:image/png;base64,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">
        </h1>

    </div>

</body>
</html>
`;

const info = await Promise.all([
  queryMetadataServer('ClusterName'),
  queryMetadataServer('ClusterLocation'),
  queryMetadataServer('Zone').then((r) => r?.split('/').pop() ?? null),
]);

console.log(...info);

const text = `Splyt Technologies Ltd.\n`;
const [clusterName, clusterLocation, zone] = info;


const headers = new Headers();

Object.entries({
  'x-cluster-name': clusterName,
  'x-cluster-location': clusterLocation,
  'x-cluster-zone': zone,
  'Strict-Transport-Security' :'max-age=63072000; includeSubDomains; preload',
}).filter(([, v]) => !!v).forEach(([k, v]) => {
  v && headers.set(k, v);
});

await serve(async (req) => {

  if (req.headers.get('accept')?.match(/text\/html/)) {
    const newHeaders = new Headers(headers);
    newHeaders.set('content-type', 'text/html');

    return new Response(html, {
      status: 404,
      headers: newHeaders,
    });
  }

  return new Response(text, {
    status: 404,
    headers,
  });
}, { port: 8080, hostname: '0.0.0.0' });

/*
curl -H "Metadata-Flavor: Google" http://metadata.google.internal/computeMetadata/v1/instance/zone
 */

async function queryMetadataServer(data: 'ClusterLocation' | 'ClusterName' | 'Zone'): Promise<string | null> {
  const path = ({
    'ClusterLocation': '/computeMetadata/v1/instance/attributes/cluster-location',
    'ClusterName': '/computeMetadata/v1/instance/attributes/cluster-name',
    'Zone': '/computeMetadata/v1/instance/zone'
  })[data];

  const url = join('http://metadata.google.internal', path);
  const r = await fetch(url, {
    headers: {
      'Metadata-Flavor': 'Google',
    },
  }).catch(() => null);

  if (!r || !r.ok) {
    return null;
  }

  const body = await r.text();

  return body || null;
}
