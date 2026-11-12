import path from 'node:path';

// Git Bash writes Windows drives as /d/...; convert them so paths compare correctly.
const GIT_BASH_DRIVE = /^\/([a-zA-Z])(?=\/|$)/;
const BARE_DRIVE = /^[a-zA-Z]:$/;
// Variables ($HOME, $env:TEMP, %TEMP%) and backticks can't be resolved statically.
const UNRESOLVABLE = /[$%`]/;
// PowerShell drives and providers (HKCU:\, Env:\, FileSystem::C:\) aren't plain paths.
const POWERSHELL_PROVIDER = /^[\w.]+::|^[A-Za-z]\w+:/;

const CHANGE_DIRECTORY = new Set(['cd', 'chdir', 'pushd', 'set-location', 'sl', 'push-location']);
const RESTORE_DIRECTORY = new Set(['popd', 'pop-location']);
const PATH_PARAMETERS = new Set(['-path', '-literalpath', '-lp']);

export function pathApi(platform) {
  return platform === 'win32' ? path.win32 : path.posix;
}

export function toNativePath(value, platform) {
  if (platform !== 'win32') return value;
  const converted = value.replace(GIT_BASH_DRIVE, (_, drive) => `${drive.toUpperCase()}:`);
  return BARE_DRIVE.test(converted) ? `${converted}\\` : converted;
}

/**
 * Resolves a command-line path to an absolute path, or null when it can't be known.
 * @param {string} target
 * @param {string | null} cwd
 * @param {{ platform: string, homeDir: string }} context
 */
export function resolvePath(target, cwd, { platform, homeDir }) {
  if (UNRESOLVABLE.test(target) || POWERSHELL_PROVIDER.test(target)) return null;
  const expanded = expandHome(target, homeDir);
  if (expanded === null) return null;
  const api = pathApi(platform);
  const native = toNativePath(expanded, platform);
  if (api.isAbsolute(native)) return api.resolve(native);
  return cwd === null ? null : api.resolve(cwd, native);
}

function expandHome(target, homeDir) {
  if (target === '~') return homeDir;
  if (target.startsWith('~/') || target.startsWith('~\\')) return homeDir + target.slice(1);
  return target.startsWith('~') ? null : target;
}

export function isInside(child, parent, platform) {
  const api = pathApi(platform);
  const relative = api.relative(parent, child);
  return relative !== '' && relative !== '..' && !relative.startsWith(`..${api.sep}`) && !api.isAbsolute(relative);
}

export function isSameOrInside(child, parent, platform) {
  return pathApi(platform).relative(parent, child) === '' || isInside(child, parent, platform);
}

/**
 * The working directory after a command runs: changed by cd and friends,
 * unknown (null) after popd or "cd -".
 */
export function nextWorkingDirectory(invocation, cwd, context) {
  if (RESTORE_DIRECTORY.has(invocation.name)) return null;
  if (!CHANGE_DIRECTORY.has(invocation.name)) return cwd;
  const target = directoryArgument(invocation.args, context.shell);
  if (target === undefined) return context.homeDir;
  if (target === '-') return null;
  return resolvePath(target, cwd, context);
}

function directoryArgument(args, shell) {
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (PATH_PARAMETERS.has(arg.toLowerCase())) return args[index + 1];
    if (shell === 'cmd' && /^\/d$/i.test(arg)) continue;
    if (arg === '-' || !arg.startsWith('-')) return arg;
  }
  return undefined;
}
