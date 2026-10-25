import { readFileSync } from 'node:fs'
import { join, relative } from 'node:path'

import {
  findStylingIndirectionInSource,
  stylingIndirectionHitKey,
  type StylingIndirectionHit,
} from './semantic-styling-indirection.lib'
import { collectSourceTreeFiles } from './source-tree-walk.lib'

/** Production roots. Stories and tests are impact, not definitions. */
export const STYLING_INDIRECTION_SCAN_ROOTS = [
  'packages/ui/src',
  'apps/dashboard/src',
  'apps/bench/src',
  'apps/public/src',
  'packages/campaign-invite/src',
] as const

/**
 * Story-only variants modules. Not production patterns:
 * `packages/ui/src/stories/design-tokens/color-palette.variants.ts`
 * `apps/dashboard/src/stories/card-recipes/card-recipes.variants.ts`
 */
const PRODUCTION_PATH_EXCLUSIONS = [
  /\.(?:test|spec|stories)\.[cm]?tsx?$/,
  /\/__tests__\//,
  /\/__stories__\//,
  /\/stories\//,
]

function isProductionSource(relativePath: string): boolean {
  return !PRODUCTION_PATH_EXCLUSIONS.some((pattern) => pattern.test(relativePath))
}

export function loadStylingIndirectionAllowlist(allowlistPath: string): Set<string> {
  const entries = JSON.parse(readFileSync(allowlistPath, 'utf8')) as string[]
  return new Set(entries)
}

/** `file:symbol` — violation type is not part of a permanent exception. */
export function stylingIndirectionAllowlistKey(hit: StylingIndirectionHit): string {
  return `${hit.filePath}:${hit.symbol}`
}

export { stylingIndirectionHitKey }

/** Walk production roots and collect indirection hits, excluding permanent exceptions. */
export function collectStylingIndirectionHits(
  repoRoot: string,
  allowlist: ReadonlySet<string> = new Set(),
): StylingIndirectionHit[] {
  const hits: StylingIndirectionHit[] = []

  for (const root of STYLING_INDIRECTION_SCAN_ROOTS) {
    const absoluteRoot = join(repoRoot, root)
    for (const filePath of collectSourceTreeFiles(absoluteRoot)) {
      const relativePath = relative(repoRoot, filePath)
      if (!isProductionSource(relativePath)) continue
      const sourceText = readFileSync(filePath, 'utf8')
      for (const hit of findStylingIndirectionInSource(relativePath, sourceText)) {
        if (allowlist.has(stylingIndirectionAllowlistKey(hit))) continue
        hits.push(hit)
      }
    }
  }

  return hits.sort(
    (a, b) =>
      a.filePath.localeCompare(b.filePath) ||
      a.symbol.localeCompare(b.symbol) ||
      a.violationType.localeCompare(b.violationType),
  )
}
