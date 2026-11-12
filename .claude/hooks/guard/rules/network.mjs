// Remote code piped into a shell, and commands that publish or reach other machines.

const DOWNLOADERS = new Set(['curl', 'wget', 'iwr', 'irm', 'invoke-webrequest', 'invoke-restmethod']);
const EXPRESSION_RUNNERS = new Set(['iex', 'invoke-expression']);
const STDIN_RUNNERS = new Set(['sh', 'bash', 'zsh', 'dash', 'ksh', 'fish', 'pwsh', 'powershell', 'python', 'python3', 'node', 'perl', 'ruby']);
const DOWNLOAD_PATTERN = /\b(curl|wget|iwr|irm|invoke-webrequest|invoke-restmethod)\b|downloadstring|downloadfile/i;

const PACKAGE_MANAGERS = new Set(['npm', 'pnpm', 'yarn', 'bun']);
const PUBLISH_SUBCOMMANDS = new Set(['publish', 'unpublish', 'deprecate']);
const REMOTE_SHELLS = new Set(['ssh', 'sftp', 'ssh-copy-id']);
const COPY_TOOLS = new Set(['scp', 'rsync']);
// user@host:path or host:path, but not a Windows drive such as C:\ or D:/.
const REMOTE_SPEC = /^(?:[^\s@/\\:]+@)?[^\s/\\:]{2,}:/;

const GH_VALUE_FLAGS = new Set(['-R', '--repo', '--hostname']);
const GH_READ_ONLY_COMMANDS = new Set(['status', 'search', 'browse', 'version', 'help', 'completion']);
const GH_READ_ONLY_VERBS = new Set(['view', 'list', 'ls', 'status', 'diff', 'checks', 'watch', 'download']);
const GH_FIELD_FLAGS = new Set(['-f', '-F', '--field', '--raw-field', '--input']);

export function isDownloader(name) {
  return DOWNLOADERS.has(name);
}

export function checkRemoteCode({ name, args, nested, afterDownload }) {
  const runsExpressions = EXPRESSION_RUNNERS.has(name);
  if (!runsExpressions && !STDIN_RUNNERS.has(name)) return null;
  if (afterDownload && (runsExpressions || readsProgramFromStdin(args))) {
    return `piping downloaded content into ${name} runs remote code`;
  }
  if (nested.some((script) => DOWNLOAD_PATTERN.test(script))) {
    return `${name} would run code downloaded by a nested command`;
  }
  return null;
}

// "bash", "python3 -" or "powershell -Command -" read their program from stdin;
// "node -e '...'" or "python script.py" only read data.
function readsProgramFromStdin(args) {
  return args.filter((arg) => !arg.startsWith('-') || arg === '-').every((arg) => arg === '-');
}

export function checkOutward({ name, args }) {
  if (PACKAGE_MANAGERS.has(name)) {
    const subcommand = args.find((arg) => PUBLISH_SUBCOMMANDS.has(arg));
    if (subcommand) return `${name} ${subcommand} changes the public package registry`;
  }
  if ((name === 'docker' || name === 'docker-compose') && args.some((arg) => arg === 'push' || arg === '--push')) {
    return 'docker push uploads images to a registry';
  }
  if (name === 'gh') return checkGh(args);
  if (REMOTE_SHELLS.has(name)) return `${name} connects to a remote machine`;
  if (COPY_TOOLS.has(name) && args.some((arg) => REMOTE_SPEC.test(arg) || arg.startsWith('rsync://'))) {
    return `${name} to a remote host copies data off this machine`;
  }
  return null;
}

function checkGh(args) {
  const [group, verb] = positionals(args, GH_VALUE_FLAGS);
  if (group === undefined || GH_READ_ONLY_COMMANDS.has(group)) return null;
  if (group === 'api') return isReadOnlyApiCall(args) ? null : 'gh api with a write method or fields changes GitHub data';
  if (group === 'auth' && verb === 'status') return null;
  if (verb !== undefined && GH_READ_ONLY_VERBS.has(verb)) return null;
  return `gh ${[group, verb].filter(Boolean).join(' ')} is not a read-only gh command`;
}

function positionals(args, valueFlags) {
  const found = [];
  for (let index = 0; index < args.length; index += 1) {
    if (valueFlags.has(args[index])) index += 1;
    else if (!args[index].startsWith('-')) found.push(args[index]);
  }
  return found;
}

function isReadOnlyApiCall(args) {
  let method = 'GET';
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (GH_FIELD_FLAGS.has(arg.split('=')[0])) return false;
    if (arg === '-X' || arg === '--method') method = args[index + 1] ?? method;
    else if (arg.startsWith('--method=')) method = arg.slice('--method='.length);
    else if (/^-X./.test(arg)) method = arg.slice(2);
  }
  return method.toUpperCase() === 'GET';
}
