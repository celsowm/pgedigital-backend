import type { EnvLike } from './db.js';

const SQL_DEBUG_FLAG = '--sql-debug';
const TRUE_VALUES = new Set(['1', 'true', 'yes', 'on']);

function isTruthy(value: string | undefined): boolean {
  return Boolean(value && TRUE_VALUES.has(value.trim().toLowerCase()));
}

function matchesFlag(arg: string): boolean {
  if (arg === SQL_DEBUG_FLAG) return true;
  if (!arg.startsWith(`${SQL_DEBUG_FLAG}=`)) return false;
  const [, raw] = arg.split('=', 2);
  return isTruthy(raw);
}

export function isSqlDebugEnabled(env: EnvLike = process.env, argv: readonly string[] = process.argv): boolean {
  if (isTruthy(env.PGE_DIGITAL_SQL_DEBUG ?? env.SQL_DEBUG)) return true;
  return argv.some(matchesFlag);
}
