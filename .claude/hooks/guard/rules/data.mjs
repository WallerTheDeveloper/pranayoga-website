// Commands that destroy database contents or Docker volumes.
import { parseDocker } from '../docker.mjs';
import { commandName } from '../invocation.mjs';

const DESTRUCTIVE_SQL = /\b(drop\s+(database|table|schema|owned)|truncate)\b/i;
const DESTRUCTIVE_MIGRATIONS = /^migrate:(fresh|reset|refresh|down)$/;

/** Checked once per script, so SQL in pipes, -c strings and heredocs is seen too. */
export function checkDestructiveSql(script, segments) {
  const usesPsql = segments.some((segment) => segment.words.some((word) => commandName(word) === 'psql'));
  if (!usesPsql || !DESTRUCTIVE_SQL.test(script)) return null;
  return 'destructive SQL (DROP DATABASE/TABLE/SCHEMA or TRUNCATE) sent to psql';
}

export function checkData({ name, args, words }) {
  if (name === 'dropdb') return 'dropdb deletes a database';
  const migration = words.find((word) => DESTRUCTIVE_MIGRATIONS.test(word));
  if (migration) return `payload ${migration} rolls back or wipes the database`;
  return checkDocker(name, args);
}

// docker exec/run commands are checked separately, as nested scripts.
function checkDocker(name, args) {
  const docker = parseDocker(name, args);
  if (!docker) return null;
  const { compose, subcommand, rest } = docker;
  if (((compose && subcommand === 'down') || subcommand === 'rm') && rest.some(isVolumeFlag)) {
    return `docker ${compose ? 'compose ' : ''}${subcommand} with volumes deletes data volumes`;
  }
  if ((subcommand === 'system' || subcommand === 'volume') && rest[0] === 'prune') {
    return `docker ${subcommand} prune deletes volumes and data`;
  }
  if (subcommand === 'volume' && (rest[0] === 'rm' || rest[0] === 'remove')) return 'docker volume rm deletes a data volume';
  return null;
}

function isVolumeFlag(arg) {
  return /^-[a-zA-Z]*v[a-zA-Z]*$/.test(arg) || /^--volumes(=|$)/.test(arg);
}
