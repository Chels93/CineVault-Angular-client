import { APP_BASE_HREF } from '@angular/common';
import { ngExpressEngine } from '@nguniversal/express-engine';
import express from 'express';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import AppServerModule from './src/main.server';

/**
 * Initializes and configures the Express server for Angular Universal Server-Side Rendering (SSR).
 *
 * The function sets up a server to handle Angular SSR by using ngExpressEngine as the view engine,
 * and serves static files from the Angular build output.
 *
 * @returns {express.Express} The configured Express server instance.
 */
export function app(): express.Express {
  const server = express();
  const serverDistFolder = dirname(fileURLToPath(import.meta.url));
  const browserDistFolder = resolve(serverDistFolder, '../browser');
  const indexHtml = join(serverDistFolder, 'index.server.html');

  server.engine(
    'html',
    ngExpressEngine({
      bootstrap: AppServerModule,
    }),
  );

  server.set('view engine', 'html');

  server.set('views', browserDistFolder);

  server.get(
    '**',
    express.static(browserDistFolder, {
      maxAge: '1y', // Cache static assets for a year
      index: 'index.html', // Use index.html as the default page
    }),
  );

  server.get('**', (req, res, next) => {
    const { protocol, originalUrl, baseUrl, headers } = req;
    ngExpressEngine({
      bootstrap: AppServerModule,
    })(
      indexHtml,
      {
        url: `${protocol}://${headers.host}${originalUrl}`,
        providers: [{ provide: APP_BASE_HREF, useValue: baseUrl }],
      },
      (err, html) => {
        if (err) {
          return next(err);
        }
        res.send(html);
      },
    );
  });

  return server;
}

/**
 * Starts the Express server and listens on a specified port.
 *
 * The function reads the port from environment variables, defaulting to port 4000,
 * and logs a message when the server starts successfully.
 */
function run(): void {
  const port = process.env['PORT'] || 4000;

  // Start the Express server
  const server = app();
  server.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

run();