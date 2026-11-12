// Recursive deletes are allowed only for paths strictly inside the project,
// never the project root itself and never .git.
import { findExecCommands, findRoots } from '../find.mjs';
import { commandName } from '../invocation.mjs';
import { isInside, isSameOrInside, pathApi, resolvePath } from '../paths.mjs';

const DELETE_COMMANDS = new Set(['rm', 'remove-item', 'ri', 'del', 'erase', 'rd', 'rmdir', 'rimraf']);
const CMD_STYLE_COMMANDS = new Set(['del', 'erase', 'rd', 'rmdir']);
const CMD_SWITCH = /^\/[sqfpa](:\S*)?$/i;
const GNU_SHORT_FLAGS = /^-[fiIrRvd]+$/;
const GLOB = /[*?[]/;
const BRACE_LIST = /\{([^{}]*,[^{}]*)\}/;
const POWERSHELL_PATH_PARAMETERS = new Set(['path', 'literalpath', 'lp', 'pspath']);
const POWERSHELL_VALUE_PARAMETERS = new Set([
  'filter', 'include', 'exclude', 'credential', 'stream', 'erroraction', 'ea', 'warningaction', 'wa',
  'informationaction', 'infa', 'errorvariable', 'ev', 'warningvariable', 'wv', 'informationvariable', 'iv',
  'outvariable', 'ov', 'outbuffer', 'ob', 'pipelinevariable', 'pv',
]);

export function checkRecursiveDelete(invocation, context) {
  if (!DELETE_COMMANDS.has(invocation.name)) return null;
  const { recursive, targets } = parseDeleteArguments(invocation);
  if (!recursive) return null;
  if (invocation.fromXargs) return 'recursive delete through xargs: the targets come from input and cannot be checked';
  if (targets.length === 0) {
    return invocation.pipedInput ? 'recursive delete of piped input: the targets cannot be checked' : null;
  }
  // Expand {a,b} before splitting PowerShell lists (a,b), or "{dist,..}" would hide "..".
  for (const target of targets.flatMap(expandBraces).flatMap(splitList)) {
    const reason = checkTarget(target, context);
    if (reason) return reason;
  }
  return null;
}

// find -delete and find -exec rm/rimraf delete a whole tree: check each search root.
export function checkFindDelete({ name, args }, context) {
  if (name !== 'find') return null;
  const execDeletes = findExecCommands(args).some((words) => DELETE_COMMANDS.has(commandName(words[0])));
  if (!args.includes('-delete') && !execDeletes) return null;
  for (const root of findRoots(args)) {
    const reason = checkTarget(root, context, `find deleting under "${root}"`);
    if (reason) return reason;
  }
  return null;
}

function parseDeleteArguments({ name, args }) {
  const cmdStyle = CMD_STYLE_COMMANDS.has(name);
  let recursive = name === 'rimraf';
  const targets = [];
  let endOfOptions = false;
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    const isCmdSwitch = cmdStyle && CMD_SWITCH.test(arg);
    if (endOfOptions || arg === '-' || !(arg.startsWith('-') || isCmdSwitch)) {
      targets.push(arg);
    } else if (arg === '--') {
      endOfOptions = true;
    } else if (isCmdSwitch) {
      recursive ||= /^\/s/i.test(arg);
    } else {
      const option = readOption(arg);
      if (isRecursiveOption(arg, option.name)) {
        recursive = true;
      } else if (POWERSHELL_PATH_PARAMETERS.has(option.name)) {
        const value = option.value ?? args[(index += 1)];
        if (value !== undefined) targets.push(value);
      } else if (POWERSHELL_VALUE_PARAMETERS.has(option.name) && option.value === undefined) {
        index += 1;
      }
    }
  }
  return { recursive, targets };
}

// GNU style (-r, -R, -rf, --recursive) and PowerShell style (-Recurse or any prefix of it).
function isRecursiveOption(arg, optionName) {
  if (optionName === 'recursive') return true;
  if (GNU_SHORT_FLAGS.test(arg) && /r/i.test(arg)) return true;
  return optionName.length > 0 && 'recurse'.startsWith(optionName);
}

function readOption(arg) {
  const body = arg.replace(/^--?/, '');
  const separator = body.search(/[:=]/);
  if (separator === -1) return { name: body.toLowerCase(), value: undefined };
  return { name: body.slice(0, separator).toLowerCase(), value: body.slice(separator + 1) };
}

function splitList(value) {
  return value.split(',').filter((part) => part !== '');
}

function expandBraces(target) {
  const match = BRACE_LIST.exec(target);
  if (!match) return [target];
  const before = target.slice(0, match.index);
  const after = target.slice(match.index + match[0].length);
  return match[1].split(',').flatMap((option) => expandBraces(before + option + after));
}

// For a glob, check the directory the glob expands in: "dist/*" -> "dist", "*" -> ".".
function globBase(target) {
  const parts = target.split(/[\\/]/);
  const globIndex = parts.findIndex((part) => GLOB.test(part));
  if (globIndex === -1) return target;
  if (globIndex === 0) return '.';
  const base = parts.slice(0, globIndex).join('/');
  if (base === '') return '/';
  return /^[a-zA-Z]:$/.test(base) ? `${base}/` : base;
}

function checkTarget(target, context, label = `recursive delete of "${target}"`) {
  const { projectRoot, platform } = context;
  const resolved = resolvePath(globBase(target), context.cwd, context);
  if (resolved === null) {
    return `${label}: the path uses a variable, ~user, a PowerShell drive or an unknown working directory, so it cannot be checked`;
  }
  if (pathApi(platform).relative(projectRoot, resolved) === '') return `${label} would hit the project root`;
  if (!isInside(resolved, projectRoot, platform)) return `${label} reaches outside the project (${resolved})`;
  if (isSameOrInside(resolved, pathApi(platform).join(projectRoot, '.git'), platform)) return `${label} would touch .git`;
  return null;
}
