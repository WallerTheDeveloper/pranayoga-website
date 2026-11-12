// Reads docker / docker compose command lines: which subcommand runs and, for
// exec/run, which command runs inside the container.

const DOCKER_NAMES = new Set(['docker', 'docker-compose']);
const GLOBAL_VALUE_OPTIONS = new Set([
  '--context', '-c', '-H', '--host', '--config', '-l', '--log-level',
  '-f', '--file', '-p', '--project-name', '--profile', '--env-file', '--project-directory', '--ansi', '--parallel',
]);
const CONTAINER_VALUE_OPTIONS = new Set([
  '-u', '--user', '-w', '--workdir', '-e', '--env', '--env-file', '--index', '--detach-keys',
  '-v', '--volume', '-p', '--publish', '--name', '--network', '--net', '--entrypoint', '--mount',
  '-l', '--label', '--platform', '--pull', '-h', '--hostname', '--add-host', '-m', '--memory',
  '--restart', '--cpus', '--device', '--cap-add', '--cap-drop', '--security-opt', '--tmpfs',
  '--ulimit', '--volumes-from', '--shm-size', '--gpus', '--dns', '--log-driver', '--log-opt',
]);

/** @returns {{ compose: boolean, subcommand: string | undefined, rest: string[] } | null} */
export function parseDocker(name, args) {
  if (!DOCKER_NAMES.has(name)) return null;
  let compose = name === 'docker-compose';
  let index = 0;
  while (index < args.length) {
    const arg = args[index];
    if (arg.startsWith('-')) {
      index += GLOBAL_VALUE_OPTIONS.has(arg) ? 2 : 1;
    } else if (!compose && (arg === 'compose' || arg === 'container')) {
      compose ||= arg === 'compose';
      index += 1;
    } else {
      break;
    }
  }
  return { compose, subcommand: args[index], rest: args.slice(index + 1) };
}

/** Words of the command that `docker exec|run` or `docker compose exec|run` starts in the container. */
export function containerCommand(name, args) {
  const parsed = parseDocker(name, args);
  if (!parsed || (parsed.subcommand !== 'exec' && parsed.subcommand !== 'run')) return [];
  const { rest } = parsed;
  let index = 0;
  while (index < rest.length && rest[index].startsWith('-')) {
    index += CONTAINER_VALUE_OPTIONS.has(rest[index]) ? 2 : 1;
  }
  // Skip the container, service or image name.
  return rest.slice(index + 1);
}
