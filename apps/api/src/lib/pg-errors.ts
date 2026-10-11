export interface PgErrorLike {
  code?: string;
  constraint?: string;
}

/**
 * Type guard for Postgres unique-constraint violations (SQLSTATE 23505).
 * Pass a constraint name to match a specific unique index, so services can
 * translate low-level DB errors into typed AppErrors instead of sniffing
 * error codes inline. Unknown violations should be rethrown so the global
 * error handler can log and answer with a generic 500.
 *
 * Drizzle wraps driver errors in DrizzleQueryError with the pg error on
 * `err.cause`, so both the error itself and its cause are inspected.
 */
export function isUniqueViolation(err: unknown, constraint?: string): err is PgErrorLike {
  if (typeof err !== 'object' || err === null) return false;
  const source = (err as PgErrorLike).code ? err : (err as { cause?: unknown }).cause;
  if (typeof source !== 'object' || source === null) return false;
  const { code, constraint: violated } = source as PgErrorLike;
  return code === '23505' && (constraint === undefined || violated === constraint);
}
