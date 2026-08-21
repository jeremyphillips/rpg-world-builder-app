import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

const packageRoot = join(fileURLToPath(new URL('.', import.meta.url)), '..')
const srcRoot = join(packageRoot, 'src')

const deletedPaths = [
  'rpg/content/lib/content-type-keys.ts',
  'rpg/content/lib/equipment-family-path.ts',
  'rpg/content/lib/viewer-character-relationship.ts',
  'shared/paginated-items.ts',
  'rpg/primitives/character/viewer-character-relationship.ts',
  'rpg/primitives/weapon/mode-compatibility-messages.ts',
  'rpg/primitives/level.ts',
  'rpg/primitives/level-messages.ts',
  'rpg/primitives/level-range-table.ts',
  'rpg/primitives/level-range-table-authoring.ts',
  'rpg/primitives/content/catalog-usage-reference.ts',
  'rpg/primitives/content/catalog-entity-usage-blocker.ts',
]

const forbiddenPatterns: Array<{ label: string; roots: string[]; pattern: RegExp }> = [
  {
    label: 'vocab → content',
    roots: ['rpg/vocab'],
    pattern: /from ['"][^'"]*rpg\/content/,
  },
  {
    label: 'campaign → content',
    roots: ['rpg/campaign'],
    pattern: /from ['"][^'"]*rpg\/content/,
  },
  {
    label: 'runtime → shared paginated-items',
    roots: ['rpg/runtime'],
    pattern: /from ['"][^'"]*shared\/paginated-items/,
  },
  {
    label: 'runtime → @rpg/search barrel',
    roots: ['rpg/runtime'],
    pattern: /from ['"]@rpg\/search['"]/,
  },
]

function collectFiles(dir: string): string[] {
  const entries = readdirSync(dir)
  const files: string[] = []

  for (const entry of entries) {
    const fullPath = join(dir, entry)
    const stats = statSync(fullPath)
    if (stats.isDirectory()) {
      files.push(...collectFiles(fullPath))
      continue
    }
    if (entry.endsWith('.ts') && !entry.endsWith('.test.ts')) {
      files.push(fullPath)
    }
  }

  return files
}

describe('contracts layer import boundaries', () => {
  it('does not keep deleted compatibility module paths', () => {
    for (const deletedPath of deletedPaths) {
      expect(existsSync(join(srcRoot, deletedPath))).toBe(false)
    }
  })

  for (const { label, roots, pattern } of forbiddenPatterns) {
    it(`has no ${label} imports`, () => {
      const violations: string[] = []

      for (const root of roots) {
        const files = collectFiles(join(srcRoot, root))
        for (const file of files) {
          const content = readFileSync(file, 'utf8')
          if (pattern.test(content)) {
            violations.push(relative(packageRoot, file))
          }
        }
      }

      expect(violations).toEqual([])
    })
  }
})
