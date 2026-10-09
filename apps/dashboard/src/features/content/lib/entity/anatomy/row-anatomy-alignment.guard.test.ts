import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

import { describe, expect, it } from 'vitest'

const ENTITY_ROOT = join(__dirname, '..')
const DASHBOARD_SRC = join(ENTITY_ROOT, '../../../..')
const REPO_ROOT = join(DASHBOARD_SRC, '../../..')
const UI_SRC = join(REPO_ROOT, 'packages/ui/src')

function walkSources(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const fullPath = join(dir, entry)
    if (statSync(fullPath).isDirectory()) return walkSources(fullPath)
    return /\.(ts|tsx)$/.test(entry) ? [fullPath] : []
  })
}

function isProductionSource(filePath: string): boolean {
  return (
    !/\.(test|integration\.test|type\.test|stories)\.tsx?$/.test(filePath) &&
    !filePath.includes('/__tests__/') &&
    !filePath.includes('/__stories__/')
  )
}

/** Retired alignment props — row geometry and CLI rhythm resolve internally. */
const RETIRED_ALIGNMENT_PROPS = /\b(trailingAlign|headingBand|actionsAlign|rowAlign)\b/

/** Self-alignment and offset utilities that compensate for track geometry. */
const COMPENSATION_UTILITIES =
  /\bself-(center|start)\b|\bmin-h-control-action-compact\b|(?<![\w-])mt-(\d|\[|px\b)/

/** Cross-axis alignment on cell wrappers — allowed only for inner-content flex rows below. */
const CROSS_AXIS_ALIGNMENT = /\bitems-(start|center)\b/

const INNER_CONTENT_ALIGNMENT_ALLOWLIST = new Set([
  'anatomy/entity-anatomy-trailing.variants.ts',
  'anatomy/entity-leading-rail.variants.ts',
  'summary/entity-summary.variants.ts',
  'summary/entity-summary-status.tsx',
])

describe('row anatomy alignment guard', () => {
  it('bans retired alignment props across dashboard and @rpg/ui production sources', () => {
    const sources = [...walkSources(DASHBOARD_SRC), ...walkSources(UI_SRC)].filter(
      isProductionSource,
    )
    const violations = sources
      .filter((filePath) => RETIRED_ALIGNMENT_PROPS.test(readFileSync(filePath, 'utf8')))
      .map((filePath) => relative(REPO_ROOT, filePath))

    expect(sources.some((filePath) => filePath.endsWith('entity-anatomy.tsx'))).toBe(true)
    expect(sources.some((filePath) => filePath.endsWith('row-anatomy-cell.tsx'))).toBe(true)
    expect(violations).toEqual([])
  })

  it('keeps compensation utilities out of entity anatomy and summary', () => {
    const violations: string[] = []

    for (const dir of ['anatomy', 'summary']) {
      for (const filePath of walkSources(join(ENTITY_ROOT, dir)).filter(isProductionSource)) {
        const file = relative(ENTITY_ROOT, filePath)
        const source = readFileSync(filePath, 'utf8')
        if (COMPENSATION_UTILITIES.test(source)) violations.push(`${file}: compensation utility`)
        if (CROSS_AXIS_ALIGNMENT.test(source) && !INNER_CONTENT_ALIGNMENT_ALLOWLIST.has(file)) {
          violations.push(`${file}: cross-axis alignment on a cell wrapper`)
        }
      }
    }

    expect(violations).toEqual([])
  })
})
