import { readdirSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

/**
 * Domain triplet words belong to PICKER_MUTATION_FAMILIES.
 * Scans production picker files for exact Learn / Learned / Unlearn / Prepare /
 * Prepared / Unprepare literals. Tests and stories are skipped. Add, Remove, and
 * Selected are not owned here.
 */

const CHARACTER_SRC = fileURLToPath(new URL('../../', import.meta.url))
const FAMILY_MODULE = 'lib/picker/picker-mutation-family.ts'

const OWNED_LITERAL = /(['"`])(Unlearn|Unprepare|Learned|Prepared|Learn|Prepare)\1/g

function isProductionPickerFile(relativePath: string): boolean {
  if (!relativePath.includes('/picker/') && !relativePath.startsWith('lib/picker/')) {
    return false
  }
  if (relativePath === FAMILY_MODULE) return false
  if (relativePath.endsWith('.test.ts') || relativePath.endsWith('.test.tsx')) return false
  if (relativePath.endsWith('.stories.tsx')) return false
  return relativePath.endsWith('.ts') || relativePath.endsWith('.tsx')
}

function collectPickerFiles(directory: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const absolutePath = join(directory, entry.name)
    if (entry.isDirectory()) {
      collectPickerFiles(absolutePath, acc)
      continue
    }
    const relativePath = relative(CHARACTER_SRC, absolutePath)
    if (isProductionPickerFile(relativePath)) acc.push(relativePath)
  }
  return acc
}

function stripComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '')
}

describe('picker mutation family drift', () => {
  it('takes domain triplet words from PICKER_MUTATION_FAMILIES', () => {
    const violations: string[] = []

    for (const relativePath of collectPickerFiles(CHARACTER_SRC)) {
      const source = stripComments(readFileSync(join(CHARACTER_SRC, relativePath), 'utf8'))
      for (const match of source.matchAll(OWNED_LITERAL)) {
        violations.push(`${relativePath}: ${match[2]}`)
      }
    }

    expect(violations).toEqual([])
  })
})
