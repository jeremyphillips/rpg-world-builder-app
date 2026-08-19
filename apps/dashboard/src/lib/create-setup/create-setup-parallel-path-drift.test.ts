import { readdirSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const dashboardSrcRoot = fileURLToPath(new URL('../../', import.meta.url))

const CREATE_SETUP_INTERNAL_SUFFIXES = new Set([
  'create-setup-panel-items.client.tsx',
  'create-setup-panel.client.tsx',
])

/**
 * Documented exceptions — relationship/kind flows that wrap CollapsibleRadioCardField or
 * ChooserSummaryCard instead of create-setup orchestration.
 */
const COLLAPSIBLE_RADIO_ALLOWLIST_SUFFIXES = new Set(['location-connection-kind-step.client.tsx'])

const CHOOSER_SUMMARY_ALLOWLIST_SUFFIXES = new Set([
  'building-organizations-composer.client.tsx',
  'location-connection-kind-step.client.tsx',
])

const FORBIDDEN_RADIO_IMPORT_PATTERN =
  /\b(CollapsibleRadioCardField|RadioCardField)\b[\s\S]*?\bfrom ['"]@rpg\/ui['"]/

const FORBIDDEN_CHOOSER_SUMMARY_IMPORT_PATTERN =
  /\bChooserSummaryCard\b[\s\S]*?\bfrom ['"]@rpg\/ui['"]/

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
    if (!entry.name.includes('create')) continue

    files.push(absolutePath)
  }

  return files
}

function isAllowedCollapsibleRadioConsumer(relativePath: string): boolean {
  const suffix = relativePath.split('/').at(-1)
  if (!suffix) return false
  if (CREATE_SETUP_INTERNAL_SUFFIXES.has(suffix)) return true
  if (COLLAPSIBLE_RADIO_ALLOWLIST_SUFFIXES.has(suffix)) return true
  return false
}

function isAllowedChooserSummaryConsumer(relativePath: string): boolean {
  const suffix = relativePath.split('/').at(-1)
  if (!suffix) return false
  if (CHOOSER_SUMMARY_ALLOWLIST_SUFFIXES.has(suffix)) return true
  return false
}

describe('create-setup parallel path drift', () => {
  it('keeps sequenced create setup on create-setup orchestration unless allowlisted', () => {
    const offenders: string[] = []

    for (const filePath of collectProductionSourceFiles(dashboardSrcRoot)) {
      const relativePath = relative(dashboardSrcRoot, filePath)
      const source = readFileSync(filePath, 'utf8')
      if (!FORBIDDEN_RADIO_IMPORT_PATTERN.test(source)) continue
      if (isAllowedCollapsibleRadioConsumer(relativePath)) continue
      offenders.push(relativePath)
    }

    expect(offenders).toEqual([])
  })

  it('forbids ChooserSummaryCard in create paths except documented relationship composers', () => {
    const offenders: string[] = []

    for (const filePath of collectProductionSourceFiles(dashboardSrcRoot)) {
      const relativePath = relative(dashboardSrcRoot, filePath)
      const source = readFileSync(filePath, 'utf8')
      if (!FORBIDDEN_CHOOSER_SUMMARY_IMPORT_PATTERN.test(source)) continue
      if (isAllowedChooserSummaryConsumer(relativePath)) continue
      offenders.push(relativePath)
    }

    expect(offenders).toEqual([])
  })
})
