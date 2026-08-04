/** Shared fan-out concurrency for authoritative validate GET preflight. */
export const ACTION_VALIDATE_CONCURRENCY = 5

export async function fanOutValidate<TTarget, TResult>({
  targets,
  validateTarget,
  concurrency = ACTION_VALIDATE_CONCURRENCY,
}: {
  targets: readonly TTarget[]
  validateTarget: (target: TTarget) => Promise<TResult>
  concurrency?: number
}): Promise<TResult[]> {
  const results: TResult[] = []

  for (let index = 0; index < targets.length; index += concurrency) {
    const batch = targets.slice(index, index + concurrency)
    const batchResults = await Promise.all(batch.map((target) => validateTarget(target)))
    results.push(...batchResults)
  }

  return results
}
