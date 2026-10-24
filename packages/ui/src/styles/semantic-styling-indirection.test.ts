import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { beforeAll, describe, expect, it } from 'vitest'

import {
  findStylingIndirectionInSource,
  type StylingIndirectionHit,
} from './semantic-styling-indirection.lib'
import {
  collectStylingIndirectionHits,
  loadStylingIndirectionAllowlist,
  stylingIndirectionAllowlistKey,
  stylingIndirectionHitKey,
} from './semantic-styling-indirection.roots.lib'

const stylesDir = dirname(fileURLToPath(import.meta.url))
const repoRoot = join(stylesDir, '../../../..')
const baselinePath = join(stylesDir, 'semantic-styling-indirection.baseline.json')
const allowlistPath = join(stylesDir, 'semantic-styling-indirection.allowlist.json')
const baseline = JSON.parse(readFileSync(baselinePath, 'utf8')) as string[]
const allowlist = loadStylingIndirectionAllowlist(allowlistPath)

describe('semantic styling indirection', () => {
  let allHits: StylingIndirectionHit[] = []

  beforeAll(() => {
    allHits = collectStylingIndirectionHits(repoRoot)
  }, 20_000)
  it('flags empty cva including multiline base', () => {
    const hits = findStylingIndirectionInSource(
      'fixture.ts',
      `import { cva } from 'class-variance-authority'
export const x = cva(\`
  ui-interactive-list__viewport
\`)`,
    )
    expect(hits).toEqual([{ filePath: 'fixture.ts', symbol: 'x', violationType: 'empty-cva' }])
  })

  it('allows cva with variants or compoundVariants', () => {
    const withVariants = findStylingIndirectionInSource(
      'fixture.ts',
      `import { cva } from 'class-variance-authority'
export const x = cva('ui-alert', { variants: { variant: { default: 'ui-alert--default' } } })`,
    )
    const withCompound = findStylingIndirectionInSource(
      'fixture.ts',
      `import { cva } from 'class-variance-authority'
export const x = cva('ui-alert', { compoundVariants: [{ class: 'ui-alert--quiet' }] })`,
    )
    expect(withVariants).toEqual([])
    expect(withCompound).toEqual([])
  })

  it('flags cva whose config object has neither axis', () => {
    const hits = findStylingIndirectionInSource(
      'fixture.ts',
      `import { cva } from 'class-variance-authority'
export const x = cva('ui-alert', { defaultVariants: { variant: 'default' } })`,
    )
    expect(hits.map((hit) => hit.violationType)).toEqual(['empty-cva'])
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

  it('allows a utility-shaped string that is not a styling export', () => {
    expect(findStylingIndirectionInSource('fixture.ts', `export const offset = 'left-2'`)).toEqual(
      [],
    )
    expect(findStylingIndirectionInSource('fixture.ts', `export const mode = 'hidden'`)).toEqual([])
    expect(findStylingIndirectionInSource('fixture.ts', `export const token = 'flex'`)).toEqual([])
    expect(findStylingIndirectionInSource('fixture.ts', `export const color = 'bg-muted'`)).toEqual(
      [],
    )
    expect(findStylingIndirectionInSource('fixture.ts', `export const all = '__all__'`)).toEqual([])
    expect(
      findStylingIndirectionInSource(
        'fixture.variants.ts',
        `export const width = 'primary-detail'
export const attr = 'data-viewport-fill'
export const length = '5.5rem'
export const fallback = 'calc(3rem+2rem)'`,
      ),
    ).toEqual([])
  })

  it('flags a single-token styling export', () => {
    expect(
      findStylingIndirectionInSource('fixture.ts', `export const offsetClasses = 'left-2'`),
    ).toEqual([
      { filePath: 'fixture.ts', symbol: 'offsetClasses', violationType: 'single-utility-alias' },
    ])
    expect(
      findStylingIndirectionInSource('fixture.variants.ts', `export const mode = 'hidden'`),
    ).toEqual([
      { filePath: 'fixture.variants.ts', symbol: 'mode', violationType: 'single-utility-alias' },
    ])
    expect(
      findStylingIndirectionInSource('fixture.ts', `export const rowClasses = 'ui-card'`),
    ).toEqual([
      { filePath: 'fixture.ts', symbol: 'rowClasses', violationType: 'single-semantic-alias' },
    ])
    expect(
      findStylingIndirectionInSource(
        'fixture.ts',
        `export const gap = 'gap-2'
export function Row() { return <div className={gap} /> }`,
      ),
    ).toEqual([{ filePath: 'fixture.ts', symbol: 'gap', violationType: 'single-utility-alias' }])
  })

  it('does not flag multi-class recipes, cn compositions, or function resolvers', () => {
    expect(
      findStylingIndirectionInSource(
        'fixture.variants.ts',
        `export const rowClasses = 'flex min-w-0 gap-2'`,
      ),
    ).toEqual([])
    expect(
      findStylingIndirectionInSource(
        'fixture.variants.ts',
        `import { cn } from '../lib/cn'
export const rowClasses = cn('ui-card', 'flex')`,
      ),
    ).toEqual([])
    expect(
      findStylingIndirectionInSource(
        'fixture.ts',
        `export function rowClasses() { return 'ui-card' }`,
      ),
    ).toEqual([])
    expect(
      findStylingIndirectionInSource(
        'fixture.ts',
        `export function resolve(unavailable: boolean) {
        return unavailable ? 'ui-data-table__row--unavailable' : undefined
      }`,
      ),
    ).toEqual([])
  })

  it('keys hits by file, symbol, and violation type', () => {
    const hit = findStylingIndirectionInSource(
      'fixture.variants.ts',
      `export const rowClasses = 'ui-card'`,
    )[0]
    expect(hit).toBeDefined()
    expect(stylingIndirectionHitKey(hit!)).toBe(
      'fixture.variants.ts:rowClasses:single-semantic-alias',
    )
    expect(stylingIndirectionHitKey({ ...hit!, symbol: 'otherClasses' })).not.toBe(
      stylingIndirectionHitKey(hit!),
    )
    expect(stylingIndirectionHitKey({ ...hit!, violationType: 'single-utility-alias' })).not.toBe(
      stylingIndirectionHitKey(hit!),
    )
  })

  it('matches the production-root indirection baseline', () => {
    const hits = allHits
      .filter((hit) => !allowlist.has(stylingIndirectionAllowlistKey(hit)))
      .map(stylingIndirectionHitKey)
    const unexpected = hits.filter((key) => !baseline.includes(key))
    const stale = baseline.filter((key) => !hits.includes(key))
    const exceptedInBaseline = hits.filter((key) =>
      [...allowlist].some((entry) => key.startsWith(`${entry}:`)),
    )

    expect(
      exceptedInBaseline,
      'Permanent exceptions are omitted from the baseline. Do not record them as temporary debt.',
    ).toEqual([])
    expect(
      unexpected,
      `New styling indirection outside baseline:\n${unexpected.join('\n')}`,
    ).toEqual([])
    expect(
      stale,
      `Remove fixed entries from semantic-styling-indirection.baseline.json:\n${stale.join('\n')}\nDo not replace a removed key with a different symbol or violation type in the same file.`,
    ).toEqual([])
  })

  it('keeps panelSectionInsetClasses as the only permanent exception', () => {
    const excepted = allHits.filter((hit) => allowlist.has(stylingIndirectionAllowlistKey(hit)))
    expect([...allowlist]).toEqual([
      'packages/ui/src/components/ui/panel.variants.ts:panelSectionInsetClasses',
    ])
    expect(excepted.map(stylingIndirectionAllowlistKey)).toEqual([
      'packages/ui/src/components/ui/panel.variants.ts:panelSectionInsetClasses',
    ])
    expect(excepted.map((hit) => hit.violationType)).toEqual(['single-semantic-alias'])
    for (const key of allowlist) {
      expect(baseline.some((entry) => entry.startsWith(`${key}:`))).toBe(false)
    }
  })
})
