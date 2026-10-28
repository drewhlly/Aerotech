import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

 test('Aerotech has a Next.js application', () => {
  const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
  assert.ok(pkg.dependencies?.next, 'Next.js must be installed');
});
