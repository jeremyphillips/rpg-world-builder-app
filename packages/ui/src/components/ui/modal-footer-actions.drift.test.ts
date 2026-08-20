import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

const repoRoot = join(fileURLToPath(new URL('.', import.meta.url)), '../../../../..')

const SCAN_ROOTS = [
  join(repoRoot, 'apps/dashboard/src'),
  join(repoRoot, 'apps/bench/src'),
  join(repoRoot, 'packages/ui/src'),
] as const

const IGNORED_PATH_SEGMENTS = ['node_modules', '.next', 'dist', 'coverage'] as const

const IGNORED_FILES = new Set([
  'modal-footer-actions.drift.test.ts',
  'dialog-panel-footer-migration.test.ts',
  'dialog-panel.variants.ts',
  'dialog-panel.variants.test.ts',
  'dialog-panel-action-row.client.tsx',
  'form-shell-footer.context.tsx',
  'confirm-dialog.client.tsx',
  'sheet.client.tsx',
  'sheet.test.tsx',
  'sheet.stories.tsx',
  'catalog-picker-sheet.client.tsx',
  'builder-option-details-sheet.client.tsx',
  'drawer-shell.client.tsx',
])

const FOOTER_ACTION_GUARD_MARKERS = [
  'Modal.FooterActions',
  'DialogPanelActionRow',
  'FormShellFooterSlot',
  'FormShellFooterContent',
] as const

const FORBIDDEN_MODAL_FOOTER_PATTERNS = [
  /<Modal\.Footer(?!Actions)[^>]*>\s*<Button/m,
  /<Modal\.Footer(?!Actions)[^>]*>\s*<>\s*\n\s*<Button/m,
  /<Modal\.Footer(?!Actions)[\s\S]*?dialogPanelActionRowClasses/m,
] as const

function collectSourceFiles(dir: string, files: string[] = []): string[] {
  if (!existsSync(dir)) return files

  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry)
    if (IGNORED_PATH_SEGMENTS.some((segment) => fullPath.includes(`/${segment}/`))) {
      continue
    }

    const stats = statSync(fullPath)
    if (stats.isDirectory()) {
      collectSourceFiles(fullPath, files)
      continue
    }

    if (/\.(tsx?|jsx?)$/.test(entry) && !IGNORED_FILES.has(entry)) {
      files.push(fullPath)
    }
  }

  return files
}

function hasModalFooterActionGuard(source: string): boolean {
  return FOOTER_ACTION_GUARD_MARKERS.some((marker) => source.includes(marker))
}

function usesModalFooterElement(source: string): boolean {
  return /<Modal\.Footer(?!Actions)/m.test(source)
}

describe('modal footer action layout drift', () => {
  it('requires Modal.FooterActions or DialogPanelActionRow for modal footer buttons', () => {
    const violations: string[] = []

    for (const root of SCAN_ROOTS) {
      for (const file of collectSourceFiles(root)) {
        const source = readFileSync(file, 'utf8')
        if (!usesModalFooterElement(source)) continue

        for (const pattern of FORBIDDEN_MODAL_FOOTER_PATTERNS) {
          if (pattern.test(source)) {
            violations.push(`${relative(repoRoot, file)}: ${pattern}`)
            break
          }
        }

        if (source.includes('dialogPanelActionRowClasses') && !hasModalFooterActionGuard(source)) {
          violations.push(
            `${relative(repoRoot, file)}: dialogPanelActionRowClasses in Modal.Footer context`,
          )
        }
      }
    }

    expect(violations).toEqual([])
  })
})
