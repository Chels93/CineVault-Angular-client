import { APP_BASE_HREF } from '@angular/common'; // Import for base URL in Angular routing
import { ngExpressEngine } from '@nguniversal/express-engine'; // Engine for server-side rendering with Angular Universal
import express from 'express'; // Express.js framework for creating the server
import { fileURLToPath } from 'node:url'; // Utility to handle file URLs in Node.js
import { dirname, join, resolve } from 'node:path'; // Path utilities for resolving file paths

// Import the main Angular server module, which bootstraps the server-side rendering
import AppServerModule from './src/main.server'; // The Angular module that is used for SSR (Server-Side Rendering)

// The Express app function is exported so it can be used by serverless functions (like AWS Lambda)
export function app(): express.Express {
  // Initialize an Express server
  const server = express();

  // Resolve the path for the current server-side directory and the browser distribution folder
  const serverDistFolder = dirname(fileURLToPath(import.meta.url)); // Get the directory of the current server file
  const browserDistFolder = resolve(serverDistFolder, '../browser'); // Path to the Angular build output (browser dist)
  const indexHtml = join(serverDistFolder, 'index.server.html'); // Path to the server-side HTML template for Angular

  // Set up ngExpressEngine as the view engine for rendering Angular templates
  server.engine(
    'html',
    ngExpressEngine({
      bootstrap: AppServerModule, // Specify the Angular module for SSR rendering
    })
  );

  // Set the view engine to HTML and configure the location of views (browser dist folder)
  server.set('view engine', 'html');
  server.set('views', browserDistFolder);

  // Serve static files (like images, CSS, JS) from the browser dist folder
  server.get(
    '**',
    express.static(browserDistFolder, {
      maxAge: '1y', // Cache static assets for a year
      index: 'index.html', // Use index.html as the default page
    })
  );

  // Define the route for handling all other requests and rendering the Angular app
  server.get('**', (req, res, next) => {
    const { protocol, originalUrl, baseUrl, headers } = req; // Extract request details

    // Use ngExpressEngine to render the Angular application for the current route
    ngExpressEngine({
      bootstrap: AppServerModule, // Same Angular server module for SSR
    })(
      indexHtml,
      {
        // Provide the full URL for Angular routing
        url: `${protocol}://${headers.host}${originalUrl}`,
        providers: [{ provide: APP_BASE_HREF, useValue: baseUrl }], // Set the base href for routing in Angular
      },
      (err, html) => {
        if (err) {
          return next(err); // If an error occurs, pass it to the next middleware
        }
        res.send(html); // Send the rendered HTML back to the client
      }
    );
  });

  return server; // Return the configured server instance
}

// Function to start the server and listen on a specified port
function run(): void {
  const port = process.env['PORT'] || 4000; // Get the port from environment variables, default to 4000

  // Start the Express server
  const server = app();
  server.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`); // Log the server startup message
  });
}

// Run the server
run();
