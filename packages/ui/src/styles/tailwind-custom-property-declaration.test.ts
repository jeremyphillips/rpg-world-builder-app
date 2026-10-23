import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

import { findTailwindCustomPropertyDeclarationsInSource } from './tailwind-custom-property-declaration.lib'
import { collectTailwindCustomPropertyDeclarationCounts } from './tailwind-custom-property-declaration.roots.lib'

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '../../../..')
const baselinePath = join(
  dirname(fileURLToPath(import.meta.url)),
  'tailwind-custom-property-declaration.baseline.json',
)

type ApprovedEntry = {
  category: 'variant-resolver' | 'plugin-api' | 'local-layout'
  reason: string
  count: number
}

type Baseline = {
  temporary: Record<string, Record<string, number>>
  approved: Record<string, Record<string, ApprovedEntry>>
}

const baseline = JSON.parse(readFileSync(baselinePath, 'utf8')) as Baseline

function formatCountMismatch(
  filePath: string,
  customProperty: string,
  expected: number,
  actual: number,
): string {
  return `${filePath} ${customProperty}: expected ${expected}, found ${actual}`
}

describe('tailwind custom-property declaration ratchet', () => {
  it('resolves const-backed template declarations', () => {
    const counts = findTailwindCustomPropertyDeclarationsInSource(`
      export const RPG_CONTENT_FLOOR_GAP_VAR = '--rpg-content-floor-gap'
      export const x = \`[\${RPG_CONTENT_FLOOR_GAP_VAR}:1rem]\`
    `)
    expect(counts['--rpg-content-floor-gap']).toBe(1)
  })

  it('ignores var() reads without arbitrary-property declarations', () => {
    const counts = findTailwindCustomPropertyDeclarationsInSource(`
      export const x = 'top-[var(--rpg-content-top-inset,0px)]'
    `)
    expect(counts).toEqual({})
  })

  it('matches the temporary and approved baseline buckets', () => {
    const actualByFile = collectTailwindCustomPropertyDeclarationCounts(repoRoot)
    const violations: string[] = []

    const baselineFiles = new Set([
      ...Object.keys(baseline.temporary),
      ...Object.keys(baseline.approved),
    ])

    for (const filePath of Object.keys(actualByFile)) {
      if (!baselineFiles.has(filePath)) {
        const fileCounts = actualByFile[filePath] ?? {}
        for (const [customProperty, count] of Object.entries(fileCounts)) {
          violations.push(`Unbucketed declaration: ${filePath} ${customProperty} (count ${count})`)
        }
      }
    }

    for (const [filePath, expectedCounts] of Object.entries(baseline.temporary)) {
      const actualCounts = actualByFile[filePath] ?? {}
      for (const [customProperty, expected] of Object.entries(expectedCounts)) {
        const actual = actualCounts[customProperty] ?? 0
        if (actual > expected) {
          violations.push(formatCountMismatch(filePath, customProperty, expected, actual))
        }
      }
      for (const customProperty of Object.keys(actualCounts)) {
        if (!(customProperty in expectedCounts)) {
          violations.push(
            `New temporary variable: ${filePath} ${customProperty} (count ${actualCounts[customProperty]})`,
          )
        }
      }
    }

    for (const [filePath, expectedEntries] of Object.entries(baseline.approved)) {
      const actualCounts = actualByFile[filePath] ?? {}
      for (const [customProperty, entry] of Object.entries(expectedEntries)) {
        const actual = actualCounts[customProperty] ?? 0
        if (actual !== entry.count) {
          violations.push(formatCountMismatch(filePath, customProperty, entry.count, actual))
        }
      }
      for (const customProperty of Object.keys(actualCounts)) {
        if (!(customProperty in expectedEntries)) {
          violations.push(
            `New approved variable: ${filePath} ${customProperty} (count ${actualCounts[customProperty]})`,
          )
        }
      }
    }

    const staleTemporary: string[] = []
    for (const [filePath, expectedCounts] of Object.entries(baseline.temporary)) {
      const actualCounts = actualByFile[filePath] ?? {}
      for (const [customProperty, expected] of Object.entries(expectedCounts)) {
        const actual = actualCounts[customProperty] ?? 0
        if (actual < expected) {
          staleTemporary.push(
            `Shrink temporary baseline: ${filePath} ${customProperty} (${expected} → ${actual})`,
          )
        }
      }
      if (Object.keys(actualCounts).length === 0 && Object.keys(expectedCounts).length > 0) {
        staleTemporary.push(`Remove empty temporary file entry: ${filePath}`)
      }
    }

    expect(
      violations,
      `Tailwind custom-property ratchet violations:\n${violations.join('\n')}`,
    ).toEqual([])
    expect(
      staleTemporary,
      `Update tailwind-custom-property-declaration.baseline.json:\n${staleTemporary.join('\n')}`,
    ).toEqual([])

    if (Object.keys(baseline.temporary).length === 0) {
      const unapproved: string[] = []
      for (const [filePath, counts] of Object.entries(actualByFile)) {
        if (!(filePath in baseline.approved)) {
          for (const [customProperty, count] of Object.entries(counts)) {
            unapproved.push(`${filePath} ${customProperty} (count ${count})`)
          }
        }
      }
      expect(
        unapproved,
        'After B4, only approved files may declare Tailwind custom-property utilities',
      ).toEqual([])
    }
  })
})
