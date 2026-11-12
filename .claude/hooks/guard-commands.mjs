#!/usr/bin/env node
// PreToolUse hook for Bash and PowerShell (wired in .claude/settings.json).
// Reads the hook input from stdin; exit 0 lets the command run, exit 2 blocks
// it and shows stderr to Claude. Any internal error also blocks (fail closed),
// including a guard module that fails to load, hence the dynamic import.
import { readFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const BLOCK_EXIT_CODE = 2;
const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

function block(message) {
  process.stderr.write(
    `Blocked by the project command guard (.claude/hooks/guard-commands.mjs): ${message}.\n` +
      'If this command is really wanted, ask the user to run it themselves with the ! prefix.\n',
  );
  process.exit(BLOCK_EXIT_CODE);
}

async function main() {
  const { evaluateCommand } = await import('./guard/evaluate.mjs');
  let input;
  try {
    input = JSON.parse(readFileSync(0, 'utf8'));
  } catch (error) {
    block(`could not read the hook input (${error.message})`);
  }
  const command = input?.tool_input?.command;
  if (typeof command !== 'string') return;

  const verdict = evaluateCommand(command, {
    shell: input.tool_name === 'PowerShell' ? 'powershell' : 'bash',
    cwd: typeof input.cwd === 'string' ? input.cwd : process.cwd(),
    projectRoot,
    homeDir: os.homedir(),
    platform: process.platform,
  });
  if (!verdict.allowed) block(verdict.reason);
}

try {
  await main();
} catch (error) {
  block(`the guard itself failed (${error.message})`);
}
