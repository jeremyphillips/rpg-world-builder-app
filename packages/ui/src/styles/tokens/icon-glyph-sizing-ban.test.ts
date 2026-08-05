import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

import { ICON_GLYPH_SIZING_EXEMPT_FILES } from './icon-glyph-sizing-exempt-files'

const repoRoot = join(fileURLToPath(import.meta.url), '../../../../../..')
const scanRoot = join(repoRoot, 'packages/ui/src')

const BANNED_ICON_SIZING_PATTERNS: RegExp[] = [
  /\[(?:&_svg|&>svg)\]:size-(?!icon-glyph)[\w.-]+/g,
  /\bclassName=(?:\{cn\([^)]*\)|"[^"]*)\bsize-[0-9][\w.-]*/g,
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
      const utility = match[0]!
      if (!utility.includes('icon-glyph')) {
        violations.add(utility.slice(0, 80))
      }
    }
  }

  return [...violations].sort()
}

describe('icon glyph sizing ban', () => {
  const files = collectComponentFiles(scanRoot)

  it('scans UI component implementation sources', () => {
    expect(files.length).toBeGreaterThan(50)
  })

  it('forbids raw svg/lucide sizing outside grandfathered files and variant modules', () => {
    const failures: string[] = []

    for (const file of files) {
      const relPath = relative(repoRoot, file)
      if (ICON_GLYPH_SIZING_EXEMPT_FILES.has(relPath)) continue

      const violations = findBannedIconSizing(readFileSync(file, 'utf8'))
      if (violations.length > 0) {
        failures.push(`${relPath}: ${violations.join(', ')}`)
      }
    }

    expect(failures).toEqual([])
  })
})
