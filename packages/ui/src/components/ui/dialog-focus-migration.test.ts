import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

const repoRoot = join(fileURLToPath(new URL('.', import.meta.url)), '../../../../..')

const OBSOLETE_FOCUS_PATTERNS = [
  'modal-focus.lib',
  'data-modal-skip-autofocus',
  'MODAL_INITIAL_FOCUS',
  'handleModalOpenAutoFocus',
  'focusModalInitialTarget',
  'shouldSkipModalAutoFocus',
] as const

const SCAN_ROOTS = [
  join(repoRoot, 'apps/dashboard/src'),
  join(repoRoot, 'apps/bench/src'),
  join(repoRoot, 'packages/ui/src'),
] as const

const IGNORED_PATH_SEGMENTS = ['node_modules', '.next', 'dist', 'coverage'] as const

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

    if (/\.(tsx?|jsx?)$/.test(entry)) {
      if (entry === 'dialog-focus-migration.test.ts') {
        continue
      }
      files.push(fullPath)
    }
  }

  return files
}

describe('dialog focus migration gate', () => {
  it('does not reference deleted modal focus heuristics in product code', () => {
    const violations: string[] = []

    for (const root of SCAN_ROOTS) {
      for (const file of collectSourceFiles(root)) {
        const content = readFileSync(file, 'utf8')
        for (const pattern of OBSOLETE_FOCUS_PATTERNS) {
          if (content.includes(pattern)) {
            violations.push(`${relative(repoRoot, file)}: ${pattern}`)
          }
        }
      }
    }

    expect(violations).toEqual([])
  })
})
