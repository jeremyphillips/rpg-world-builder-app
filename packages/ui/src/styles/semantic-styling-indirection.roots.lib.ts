import { readFileSync } from 'node:fs'
import { join, relative } from 'node:path'

import {
  findStylingIndirectionInSource,
  type StylingIndirectionHit,
} from './semantic-styling-indirection.lib'
import { collectSourceTreeFiles } from './source-tree-walk.lib'

export const STYLING_INDIRECTION_SCAN_ROOTS = [
  'packages/ui/src/components',
  'packages/ui/src/form',
  'apps/dashboard/src/features/content/lib/entity',
  'apps/dashboard/src/lib/overview',
] as const

/** Migrated modules outside the `components/` scan roots. */
export const STYLING_INDIRECTION_EXTRA_FILES = [
  'packages/ui/src/filters/filter-bar.client.tsx',
  'packages/ui/src/filters/filter-bar.variants.ts',
  'packages/ui/src/filters/catalog-filter-controls.client.tsx',
  'packages/ui/src/filters/filter-advanced-panel-body.client.tsx',
  'packages/ui/src/filters/filter-advanced-panel-header.client.tsx',
  'apps/dashboard/src/features/media/components/media-manager/media-gallery.tsx',
  'apps/dashboard/src/features/media/components/media-manager/media-image-details.tsx',
  'apps/dashboard/src/features/media/components/media-manager/media-manager-body-drop-overlay.tsx',
  'apps/dashboard/src/features/media/components/media-manager/media-manager-body.tsx',
  'apps/dashboard/src/features/media/components/media-manager/media-manager-session.lib.ts',
  'apps/dashboard/src/features/media/components/media-manager/media-manager.tsx',
  'apps/dashboard/src/features/media/components/media-manager/media-workspace-editor.lib.ts',
  'apps/dashboard/src/features/media/components/media-manager/media-workspace-selection.tsx',
  'apps/dashboard/src/features/media/components/media-manager/media-workspace.lib.ts',
  'apps/dashboard/src/features/media/components/media-manager/media-workspace.tsx',
] as const

export function stylingIndirectionHitKey(hit: StylingIndirectionHit): string {
  return `${hit.filePath}:${hit.line}:${hit.message}`
}

/** Walk declared migration roots and collect indirection hits (not repository-wide). */
export function collectStylingIndirectionHits(repoRoot: string): StylingIndirectionHit[] {
  const hits: StylingIndirectionHit[] = []

  for (const root of STYLING_INDIRECTION_SCAN_ROOTS) {
    const absoluteRoot = join(repoRoot, root)
    for (const filePath of collectSourceTreeFiles(absoluteRoot)) {
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
