import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

import { ALLOWED_ALPHA_UTILITIES } from './alpha-utility-allowlist'

const repoRoot = join(fileURLToPath(import.meta.url), '../../../../../..')

const SCAN_ROOTS = [
  join(repoRoot, 'packages/ui/src'),
  join(repoRoot, 'apps/dashboard/src'),
  join(repoRoot, 'apps/bench/src'),
  join(repoRoot, 'apps/public/src'),
]

const SCAN_EXTENSIONS = new Set(['.ts', '.tsx'])

/** Policy groups — any match must be an exact allowlist utility (variant prefix included). */
const BANNED_ALPHA_PATTERNS: RegExp[] = [
  /\b(?:[\w-]+:)*bg-muted\/[\w-[\]%]+/g,
  /\b(?:[\w-]+:)*bg-accent\/[\w-[\]%]+/g,
  /\b(?:[\w-]+:)*bg-secondary\/[\w-[\]%]+/g,
  /\b(?:[\w-]+:)*border-border\/[\w-[\]%]+/g,
  /\b(?:[\w-]+:)*border-muted\/[\w-[\]%]+/g,
  /\b(?:[\w-]+:)*bg-(?:destructive|info|success|warning|primary)-subtle\/[\w-[\]%]+/g,
  /\b(?:[\w-]+:)*border-(?:destructive|info|success|warning|neutral)-muted\/[\w-[\]%]+/g,
  /\b(?:[\w-]+:)*bg-(?:destructive|info|success|warning)\/[\w-[\]%]+/g,
  /\b(?:[\w-]+:)*bg-primary\/[\w-[\]%]+/g,
]

function collectSourceFiles(dir: string, files: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry)
    const stat = statSync(fullPath)
    if (stat.isDirectory()) {
      if (entry === 'node_modules' || entry === 'dist') continue
      collectSourceFiles(fullPath, files)
      continue
    }
    if (!SCAN_EXTENSIONS.has(entry.slice(entry.lastIndexOf('.')))) continue
    if (!entry.endsWith('.variants.ts') && !entry.endsWith('.tsx') && !entry.endsWith('.ts')) {
      continue
    }
    files.push(fullPath)
  }
  return files
}

function findBannedAlphaUtilities(content: string): string[] {
  const violations = new Set<string>()

  for (const pattern of BANNED_ALPHA_PATTERNS) {
    const matches = content.matchAll(pattern)
    for (const match of matches) {
      const utility = match[0]!
      if (!ALLOWED_ALPHA_UTILITIES.has(utility)) {
        violations.add(utility)
      }
    }
  }

  return [...violations].sort()
}

describe('alpha utility ban', () => {
  const files = SCAN_ROOTS.flatMap((root) => collectSourceFiles(root))

  it('scans UI variant and component sources', () => {
    expect(files.length).toBeGreaterThan(100)
  })

  it('does not use banned opacity stacks outside the exact allowlist', () => {
    const failures: string[] = []

    for (const file of files) {
      const content = readFileSync(file, 'utf8')
      const violations = findBannedAlphaUtilities(content)
      if (violations.length > 0) {
        failures.push(`${relative(repoRoot, file)}: ${violations.join(', ')}`)
      }
    }

    expect(
      failures,
      `Banned /NN utilities found — use surface/border ladder or interaction recipes, or add an exact allowlist entry in alpha-utility-allowlist.ts:\n${failures.join('\n')}`,
    ).toEqual([])
  })
})
