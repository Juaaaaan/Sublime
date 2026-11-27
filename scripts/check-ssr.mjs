#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';

/**
 * Test de integración del render en servidor.
 *
 * Por qué existe: el fallo que originó este change devolvía **200 en las 5 rutas** mientras
 * servía el cascarón de cliente (`index.csr.html`, ~15 KB) en lugar del prerender (28-41 KB).
 * Un test de humo sobre el código de estado habría pasado todo el tiempo que el servidor
 * estuvo roto. Lo que distingue un render de servidor de un cascarón es el **cuerpo**.
 *
 * Por qué es un script de Node y no un spec de Karma: los specs corren en navegador y no
 * pueden arrancar un proceso ni leer `dist/`. Mismo patrón que `lint:tokens`.
 *
 * Puerto propio y alto a propósito: el 4000 lo puede tener ocupado un `serve:ssr` levantado.
 */

const PORT = 47317;
const SERVER_ENTRY = 'dist/Sublime/server/server.mjs';
const CSR_SHELL = 'dist/Sublime/browser/index.csr.html';
const STARTUP_TIMEOUT_MS = 20_000;

/** Rutas comprobadas, con un texto propio de cada página que solo aparece si hubo render. */
const ROUTES = [
  { path: '/', markers: ['Intención hecha a mano', 'The Celestial Shore'] },
  { path: '/contacto', markers: ["Let's connect", 'Escríbenos por WhatsApp'] },
];

const failures = [];
const fail = (message) => failures.push(message);

if (!existsSync(SERVER_ENTRY) || !existsSync(CSR_SHELL)) {
  console.error(
    `✗ Falta el artefacto construido (${SERVER_ENTRY} o ${CSR_SHELL}).\n` +
      '  Este test necesita el build: ejecuta `npm run build` antes de `npm run test:ssr`.',
  );
  process.exit(1);
}

const csrShell = readFileSync(CSR_SHELL, 'utf8');

const server = spawn(process.execPath, [SERVER_ENTRY], {
  env: { ...process.env, PORT: String(PORT) },
  stdio: ['ignore', 'pipe', 'pipe'],
});

let serverOutput = '';
server.stdout.on('data', (chunk) => (serverOutput += chunk));
server.stderr.on('data', (chunk) => (serverOutput += chunk));

const stopServer = () => {
  if (!server.killed) {
    server.kill('SIGKILL');
  }
};
process.on('exit', stopServer);

/** Espera a que el puerto responda, en lugar de dormir una cantidad fija de tiempo. */
async function waitForServer() {
  const deadline = Date.now() + STARTUP_TIMEOUT_MS;
  while (Date.now() < deadline) {
    if (server.exitCode !== null) {
      throw new Error(`el servidor terminó con código ${server.exitCode}.\n${serverOutput}`);
    }
    try {
      await fetch(`http://localhost:${PORT}/`);
      return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
  }
  throw new Error(`el servidor no respondió en ${STARTUP_TIMEOUT_MS} ms.\n${serverOutput}`);
}

try {
  await waitForServer();

  for (const { path, markers } of ROUTES) {
    const response = await fetch(`http://localhost:${PORT}${path}`);
    const body = await response.text();

    if (response.status !== 200) {
      fail(`${path}: se esperaba 200 y se recibió ${response.status}.`);
    }

    if (body.trim() === csrShell.trim()) {
      fail(
        `${path}: el cuerpo es idéntico al cascarón de cliente (${body.length} bytes). ` +
          'El servidor degradó a renderizado en cliente.',
      );
    }

    for (const marker of markers) {
      if (!body.includes(marker)) {
        fail(`${path}: el cuerpo (${body.length} bytes) no contiene «${marker}».`);
      }
    }

    if (failures.length === 0) {
      console.log(`✓ ${path} — ${body.length} bytes renderizados en servidor`);
    }
  }

  if (serverOutput.includes('Falling back to client side rendering')) {
    fail('el servidor registró «Falling back to client side rendering» en su salida.');
  }
} catch (error) {
  fail(error instanceof Error ? error.message : String(error));
} finally {
  stopServer();
}

if (failures.length > 0) {
  console.error('\n✗ El servidor no está renderizando en servidor:');
  for (const failure of failures) {
    console.error(`  - ${failure}`);
  }
  console.error(
    '\n  Revisa `allowedHosts` en src/server.ts: @angular/ssr valida la cabecera `host` y,\n' +
      '  con la lista vacía, responde 200 con el documento de arranque en cliente.',
  );
  if (serverOutput.trim()) {
    console.error(`\n  Salida del servidor:\n${serverOutput.trim()}`);
  }
  process.exit(1);
}

console.log('\n✓ Render en servidor confirmado en todas las rutas comprobadas.');
process.exit(0);
