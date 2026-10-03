import {
  ROW_ANATOMY_ROOT_ATTRIBUTE,
  ROW_ANATOMY_SLOT_ATTRIBUTE,
} from '../components/ui/row-anatomy/row-anatomy.variants'
import type { RowAnatomySlot } from '../components/ui/row-anatomy/row-anatomy.types'

export type RowAnatomyTrackSizes = {
  slackStart: number
  band: number
  meta: number
  status: number
  slackEnd: number
}

export type RowAnatomyGeometryOptions = {
  /** Allowed relative difference in CSS px. */
  tolerance?: number
  /** Fail when fewer row-anatomy grids are found (guards vacuous passes). */
  minGrids?: number
}

export type RowAnatomyGridReport = {
  grid: HTMLElement
  tracks: RowAnatomyTrackSizes
  issues: string[]
}

const DEFAULT_TOLERANCE_PX = 1

/** Parses resolved `grid-template-rows` (`[slack-start] 6px [band] 24px …`) into track sizes. */
export function parseRowAnatomyTracks(gridTemplateRows: string): RowAnatomyTrackSizes {
  const sizes = gridTemplateRows
    .replace(/\[[^\]]*\]/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((token) => Number.parseFloat(token))

  if (sizes.length !== 5 || sizes.some((size) => Number.isNaN(size))) {
    throw new Error(`Expected 5 resolved row-anatomy tracks, got "${gridTemplateRows}"`)
  }

  const [slackStart, band, meta, status, slackEnd] = sizes as [
    number,
    number,
    number,
    number,
    number,
  ]
  return { slackStart, band, meta, status, slackEnd }
}

export function readRowAnatomyTracks(grid: HTMLElement): RowAnatomyTrackSizes {
  return parseRowAnatomyTracks(getComputedStyle(grid).gridTemplateRows)
}

export async function waitForRowAnatomyLayout(): Promise<void> {
  if (typeof document !== 'undefined' && document.fonts) {
    await document.fonts.ready
  }
  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
}

function contentBox(element: HTMLElement) {
  const rect = element.getBoundingClientRect()
  const style = getComputedStyle(element)
  const top = rect.top + Number.parseFloat(style.borderTopWidth) + Number.parseFloat(style.paddingTop)
  const bottom =
    rect.bottom -
    Number.parseFloat(style.borderBottomWidth) -
    Number.parseFloat(style.paddingBottom)
  return { top, bottom, height: bottom - top, center: (top + bottom) / 2 }
}

function cellsBySlot(grid: HTMLElement): Record<RowAnatomySlot, HTMLElement[]> {
  const groups: Record<RowAnatomySlot, HTMLElement[]> = {
    band: [],
    meta: [],
    status: [],
    full: [],
    stretch: [],
  }
  for (const child of Array.from(grid.children)) {
    if (!(child instanceof HTMLElement)) continue
    const slot = child.getAttribute(ROW_ANATOMY_SLOT_ATTRIBUTE) as RowAnatomySlot | null
    if (slot && slot in groups) groups[slot].push(child)
  }
  return groups
}

function describeCell(cell: HTMLElement): string {
  const column = cell.getAttribute('data-row-anatomy-column') ?? '?'
  const slot = cell.getAttribute(ROW_ANATOMY_SLOT_ATTRIBUTE) ?? '?'
  return `${slot}/${column}`
}

function sharedEdgeIssues(
  cells: HTMLElement[],
  edge: (rect: DOMRect) => number,
  label: string,
  tolerance: number,
): string[] {
  if (cells.length < 2) return []
  const [first, ...rest] = cells as [HTMLElement, ...HTMLElement[]]
  const reference = edge(first.getBoundingClientRect())
  return rest.flatMap((cell) => {
    const delta = Math.abs(edge(cell.getBoundingClientRect()) - reference)
    return delta > tolerance
      ? [`${describeCell(cell)} ${label} differs from ${describeCell(first)} by ${delta.toFixed(2)}px`]
      : []
  })
}

/** Measures one row-anatomy grid; returns human-readable issues (empty when aligned). */
export function measureRowAnatomyGrid(
  grid: HTMLElement,
  tolerance = DEFAULT_TOLERANCE_PX,
): RowAnatomyGridReport {
  const tracks = readRowAnatomyTracks(grid)
  const box = contentBox(grid)
  const cells = cellsBySlot(grid)
  const issues: string[] = []
  const center = (rect: DOMRect) => rect.top + rect.height / 2

  const bandCenter = box.top + tracks.slackStart + tracks.band / 2
  for (const cell of cells.band) {
    const delta = Math.abs(center(cell.getBoundingClientRect()) - bandCenter)
    if (delta > tolerance) {
      issues.push(`${describeCell(cell)} center is ${delta.toFixed(2)}px off the band center`)
    }
  }
  issues.push(...sharedEdgeIssues(cells.band, center, 'center', tolerance))
  issues.push(...sharedEdgeIssues(cells.meta, (rect) => rect.top, 'top', tolerance))
  issues.push(...sharedEdgeIssues(cells.status, (rect) => rect.top, 'top', tolerance))

  for (const cell of cells.full) {
    const delta = Math.abs(center(cell.getBoundingClientRect()) - box.center)
    if (delta > tolerance) {
      issues.push(`${describeCell(cell)} center is ${delta.toFixed(2)}px off the grid center`)
    }
  }

  for (const cell of cells.stretch) {
    const delta = Math.abs(cell.getBoundingClientRect().height - box.height)
    if (delta > tolerance) {
      issues.push(`${describeCell(cell)} height differs from the grid by ${delta.toFixed(2)}px`)
    }
  }

  if (Math.abs(tracks.slackStart - tracks.slackEnd) > tolerance) {
    issues.push(
      `slack gutters are uneven (${tracks.slackStart}px vs ${tracks.slackEnd}px)`,
    )
  }

  return { grid, tracks, issues }
}

function collectGrids(root: Element): HTMLElement[] {
  const grids = Array.from(root.querySelectorAll<HTMLElement>(`[${ROW_ANATOMY_ROOT_ATTRIBUTE}]`))
  if (root instanceof HTMLElement && root.hasAttribute(ROW_ANATOMY_ROOT_ATTRIBUTE)) {
    grids.unshift(root)
  }
  return grids
}

/**
 * Storybook play helper: waits for fonts + a frame, then asserts every row-anatomy grid
 * under `root` is aligned (band centers, meta/status tops, full centers, stretch heights).
 */
export async function expectRowAnatomyAligned(
  root: Element,
  { tolerance = DEFAULT_TOLERANCE_PX, minGrids = 1 }: RowAnatomyGeometryOptions = {},
): Promise<RowAnatomyGridReport[]> {
  await waitForRowAnatomyLayout()
  const grids = collectGrids(root)

  if (grids.length < minGrids) {
    throw new Error(`Expected at least ${minGrids} row-anatomy grid(s), found ${grids.length}`)
  }

  const reports = grids.map((grid) => measureRowAnatomyGrid(grid, tolerance))
  const failures = reports.filter((report) => report.issues.length > 0)

  if (failures.length > 0) {
    const details = failures
      .map((report) => {
        const label =
          report.grid.closest('[data-recipe-name]')?.getAttribute('data-recipe-name') ??
          report.grid.textContent?.trim().slice(0, 40) ??
          'grid'
        return `- ${label}: ${report.issues.join('; ')}`
      })
      .join('\n')
    throw new Error(`Row anatomy misaligned:\n${details}`)
  }

  return reports
}
