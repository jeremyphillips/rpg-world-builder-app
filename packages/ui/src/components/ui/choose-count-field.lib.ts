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
