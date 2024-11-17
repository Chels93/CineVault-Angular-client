import { APP_BASE_HREF } from '@angular/common';
import { ngExpressEngine } from '@nguniversal/express-engine'; // Corrected import
import express from 'express';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

// Corrected import for AppServerModule
import AppServerModule from './src/main.server'; // Assuming the main Angular server module is here

// The Express app is exported so that it can be used by serverless Functions.
export function app(): express.Express {
  const server = express();
  const serverDistFolder = dirname(fileURLToPath(import.meta.url));
  const browserDistFolder = resolve(serverDistFolder, '../browser');
  const indexHtml = join(serverDistFolder, 'index.server.html');

  // Set up ngExpressEngine
  server.engine('html', ngExpressEngine({
    bootstrap: AppServerModule, // Specify the Angular module for the server-side rendering
  }));

  server.set('view engine', 'html');
  server.set('views', browserDistFolder);

  // Serve static files from /browser
  server.get('**', express.static(browserDistFolder, {
    maxAge: '1y',
    index: 'index.html',
  }));

  // All regular routes use the Angular engine
  server.get('**', (req, res, next) => {
    const { protocol, originalUrl, baseUrl, headers } = req;

    // Use ngExpressEngine to render the Angular app
    ngExpressEngine({
      bootstrap: AppServerModule, // Same bootstrap module as above
    })(indexHtml, {
      url: `${protocol}://${headers.host}${originalUrl}`,
      providers: [{ provide: APP_BASE_HREF, useValue: baseUrl }],
    }, (err, html) => {
      if (err) {
        return next(err);
      }
      res.send(html);
    });
  });

  return server;
}

function run(): void {
  const port = process.env['PORT'] || 4000;

  // Start up the Node server
  const server = app();
  server.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

run();
