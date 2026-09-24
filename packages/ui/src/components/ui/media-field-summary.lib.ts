export type CompactSummaryCopy = {
  subject: string
  action: string
  ariaLabel: string
}

export function resolveCompactCountCopy(
  count: number,
  maxItems: number,
  display: 'capacity' | 'count',
): string {
  if (display === 'count') return `${count} ${count === 1 ? 'image' : 'images'} · Manage`
  return `${count} of ${maxItems} images · Manage`
}

function splitCompactActionCopy(text: string): Pick<CompactSummaryCopy, 'subject' | 'action'> {
  const separator = ' · '
  const index = text.lastIndexOf(separator)
  if (index === -1) return { subject: text, action: '' }
  return {
    subject: text.slice(0, index),
    action: text.slice(index + separator.length),
  }
}

export function resolveCompactSummaryCopy(
  count: number,
  maxItems: number,
  countDisplay: 'capacity' | 'count' = 'capacity',
): CompactSummaryCopy {
  const single = maxItems === 1
  if (count === 0) {
    const subject = single ? 'No image' : 'No images'
    return { subject, action: 'Add', ariaLabel: `${subject}. Add` }
  }
  if (single) {
    return { subject: 'Image', action: 'Change', ariaLabel: 'Image. Change' }
  }
  const text = resolveCompactCountCopy(count, maxItems, countDisplay)
  return { ...splitCompactActionCopy(text), ariaLabel: text }
}
