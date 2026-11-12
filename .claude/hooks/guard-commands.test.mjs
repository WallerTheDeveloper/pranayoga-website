import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { copyFileSync, mkdtempSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const script = fileURLToPath(new URL('./guard-commands.mjs', import.meta.url));
const projectRoot = path.resolve(fileURLToPath(new URL('../..', import.meta.url)));

function runHook(payload) {
  const input = typeof payload === 'string' ? payload : JSON.stringify(payload);
  return spawnSync(process.execPath, [script], { input, encoding: 'utf8' });
}

test('exits 0 for an allowed command', () => {
  const result = runHook({ tool_name: 'Bash', tool_input: { command: 'git status' }, cwd: projectRoot });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stderr, '');
});

test('exits 2 and explains why a command is blocked', () => {
  const result = runHook({ tool_name: 'Bash', tool_input: { command: 'git commit -m x' }, cwd: projectRoot });
  assert.equal(result.status, 2);
  assert.match(result.stderr, /git commit/);
  assert.match(result.stderr, /guard/);
});

test('reads PowerShell syntax for the PowerShell tool', () => {
  const result = runHook({
    tool_name: 'PowerShell',
    tool_input: { command: 'Remove-Item ..\\other -Recurse -Force' },
    cwd: projectRoot,
  });
  assert.equal(result.status, 2);
});

test('falls back to the process directory when cwd is missing', () => {
  const result = runHook({ tool_name: 'Bash', tool_input: { command: 'git log -1' } });
  assert.equal(result.status, 0, result.stderr);
});

test('allows tool calls without a command', () => {
  const result = runHook({ tool_name: 'Bash', tool_input: {} });
  assert.equal(result.status, 0, result.stderr);
});

test('fails closed when the guard modules cannot be loaded', () => {
  const folder = mkdtempSync(path.join(os.tmpdir(), 'guard-'));
  try {
    const copy = path.join(folder, 'guard-commands.mjs');
    copyFileSync(script, copy);
    const input = JSON.stringify({ tool_name: 'Bash', tool_input: { command: 'ls' } });
    const result = spawnSync(process.execPath, [copy], { input, encoding: 'utf8' });
    assert.equal(result.status, 2);
    assert.match(result.stderr, /guard/);
  } finally {
    rmSync(folder, { recursive: true, force: true });
  }
});

test('fails closed when the input is not valid JSON', () => {
  const result = runHook('not json');
  assert.equal(result.status, 2);
  assert.match(result.stderr, /guard/);
});
