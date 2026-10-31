// Test-only adapter: PGlite has one backend session, so multiplexing PostgreSQL
// extended-protocol Parse/Bind messages across sockets corrupts statement state.
// Share a single connection within the local app; never load this in production.
// Node --require preloads execute as CommonJS.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pg = require('pg');
const Pool = pg.Pool;
let shared;
pg.Pool = class LocalFixturePool {
  constructor(options) {
    if (!String(options?.connectionString).includes('127.0.0.1:55432/')) throw new Error('PGlite adapter requires the disposable localhost database');
    shared ||= new Pool({...options, max: 1});
    return new Proxy(shared, {get(target, key) {
      if (key === 'end') return async () => {};
      const value = target[key];
      return typeof value === 'function' ? value.bind(target) : value;
    }});
  }
};
