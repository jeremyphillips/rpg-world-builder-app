export function resolveReplacementFieldLabels(entityLabel: string): {
  currentLabel: string
  newLabel: string
} {
  const lower = entityLabel.toLowerCase()
  return {
    currentLabel: `Current ${lower}`,
    newLabel: `New ${lower}`,
  }
}
