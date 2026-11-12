// Reads find command lines: the search roots and the commands run by -exec.

const LEADING_OPTIONS = new Set(['-H', '-L', '-P']);
const EXEC_ACTIONS = new Set(['-exec', '-execdir', '-ok', '-okdir']);
const EXPRESSION_START = new Set(['(', ')', '!', ',']);

export function findRoots(args) {
  let index = 0;
  while (index < args.length && LEADING_OPTIONS.has(args[index])) index += 1;
  const roots = [];
  while (index < args.length && !args[index].startsWith('-') && !EXPRESSION_START.has(args[index])) {
    roots.push(args[index]);
    index += 1;
  }
  return roots.length > 0 ? roots : ['.'];
}

/** Each -exec/-execdir/-ok/-okdir command as a list of words, without the ; or + terminator. */
export function findExecCommands(args) {
  const commands = [];
  for (let index = 0; index < args.length; index += 1) {
    if (EXEC_ACTIONS.has(args[index])) {
      const terminator = args.findIndex((arg, position) => position > index && (arg === ';' || arg === '+'));
      const end = terminator === -1 ? args.length : terminator;
      commands.push(args.slice(index + 1, end));
      index = end;
    }
  }
  return commands;
}
