const CONTENT_STAT_ROW_LABEL_SELECTOR = '[data-slot="content-stat-row-label"]'

/** Single-line label width. Nowrap avoids a wrap → narrower column → unwrap loop. */
function measureLabelContentWidth(label: HTMLElement): number {
  const previousWhiteSpace = label.style.whiteSpace
  label.style.whiteSpace = 'nowrap'
  const width = label.getBoundingClientRect().width
  label.style.whiteSpace = previousWhiteSpace
  return width
}

function measureGroupLabelContentWidth(groupElement: HTMLElement): number {
  const labels = groupElement.querySelectorAll<HTMLElement>(CONTENT_STAT_ROW_LABEL_SELECTOR)
  let maxWidth = 0
  labels.forEach((label) => {
    maxWidth = Math.max(maxWidth, measureLabelContentWidth(label))
  })
  return maxWidth
}

/**
 * One label-column width for every group in the host, including after wrap.
 * Omitted for a single group so that grid stays `auto`.
 */
export function measureStatRowLabelColumnWidths(
  groupElements: readonly (HTMLElement | null)[],
): number | undefined {
  const present = groupElements.filter((element): element is HTMLElement => element != null)
  if (present.length < 2) {
    return undefined
  }

  let maxWidth = 0
  for (const groupElement of present) {
    maxWidth = Math.max(maxWidth, measureGroupLabelContentWidth(groupElement))
  }

  if (maxWidth <= 0) {
    return undefined
  }

  return Math.ceil(maxWidth)
}
