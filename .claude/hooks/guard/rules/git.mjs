// Git is read-only in this repo until the user lifts it (docs/PLAN.md, Phase 0).

const READ_ONLY_SUBCOMMANDS = new Set([
  'status', 'log', 'diff', 'show', 'blame', 'ls-files', 'ls-tree', 'rev-parse',
  'describe', 'shortlog', 'grep', 'cat-file', 'help', 'version',
]);
const GLOBAL_OPTIONS_WITH_VALUE = new Set(['-C', '-c', '--git-dir', '--work-tree', '--namespace']);
const INFO_OPTIONS = new Set(['--version', '-v', '--help', '-h']);

const LISTING_VALUE_OPTIONS = new Set(['--contains', '--no-contains', '--merged', '--no-merged', '--points-at', '--sort', '--format']);
const BRANCH_LISTING = {
  flags: new Set([
    '-a', '--all', '-r', '--remotes', '-v', '-vv', '--verbose', '-l', '--list', '--show-current',
    '-i', '--ignore-case', '--color', '--no-color', '--column', '--no-column', '--abbrev', '--no-abbrev',
    '-q', '--quiet', '--omit-empty',
  ]),
  shortFlags: /^-[arvliq]+$/,
};
const TAG_LISTING = {
  flags: new Set(['-l', '--list', '-i', '--ignore-case', '--color', '--no-color', '--column', '--no-column', '--omit-empty']),
  shortFlags: /^-(l|i|n\d*)+$/,
};
const REMOTE_READ_SUBCOMMANDS = new Set(['show', 'get-url']);
const CONFIG_READ_FLAGS = new Set(['--get', '--get-all', '--get-regexp', '--get-urlmatch', '--get-color', '--get-colorbool', '--list', '-l']);
const CONFIG_WRITE_FLAGS = new Set(['--add', '--unset', '--unset-all', '--replace-all', '--rename-section', '--remove-section', '--edit', '-e']);
const CONFIG_READ_SUBCOMMANDS = new Set(['get', 'list']);
const CONFIG_WRITE_SUBCOMMANDS = new Set(['set', 'unset', 'rename-section', 'remove-section', 'edit']);
const CONFIG_VALUE_OPTIONS = new Set(['--file', '-f', '--blob', '--type', '--default']);

// A Map, so subcommand names can't hit Object.prototype keys such as "constructor".
const CONDITIONAL_SUBCOMMANDS = new Map([
  ['branch', (args) => isListing(args, BRANCH_LISTING)],
  ['tag', (args) => isListing(args, TAG_LISTING)],
  ['remote', isRemoteListing],
  ['config', isConfigRead],
]);

export function checkGit({ name, args }) {
  if (name !== 'git') return null;
  const { info, subcommand, rest } = splitGlobalOptions(args);
  if (info || subcommand === undefined || READ_ONLY_SUBCOMMANDS.has(subcommand)) return null;
  const isReadOnlyForm = CONDITIONAL_SUBCOMMANDS.get(subcommand);
  if (isReadOnlyForm?.(rest)) return null;
  const form = isReadOnlyForm ? ' in this form' : '';
  return `git ${subcommand}${form} is not on the read-only git allowlist (git is read-only in this repo)`;
}

function splitGlobalOptions(args) {
  let index = 0;
  while (index < args.length && args[index].startsWith('-')) {
    if (INFO_OPTIONS.has(args[index])) return { info: true };
    index += GLOBAL_OPTIONS_WITH_VALUE.has(args[index]) ? 2 : 1;
  }
  return { info: false, subcommand: args[index], rest: args.slice(index + 1) };
}

// Listing forms only: positional arguments are allowed solely as -l/--list patterns.
function isListing(args, { flags, shortFlags }) {
  let listMode = false;
  let hasPositional = false;
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    const optionName = arg.split('=')[0];
    if (!arg.startsWith('-')) {
      hasPositional = true;
    } else if (LISTING_VALUE_OPTIONS.has(optionName)) {
      if (!arg.includes('=')) index += 1;
    } else if (flags.has(optionName)) {
      listMode ||= optionName === '-l' || optionName === '--list';
    } else if (shortFlags.test(arg)) {
      listMode ||= arg.includes('l');
    } else {
      return false;
    }
  }
  return !hasPositional || listMode;
}

function isRemoteListing(args) {
  const positionals = args.filter((arg) => !arg.startsWith('-'));
  if (positionals.length > 0) return REMOTE_READ_SUBCOMMANDS.has(positionals[0]);
  return args.every((flag) => flag === '-v' || flag === '--verbose');
}

function isConfigRead(args) {
  const names = args.map((arg) => arg.split('=')[0]);
  if (names.some((optionName) => CONFIG_WRITE_FLAGS.has(optionName))) return false;
  const subcommand = firstPositional(args, CONFIG_VALUE_OPTIONS);
  if (CONFIG_WRITE_SUBCOMMANDS.has(subcommand)) return false;
  return CONFIG_READ_SUBCOMMANDS.has(subcommand) || names.some((optionName) => CONFIG_READ_FLAGS.has(optionName));
}

function firstPositional(args, valueOptions) {
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (!arg.startsWith('-')) return arg;
    if (valueOptions.has(arg)) index += 1;
  }
  return undefined;
}
