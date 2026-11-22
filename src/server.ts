import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';
import { describeMissingDeployedHost, resolveAllowedHosts } from './server-hosts';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();

/**
 * `allowedHosts` es obligatorio: `@angular/ssr` 21 valida la cabecera `host` y, con la
 * lista vacía, no acepta ningún host y degrada a renderizado en cliente devolviendo 200.
 * Pasar la opción al constructor sustituye la lectura de `NG_ALLOWED_HOSTS` que hace el
 * framework, así que la unión con esa variable la hace `resolveAllowedHosts`.
 */
const angularApp = new AngularNodeAppEngine({
  allowedHosts: resolveAllowedHosts(process.env),
});

/**
 * Example Express Rest API endpoints can be defined here.
 * Uncomment and define endpoints as necessary.
 *
 * Example:
 * ```ts
 * app.get('/api/{*splat}', (req, res) => {
 *   // Handle API request
 * });
 * ```
 */

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);

    const missingHostWarning = describeMissingDeployedHost(process.env);
    if (missingHostWarning) {
      console.warn(missingHostWarning);
    }
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
