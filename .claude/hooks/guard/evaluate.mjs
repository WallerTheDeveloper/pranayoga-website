// Decides whether a Bash or PowerShell command may run. A guardrail against
// mistakes (docs/PLAN.md, Phase 0), not a security sandbox.
import { tokenize } from './tokenize.mjs';
import { innerScripts, resolveInvocation } from './invocation.mjs';
import { nextWorkingDirectory, resolvePath, toNativePath } from './paths.mjs';
import { checkGit } from './rules/git.mjs';
import { checkFindDelete, checkRecursiveDelete } from './rules/delete.mjs';
import { checkSystem } from './rules/system.mjs';
import { checkOutward, checkRemoteCode, isDownloader } from './rules/network.mjs';
import { checkData, checkDestructiveSql } from './rules/data.mjs';

const MAX_DEPTH = 6;
const PIPE_CONNECTORS = new Set(['|', '|&']);
const RULES = [checkGit, checkRecursiveDelete, checkFindDelete, checkSystem, checkRemoteCode, checkOutward, checkData];

/**
 * @param {string} command
 * @param {{ shell: 'bash' | 'powershell' | 'cmd', cwd: string | null, projectRoot: string, homeDir: string, platform: string }} context
 * @returns {{ allowed: true } | { allowed: false, reason: string }}
 */
export function evaluateCommand(command, context) {
  const cwd = context.cwd ? toNativePath(context.cwd, context.platform) : null;
  const reason = inspectScript(command, { ...context, cwd }, 0);
  return reason ? { allowed: false, reason } : { allowed: true };
}

function inspectScript(script, context, depth) {
  if (depth > MAX_DEPTH) return 'the command nests too deeply to inspect';
  const { segments } = tokenize(script, context.shell);
  const sqlReason = checkDestructiveSql(script, segments);
  if (sqlReason) return sqlReason;

  let cwd = context.cwd;
  let downloadInPipeline = false;
  for (const [index, segment] of segments.entries()) {
    const pipedInput = index > 0 && PIPE_CONNECTORS.has(segments[index - 1].connector);
    downloadInPipeline &&= pipedInput;
    const invocation = resolveInvocation(segment, { pipedInput, afterDownload: downloadInPipeline });
    // "pnpm --dir x exec ..." runs the binary in x without changing the shell's directory.
    const runIn = invocation?.directory === undefined ? cwd : resolvePath(invocation.directory, cwd, context);
    const segmentContext = { ...context, cwd: runIn };
    const reason = (invocation && firstRuleReason(invocation, segmentContext)) || inspectNested(segment, invocation, segmentContext, depth);
    if (reason) return reason;
    if (invocation) {
      downloadInPipeline ||= isDownloader(invocation.name);
      cwd = nextWorkingDirectory(invocation, cwd, context);
    }
  }
  return null;
}

function firstRuleReason(invocation, context) {
  for (const rule of RULES) {
    const reason = rule(invocation, context);
    if (reason) return reason;
  }
  return null;
}

function inspectNested(segment, invocation, context, depth) {
  const scripts = [
    ...segment.nested.map((script) => ({ script, shell: context.shell })),
    ...(invocation ? innerScripts(invocation) : []),
  ];
  for (const { script, shell } of scripts) {
    const reason = inspectScript(script, { ...context, shell }, depth + 1);
    if (reason) return reason;
  }
  return null;
}
