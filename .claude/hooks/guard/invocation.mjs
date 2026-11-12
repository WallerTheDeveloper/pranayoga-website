// Turns a tokenized segment into the command that actually runs, looking past
// env assignments, shell keywords and wrappers such as sudo, env or xargs.
import { containerCommand } from './docker.mjs';
import { findExecCommands } from './find.mjs';

const ASSIGNMENT = /^[A-Za-z_][A-Za-z0-9_]*=/;
const SHELL_KEYWORDS = new Set(['if', 'then', 'else', 'elif', 'do', 'while', 'until', '!']);
const SIMPLE_WRAPPERS = new Set(['command', 'builtin', 'exec', 'nohup', 'time', '&']);
// Options of each wrapper that take a separate value.
const WRAPPER_VALUE_OPTIONS = new Map([
  ['sudo', ['-u', '-g', '-h', '-p', '-C', '-U', '-r', '-t', '-D']],
  ['doas', ['-u', '-C']],
  ['env', ['-u', '-C', '-S', '--unset', '--chdir']],
  ['nice', ['-n', '--adjustment']],
  ['timeout', ['-s', '-k', '--signal', '--kill-after']],
  ['xargs', ['-I', '-n', '-P', '-d', '-L', '-s', '-a', '-E', '--delimiter', '--max-args', '--max-procs', '--arg-file']],
  ['npx', ['-p', '--package', '-c', '--call']],
  ['bunx', ['-p', '--package']],
]);
// Package managers run a binary for "exec", "dlx", "x" and for any word that
// isn't one of their own subcommands ("pnpm rimraf dist").
const PACKAGE_MANAGER_VALUE_OPTIONS = new Map([
  ['npm', new Set(['-w', '--workspace', '--prefix', '-C'])],
  ['pnpm', new Set(['--filter', '-F', '--dir', '-C', '--reporter', '--loglevel'])],
  ['yarn', new Set(['--cwd'])],
  ['bun', new Set(['--cwd', '--filter', '-F'])],
]);
const DIRECTORY_OPTIONS = new Set(['--dir', '-C', '--prefix', '--cwd']);
const RUNNER_SUBCOMMANDS = new Set(['exec', 'dlx', 'x']);
const PACKAGE_MANAGER_SUBCOMMANDS = new Set([
  'install', 'i', 'ci', 'add', 'remove', 'rm', 'uninstall', 'un', 'update', 'up', 'upgrade', 'run', 'run-script',
  'test', 't', 'start', 'stop', 'restart', 'publish', 'unpublish', 'deprecate', 'pack', 'link', 'ln', 'unlink',
  'list', 'ls', 'll', 'la', 'outdated', 'audit', 'why', 'explain', 'init', 'create', 'store', 'config', 'get', 'set',
  'env', 'prune', 'dedupe', 'rebuild', 'rb', 'import', 'fetch', 'patch', 'patch-commit', 'deploy', 'setup', 'root',
  'bin', 'licenses', 'doctor', 'install-test', 'it', 'view', 'info', 'show', 'version', 'cache', 'whoami', 'login',
  'logout', 'adduser', 'owner', 'dist-tag', 'access', 'search', 'fund', 'help', 'query', 'approve-builds',
  'self-update', 'team', 'token', 'profile', 'org', 'hook', 'completion', 'docs', 'home', 'repo', 'bugs', 'edit',
  'explore', 'shrinkwrap', 'sbom', 'star', 'stars', 'unstar', 'pkg', 'diff', 'ping', 'prefix', 'workspace',
  'workspaces', 'plugin', 'constraints', 'npm', 'node',
]);
const SAFE_BASH_WORD = /^[\w@%+=:,./-]+$/;

const POSIX_SHELLS = new Set(['sh', 'bash', 'zsh', 'dash', 'ksh', 'fish']);
const POWERSHELLS = new Set(['powershell', 'pwsh']);
const EXPRESSION_RUNNERS = new Set(['iex', 'invoke-expression']);
const POWERSHELL_VALUE_PARAMETERS = new Set([
  '-executionpolicy', '-ep', '-ex', '-exec', '-windowstyle', '-w', '-workingdirectory', '-wd',
  '-outputformat', '-of', '-inputformat', '-if', '-version', '-v', '-configurationname',
  '-psconsolefile', '-settingsfile', '-custompipename',
]);

/** Lowercase executable name without directory or Windows extension. */
export function commandName(word = '') {
  const base = word.split(/[\\/]/).pop() ?? '';
  return base.toLowerCase().replace(/\.(exe|cmd|bat|com|ps1)$/, '');
}

/**
 * @param {{ words: string[], nested: string[], raw: string }} segment
 * @param {{ pipedInput: boolean, afterDownload: boolean }} flow
 */
