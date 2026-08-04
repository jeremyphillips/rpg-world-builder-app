const INTEGRATION_DB_PREFIX = 'vitest_w'

/** Namespaced DB per Vitest worker on the shared in-memory replset. */
export function integrationMongoUriForWorker(
  baseUri: string,
  workerId = process.env.VITEST_WORKER_ID,
): string {
  const dbName = `${INTEGRATION_DB_PREFIX}${workerId ?? '0'}`
  const queryIndex = baseUri.indexOf('?')
  const withoutQuery = queryIndex === -1 ? baseUri : baseUri.slice(0, queryIndex)
  const query = queryIndex === -1 ? '' : baseUri.slice(queryIndex)
  const hostPart = withoutQuery.replace(/\/$/, '')
  return query ? `${hostPart}/${dbName}${query}` : `${hostPart}/${dbName}`
}
