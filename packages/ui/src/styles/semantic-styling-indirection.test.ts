import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

import { findStylingIndirectionInSource } from './semantic-styling-indirection.lib'
import {
  collectStylingIndirectionHits,
  stylingIndirectionHitKey,
} from './semantic-styling-indirection.roots.lib'

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '../../../..')
const baselinePath = join(
  dirname(fileURLToPath(import.meta.url)),
  'semantic-styling-indirection.baseline.json',
)
const baseline = JSON.parse(readFileSync(baselinePath, 'utf8')) as string[]

describe('semantic styling indirection', () => {
  it('flags empty cva including multiline base', () => {
    const hits = findStylingIndirectionInSource(
      'fixture.ts',
      `import { cva } from 'class-variance-authority'
export const x = cva(\`
  ui-interactive-list__viewport
\`)`,
    )
    expect(hits.some((h) => h.message.includes('cva()'))).toBe(true)
  })

  it('allows cva with variants', () => {
    const hits = findStylingIndirectionInSource(
      'fixture.ts',
      `import { cva } from 'class-variance-authority'
export const x = cva('ui-alert', { variants: { variant: { default: 'ui-alert--default' } } })`,
    )
    expect(hits).toEqual([])
  })

  it('allows class spec metadata', () => {
    const hits = findStylingIndirectionInSource(
      'fixture.ts',
      `export const ALERT_CLASS_SPECS = [{ className: 'ui-alert--warning', useCase: 'x' }]`,
    )
    expect(hits).toEqual([])
  })

  it('allows merge group arrays', () => {
    const hits = findStylingIndirectionInSource(
      'fixture.ts',
      `export const UI_ROW_HOVER = { hover: 'ui-interactive-row--hover' }
export const UI_ROW_HOVER_CLASSES = Object.values(UI_ROW_HOVER)`,
    )
    expect(hits).toEqual([])
  })

  it('allows layout constants', () => {
    const hits = findStylingIndirectionInSource('fixture.ts', `export const offset = 'left-2'`)
    expect(hits).toEqual([])
  })

  it('allows parameterized resolvers', () => {
    const hits = findStylingIndirectionInSource(
      'fixture.ts',
      `export function resolve(unavailable: boolean) {
        return unavailable ? 'ui-data-table__row--unavailable' : undefined
      }`,
    )
    expect(hits).toEqual([])
  })

  it('matches the scoped-root indirection baseline', () => {
    const hits = collectStylingIndirectionHits(repoRoot).map(stylingIndirectionHitKey)
    const unexpected = hits.filter((key) => !baseline.includes(key))
    const stale = baseline.filter((key) => !hits.includes(key))

    expect(
      unexpected,
      `New styling indirection outside baseline:\n${unexpected.join('\n')}`,
    ).toEqual([])
    expect(
      stale,
      `Remove fixed entries from semantic-styling-indirection.baseline.json:\n${stale.join('\n')}`,
    ).toEqual([])
  })
})
