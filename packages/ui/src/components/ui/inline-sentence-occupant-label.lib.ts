export function resolveInlineSentenceOccupantLabel(options: {
  label?: string | null
  ariaLabel?: string | null
  segmentName: string
}): string {
  const resolved = options.label?.trim() || options.ariaLabel?.trim()
  if (!resolved) {
    if (process.env.NODE_ENV !== 'production') {
      throw new Error(
        `Inline sentence control "${options.segmentName}" requires segment.label or control.ariaLabel`,
      )
    }
    return ''
  }
  return resolved
}
