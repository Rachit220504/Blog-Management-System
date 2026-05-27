#!/usr/bin/env node
/**
 * Lightweight smoke tests for the Blog Management System API
 * - Tests public endpoints only (no credentials required)
 * - Exits with code 0 on success, non-zero on failure
 * Usage: node run-smoke-tests.js
 */

const API_BASE = process.env.API_BASE || 'http://localhost:5000/api/v1';

const endpoints = [
  { method: 'GET', path: '/' },
  { method: 'GET', path: '/posts' },
  { method: 'GET', path: '/posts/tags' },
  { method: 'GET', path: '/posts/categories' },
  { method: 'GET', path: '/posts/search?q=test' },
];

const timeoutFetch = (url, opts = {}, timeout = 5000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  return fetch(url, { ...opts, signal: controller.signal }).finally(() => clearTimeout(id));
};

async function run() {
  console.log(`Running smoke tests against ${API_BASE}`);
  let failures = 0;

  for (const ep of endpoints) {
    try {
      process.stdout.write(`-> ${ep.method} ${ep.path} ... `);
      const res = await timeoutFetch(`${API_BASE}${ep.path}`, { method: ep.method }, 5000);

      if (!res) {
        console.log('FAILED (no response)');
        failures += 1;
        continue;
      }

      if (res.status < 200 || res.status >= 300) {
        console.log(`FAILED (status ${res.status})`);
        failures += 1;
        continue;
      }

      let json = null;
      try {
        json = await res.json().catch(() => null);
      } catch (e) {
        json = null;
      }

      if (json && (Object.prototype.hasOwnProperty.call(json, 'success') || Object.prototype.hasOwnProperty.call(json, 'data') || Object.prototype.hasOwnProperty.call(json, 'message'))) {
        console.log('OK');
      } else {
        console.log('WARN (unexpected response structure)');
      }
    } catch (err) {
      failures += 1;
      if (err.name === 'AbortError') {
        console.log('FAILED (timeout)');
      } else {
        console.log('FAILED (' + (err.message || 'error') + ')');
      }
    }
  }

  if (failures > 0) {
    console.error(`Smoke tests completed: ${failures} failure(s)`);
    process.exit(2);
  }

  console.log('Smoke tests completed: all checks passed');
  process.exit(0);
}

run();
