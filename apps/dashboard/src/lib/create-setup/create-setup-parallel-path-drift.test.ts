import { readdirSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const dashboardSrcRoot = fileURLToPath(new URL('../../', import.meta.url))

const FORBIDDEN_COLLAPSIBLE_RADIO_IMPORT_PATTERN =
  /\bCollapsibleRadioCardField\b[\s\S]*?\bfrom ['"]@rpg\/ui['"]/

const FORBIDDEN_CHOOSER_SUMMARY_IMPORT_PATTERN =
  /\bChooserSummaryCard\b[\s\S]*?\bfrom ['"]@rpg\/ui['"]/

const FORBIDDEN_KIND_STEP_IMPORT_PATTERN =
  /\bLocationConnectionKindStep\b[\s\S]*?\blocation-connection-kind-step\.client['"]/

function collectProductionSourceFiles(directory: string): string[] {
  const entries = readdirSync(directory, { withFileTypes: true })
  const files: string[] = []

  for (const entry of entries) {
    const absolutePath = join(directory, entry.name)
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules') continue
      files.push(...collectProductionSourceFiles(absolutePath))
      continue
    }

    if (!/\.(ts|tsx)$/.test(entry.name)) continue
    if (entry.name.endsWith('.test.ts') || entry.name.endsWith('.test.tsx')) continue
    if (entry.name.endsWith('.stories.tsx')) continue

    files.push(absolutePath)
  }

  return files
}

describe('create-setup parallel path drift', () => {
  it('forbids CollapsibleRadioCardField in dashboard production sources', () => {
    const offenders: string[] = []

    for (const filePath of collectProductionSourceFiles(dashboardSrcRoot)) {
      const relativePath = relative(dashboardSrcRoot, filePath)
      const source = readFileSync(filePath, 'utf8')
      if (!FORBIDDEN_COLLAPSIBLE_RADIO_IMPORT_PATTERN.test(source)) continue
      offenders.push(relativePath)
    }

    expect(offenders).toEqual([])
  })

  it('forbids ChooserSummaryCard in dashboard production sources', () => {
    // ChooserSummaryCard is no longer part of dashboard production decision flows.
    // This scan prevents the deleted identifier from returning. It is not a ban on a
    // future rich-chooser primitive under a new name.
    const offenders: string[] = []

    for (const filePath of collectProductionSourceFiles(dashboardSrcRoot)) {
      const relativePath = relative(dashboardSrcRoot, filePath)
      const source = readFileSync(filePath, 'utf8')
      if (!FORBIDDEN_CHOOSER_SUMMARY_IMPORT_PATTERN.test(source)) continue
      offenders.push(relativePath)
    }

    expect(offenders).toEqual([])
  })

  it('forbids LocationConnectionKindStep in dashboard production sources', () => {
    const offenders: string[] = []

    for (const filePath of collectProductionSourceFiles(dashboardSrcRoot)) {
      const relativePath = relative(dashboardSrcRoot, filePath)
      const source = readFileSync(filePath, 'utf8')
      if (!FORBIDDEN_KIND_STEP_IMPORT_PATTERN.test(source)) continue
      offenders.push(relativePath)
    }

    expect(offenders).toEqual([])
  })
})
