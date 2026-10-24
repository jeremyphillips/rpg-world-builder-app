import { readFileSync } from 'node:fs'
import { join, relative } from 'node:path'

import { collectSourceTreeFiles } from './source-tree-walk.lib'
import {
  findTailwindCustomPropertyDeclarationsInSource,
  type CustomPropertyDeclarationCounts,
} from './tailwind-custom-property-declaration.lib'

export const TAILWIND_CUSTOM_PROPERTY_DECLARATION_SCAN_ROOTS = [
  'packages/ui/src',
  'apps/dashboard/src',
  'apps/bench/src',
] as const

/** Ratchet implementation files (contain illustrative patterns). */
const SCAN_SKIP_RELATIVE_FILES = new Set([
  'packages/ui/src/styles/tailwind-custom-property-declaration.lib.ts',
  'packages/ui/src/styles/tailwind-custom-property-declaration.roots.lib.ts',
])

export function collectTailwindCustomPropertyDeclarationCounts(
  repoRoot: string,
): CustomPropertyDeclarationCounts {
  const byFile: CustomPropertyDeclarationCounts = {}

  for (const root of TAILWIND_CUSTOM_PROPERTY_DECLARATION_SCAN_ROOTS) {
    const absoluteRoot = join(repoRoot, root)
    for (const filePath of collectSourceTreeFiles(absoluteRoot)) {
      const sourceText = readFileSync(filePath, 'utf8')
      const relativePath = relative(repoRoot, filePath)
      if (SCAN_SKIP_RELATIVE_FILES.has(relativePath)) continue
      const counts = findTailwindCustomPropertyDeclarationsInSource(sourceText)
      if (Object.keys(counts).length > 0) {
        byFile[relativePath] = counts
      }
    }
  }

  return byFile
}
