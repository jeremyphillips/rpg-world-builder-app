import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

/**
 * Numeric Armor Class bases belong to the scale and the edition presets.
 * Everything else reads `ArmorClassRules` from server resolution.
 */

const repoRoot = join(fileURLToPath(new URL('.', import.meta.url)), '../../../../../../')

const SCAN_ROOTS = ['apps', 'packages'] as const

const ALLOWED_NUMERIC_BASE_FILES = new Set([
  'packages/contracts/src/rpg/vocab/mechanics/armor-class-scale.ts',
  'packages/contracts/src/rpg/vocab/mechanics/edition-preset-mechanics.ts',
])

const SKIP_DIRECTORIES = new Set([
  'node_modules',
  'dist',
  'coverage',
  'generated',
  'storybook-static',
  '.next',
  '.tmp',
])

const RULES_LITERAL =
  /mode\s*:\s*['"](?:ascending|descending)['"][^}\n]{0,80}base\s*:\s*(?:9|10)\b|base\s*:\s*(?:9|10)\b[^}\n]{0,80}mode\s*:\s*['"](?:ascending|descending)['"]/g

function retiredName(left: string, right: string): string {
  return left + right
}

const BANNED_IDENTIFIERS = new RegExp(
  `\\b(?:${[
    retiredName('DEFAULT_ARMOR_CLASS_', 'BASE'),
    retiredName('DEFAULT_ARMOR_CLASS_', 'MODE'),
    retiredName('ac', 'Base'),
    retiredName('unarmored', 'AcBase'),
  ].join('|')})\\b`,
  'g',
)

function collectSourceFiles(dir: string): string[] {
  const files: string[] = []
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRECTORIES.has(entry)) continue
    const fullPath = join(dir, entry)
    if (statSync(fullPath).isDirectory()) {
      files.push(...collectSourceFiles(fullPath))
      continue
    }
    if (!/\.tsx?$/.test(entry) || entry.endsWith('.d.ts')) continue
    files.push(fullPath)
  }
  return files
}

function isTestFile(relativePath: string): boolean {
  return /\.(?:test|spec)\.tsx?$/.test(relativePath)
}

function scansNumericBases(relativePath: string): boolean {
  if (ALLOWED_NUMERIC_BASE_FILES.has(relativePath)) return false
  if (relativePath.endsWith('.stories.tsx')) return true
  if (relativePath.includes('/fixtures/')) return true
  return !isTestFile(relativePath)
}

describe('armor class base guard', () => {
  const files = SCAN_ROOTS.flatMap((root) => collectSourceFiles(join(repoRoot, root)))

  it('keeps numeric armor class bases in the scale and preset bundles', () => {
    const violations: string[] = []

    for (const file of files) {
      const relativePath = relative(repoRoot, file)
      if (!scansNumericBases(relativePath)) continue
      const source = readFileSync(file, 'utf8')
      for (const match of source.matchAll(RULES_LITERAL)) {
        violations.push(`${relativePath}: ${match[0].replace(/\s+/g, ' ')}`)
      }
    }

    expect(violations).toEqual([])
  })

  it('bans retired armor class base fallbacks', () => {
    const violations: string[] = []

    for (const file of files) {
      const relativePath = relative(repoRoot, file)
      if (ALLOWED_NUMERIC_BASE_FILES.has(relativePath)) continue
      const source = readFileSync(file, 'utf8')
      for (const match of source.matchAll(BANNED_IDENTIFIERS)) {
        violations.push(`${relativePath}: ${match[0]}`)
      }
    }

    expect(violations).toEqual([])
  })
})
