// Disk, power and OS-level commands that nothing in this project needs.

const ALWAYS_BLOCKED = new Map([
  ['shutdown', 'shuts down the machine'],
  ['reboot', 'restarts the machine'],
  ['poweroff', 'shuts down the machine'],
  ['halt', 'stops the machine'],
  ['stop-computer', 'shuts down the machine'],
  ['restart-computer', 'restarts the machine'],
  ['setx', 'changes environment variables permanently'],
  ['set-executionpolicy', 'changes the PowerShell execution policy'],
  ['format', 'formats a drive'],
  ['format-volume', 'formats a drive'],
  ['clear-disk', 'wipes a disk'],
  ['diskpart', 'edits disk partitions'],
  ['shred', 'destroys file contents'],
]);
const REGISTRY_WRITES = new Set(['add', 'delete', 'import', 'restore', 'load', 'unload', 'copy']);
const RECURSIVE_PERMISSION_COMMANDS = new Set(['chmod', 'chown', 'chgrp']);
const POWERSHELLS = new Set(['powershell', 'pwsh']);

export function checkSystem({ name, args }) {
  if (ALWAYS_BLOCKED.has(name)) return `${name} ${ALWAYS_BLOCKED.get(name)}`;
  if (name === 'mkfs' || name.startsWith('mkfs.')) return `${name} formats a file system`;
  if (name === 'dd' && args.some((arg) => arg.startsWith('of='))) return 'dd with of= writes raw data to a file or device';
  const first = args[0]?.toLowerCase();
  if (name === 'reg' && REGISTRY_WRITES.has(first)) return `reg ${first} changes the Windows registry`;
  if (name === 'net' && first === 'user') return 'net user changes Windows user accounts';
  if (name === 'sc' && first === 'delete') return 'sc delete removes a Windows service';
  if (RECURSIVE_PERMISSION_COMMANDS.has(name) && args.some(isRecursiveUnixFlag)) {
    return `recursive ${name} changes permissions on a whole tree`;
  }
  if (name === 'icacls' && args.some((arg) => /^\/t$/i.test(arg))) return 'recursive icacls changes permissions on a whole tree';
  if (name === 'takeown' && args.some((arg) => /^\/r$/i.test(arg))) return 'recursive takeown changes ownership of a whole tree';
  if (POWERSHELLS.has(name) && args.some(isEncodedCommandFlag)) {
    return `${name} -EncodedCommand hides the command, so it cannot be checked`;
  }
  return null;
}

function isRecursiveUnixFlag(arg) {
  return arg === '--recursive' || /^-[a-zA-Z]*R[a-zA-Z]*$/.test(arg);
}

function isEncodedCommandFlag(arg) {
  const lower = arg.toLowerCase();
  return lower === '-e' || lower === '-ec' || (lower.length >= 3 && '-encodedcommand'.startsWith(lower));
}