export function resolveInvocation(segment, { pipedInput, afterDownload }) {
  const { words } = segment;
  let index = 0;
  let fromXargs = false;
  let directory;
  while (index < words.length) {
    const name = commandName(words[index]);
    const packageRun = PACKAGE_MANAGER_VALUE_OPTIONS.has(name) ? unwrapPackageManager(name, words, index) : null;
    if (ASSIGNMENT.test(words[index]) || SHELL_KEYWORDS.has(name)) {
      index += 1;
    } else if (SIMPLE_WRAPPERS.has(name) || WRAPPER_VALUE_OPTIONS.has(name)) {
      index = skipOptions(words, index + 1, WRAPPER_VALUE_OPTIONS.get(name) ?? []);
      if (name === 'timeout') index += 1;
      fromXargs ||= name === 'xargs';
    } else if (packageRun) {
      index = packageRun.index;
      directory = packageRun.directory ?? directory;
    } else {
      break;
    }
  }
  if (index >= words.length) return null;
  return {
    name: commandName(words[index]),
    args: words.slice(index + 1),
    words,
    nested: segment.nested,
    directory,
    pipedInput,
    afterDownload,
    fromXargs,
  };
}

// Returns where the binary run by the package manager starts, or null when the
// package manager runs one of its own subcommands (install, publish, ...).
function unwrapPackageManager(name, words, index) {
  const valueOptions = PACKAGE_MANAGER_VALUE_OPTIONS.get(name);
  let cursor = index + 1;
  let directory;
  while (cursor < words.length && words[cursor].startsWith('-') && words[cursor] !== '--') {
    const [option, inlineValue] = splitOption(words[cursor]);
    if (DIRECTORY_OPTIONS.has(option)) directory = inlineValue ?? words[cursor + 1];
    cursor += valueOptions.has(option) && inlineValue === undefined ? 2 : 1;
  }
  const subcommand = words[cursor];
  if (subcommand === undefined || PACKAGE_MANAGER_SUBCOMMANDS.has(subcommand)) return null;
  const start = RUNNER_SUBCOMMANDS.has(subcommand) ? skipOptions(words, cursor + 1, []) : cursor;
  return { index: start, directory };
}

function splitOption(word) {
  const separator = word.indexOf('=');
  return separator === -1 ? [word, undefined] : [word.slice(0, separator), word.slice(separator + 1)];
}

function skipOptions(words, start, valueOptions) {
  let index = start;
  while (index < words.length && words[index].startsWith('-') && words[index] !== '-') {
    index += valueOptions.includes(words[index]) ? 2 : 1;
  }
  return index;
}

/**
 * Scripts the command hands to another shell or runs for it: bash -c, powershell -Command,
 * cmd /c, eval, iex, docker exec/run, and find -exec.
 */
export function innerScripts({ name, args }) {
  if (name === 'find') return findExecCommands(args).map((words) => ({ script: joinForBash(words), shell: 'bash' }));
  const inContainer = containerCommand(name, args);
  if (inContainer.length > 0) return [{ script: joinForBash(inContainer), shell: 'bash' }];
  return shellScripts(name, args);
}

// Re-quotes words so the joined script tokenizes back into the same words.
function joinForBash(words) {
  return words.map((word) => (SAFE_BASH_WORD.test(word) ? word : `'${word.replaceAll("'", `'\\''`)}'`)).join(' ');
}

function shellScripts(name, args) {
  if (POSIX_SHELLS.has(name)) {
    const flagIndex = args.findIndex((arg) => /^-[a-z]*c[a-z]*$/i.test(arg));
    const script = flagIndex === -1 ? undefined : args[flagIndex + 1];
    return script === undefined ? [] : [{ script, shell: 'bash' }];
  }
  if (name === 'eval') return [{ script: args.join(' '), shell: 'bash' }];
  if (EXPRESSION_RUNNERS.has(name)) {
    const rest = isParameterPrefix(args[0], '-command', 2) ? args.slice(1) : args;
    return [{ script: rest.join(' '), shell: 'powershell' }];
  }
  if (POWERSHELLS.has(name)) return powershellScripts(args);
  if (name === 'cmd') {
    const flagIndex = args.findIndex((arg) => /^\/{1,2}[ck]$/i.test(arg));
    return flagIndex === -1 ? [] : [{ script: args.slice(flagIndex + 1).join(' '), shell: 'cmd' }];
  }
  return [];
}

function powershellScripts(args) {
  for (let index = 0; index < args.length; index += 1) {
    const lower = args[index].toLowerCase();
    if (isParameterPrefix(lower, '-command', 2)) return [{ script: args.slice(index + 1).join(' '), shell: 'powershell' }];
    if (isParameterPrefix(lower, '-file', 2)) return [];
    if (POWERSHELL_VALUE_PARAMETERS.has(lower)) index += 1;
    else if (!lower.startsWith('-')) return [{ script: args.slice(index).join(' '), shell: 'powershell' }];
  }
  return [];
}

function isParameterPrefix(arg, parameter, minimumLength) {
  if (arg === undefined) return false;
  const lower = arg.toLowerCase();
  return lower.length >= minimumLength && parameter.startsWith(lower);
}
