import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

import {
  findStylingIndirectionInSource,
  type StylingIndirectionHit,
} from './semantic-styling-indirection.lib'

const SKIP_DIR_NAMES = new Set(['node_modules', 'dist', '__tests__'])

export const STYLING_INDIRECTION_SCAN_ROOTS = [
  'packages/ui/src/components',
  'packages/ui/src/form',
  'apps/dashboard/src/features/content/lib/entity',
  'apps/dashboard/src/lib/overview',
] as const

/** W11 migrated filter modules — not under `components/` scan roots. */
export const STYLING_INDIRECTION_EXTRA_FILES = [
  'packages/ui/src/filters/filter-bar.variants.ts',
  'packages/ui/src/filters/catalog-filter-controls.client.tsx',
  'packages/ui/src/filters/filter-advanced-panel-body.client.tsx',
  'packages/ui/src/filters/filter-advanced-panel-header.client.tsx',
] as const

function collectSourceFiles(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry)
    const stat = statSync(fullPath)
    if (stat.isDirectory()) {
      if (SKIP_DIR_NAMES.has(entry)) continue
      collectSourceFiles(fullPath, acc)
      continue
    }
    if (!/\.(ts|tsx)$/.test(entry)) continue
    if (/\.(test|stories)\./.test(entry)) continue
    acc.push(fullPath)
  }
  return acc
}

export function stylingIndirectionHitKey(hit: StylingIndirectionHit): string {
  return `${hit.filePath}:${hit.line}:${hit.message}`
}

/** Walk declared migration roots and collect indirection hits (not repository-wide). */
export function collectStylingIndirectionHits(repoRoot: string): StylingIndirectionHit[] {
  const hits: StylingIndirectionHit[] = []

  for (const root of STYLING_INDIRECTION_SCAN_ROOTS) {
    const absoluteRoot = join(repoRoot, root)
    for (const filePath of collectSourceFiles(absoluteRoot)) {
      const sourceText = readFileSync(filePath, 'utf8')
      const relativePath = relative(repoRoot, filePath)
      hits.push(...findStylingIndirectionInSource(relativePath, sourceText))
    }
  }

  for (const relativePath of STYLING_INDIRECTION_EXTRA_FILES) {
    const filePath = join(repoRoot, relativePath)
    const sourceText = readFileSync(filePath, 'utf8')
    hits.push(...findStylingIndirectionInSource(relativePath, sourceText))
  }

  return hits.sort(
    (a, b) =>
      a.filePath.localeCompare(b.filePath) || a.line - b.line || a.message.localeCompare(b.message),
  )
}
