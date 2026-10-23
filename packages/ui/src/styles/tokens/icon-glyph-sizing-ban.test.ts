import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

const repoRoot = join(fileURLToPath(import.meta.url), '../../../../../..')

const SCAN_ROOTS = [
  join(repoRoot, 'packages/ui/src'),
  join(repoRoot, 'apps/dashboard/src'),
  join(repoRoot, 'apps/bench/src'),
] as const

const BANNED_ICON_SIZING_PATTERNS: RegExp[] = [
  /\bsize-icon-glyph-/g,
  /\bsize-icon-inline\b/g,
  /\[(?:&_svg|&>svg)\]:size-/g,
]

function collectComponentFiles(dir: string, files: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry)
    const stat = statSync(fullPath)
    if (stat.isDirectory()) {
      if (entry === 'node_modules' || entry === 'dist') continue
      collectComponentFiles(fullPath, files)
      continue
    }
    if (!entry.endsWith('.tsx')) continue
    if (
      entry.endsWith('.variants.tsx') ||
      entry.endsWith('.stories.tsx') ||
      entry.endsWith('.test.tsx')
    ) {
      continue
    }
    files.push(fullPath)
  }
  return files
}

function findBannedIconSizing(content: string): string[] {
  const violations = new Set<string>()

  for (const pattern of BANNED_ICON_SIZING_PATTERNS) {
    for (const match of content.matchAll(pattern)) {
      violations.add(match[0]!.slice(0, 80))
    }
  }

  const iconClassPattern =
    /<Icon\b[^>]*\bclassName=(?:\{cn\([^)]*\)|"[^"]*)[^>]*\b(?:size-[0-9][\w.-]*|size-icon)/g
  for (const match of content.matchAll(iconClassPattern)) {
    violations.add(match[0]!.slice(0, 80))
  }

  return [...violations].sort()
}

describe('icon glyph sizing ban', () => {
  const files = SCAN_ROOTS.flatMap((root) => collectComponentFiles(root))

  it('scans UI and app component implementation sources', () => {
    expect(files.length).toBeGreaterThan(100)
  })

  it('forbids legacy glyph utilities and raw svg sizing outside variant modules', () => {
    const failures: string[] = []

    for (const file of files) {
      const relPath = relative(repoRoot, file)
      const violations = findBannedIconSizing(readFileSync(file, 'utf8'))
      if (violations.length > 0) {
        failures.push(`${relPath}: ${violations.join(', ')}`)
      }
    }

    expect(failures).toEqual([])
  })
})
