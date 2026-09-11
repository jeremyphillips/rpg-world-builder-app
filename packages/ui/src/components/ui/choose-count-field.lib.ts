export function parseChooseCount(raw: string): number | undefined {
  if (raw.trim() === '') return undefined
  const parsed = Number(raw)
  return Number.isNaN(parsed) ? undefined : parsed
}

export function fieldAnatomyIds(id: string) {
  return {
    legendId: `${id}-legend`,
    chooseId: `${id}-choose`,
    hintId: `${id}-hint`,
    errorId: `${id}-error`,
  }
}

export function fieldDescribedBy(
  error?: string,
  hint?: string,
  errorId?: string,
  hintId?: string,
  hintPosition: 'below-label' | 'below-control' = 'below-label',
) {
  if (error) {
    if (hintPosition === 'below-label' && hint) {
      return `${hintId} ${errorId}`
    }
    return errorId
  }
  if (hint) return hintId
  return undefined
}
