import { readdirSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const dashboardSrcRoot = fileURLToPath(new URL('../../', import.meta.url))

const CREATE_SETUP_INTERNAL_SUFFIXES = new Set([
  'create-setup-panel-items.client.tsx',
  'create-setup-panel.client.tsx',
])

/** Drawer relationship kind step — not create-modal decision sequences. */
const COLLAPSIBLE_RADIO_ALLOWLIST_SUFFIXES = new Set(['location-connection-kind-step.client.tsx'])

const CREATE_MODAL_DECISION_SEQUENCE_SUFFIXES = new Set([
  'building-organizations-composer.client.tsx',
  'quick-npc-create-setup-phase.client.tsx',
  'location-create-modal-setup-panel.client.tsx',
])

const FORBIDDEN_COLLAPSIBLE_RADIO_IMPORT_PATTERN =
  /\bCollapsibleRadioCardField\b[\s\S]*?\bfrom ['"]@rpg\/ui['"]/

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

function isCreateModalDecisionSequence(relativePath: string): boolean {
  const suffix = relativePath.split('/').at(-1)
  return suffix != null && CREATE_MODAL_DECISION_SEQUENCE_SUFFIXES.has(suffix)
}

describe('create-setup parallel path drift', () => {
  it('forbids CollapsibleRadioCardField outside create-setup internals and drawer kind steps', () => {
    const offenders: string[] = []

    for (const filePath of collectProductionSourceFiles(dashboardSrcRoot)) {
      const relativePath = relative(dashboardSrcRoot, filePath)
      const source = readFileSync(filePath, 'utf8')
      if (!FORBIDDEN_COLLAPSIBLE_RADIO_IMPORT_PATTERN.test(source)) continue
      if (isAllowedCollapsibleRadioConsumer(relativePath)) continue
      offenders.push(relativePath)
    }

    expect(offenders).toEqual([])
  })

  it('forbids ChooserSummaryCard in create-modal decision sequences', () => {
    const offenders: string[] = []

    for (const filePath of collectProductionSourceFiles(dashboardSrcRoot)) {
      const relativePath = relative(dashboardSrcRoot, filePath)
      if (!isCreateModalDecisionSequence(relativePath)) continue
      const source = readFileSync(filePath, 'utf8')
      if (!FORBIDDEN_CHOOSER_SUMMARY_IMPORT_PATTERN.test(source)) continue
      offenders.push(relativePath)
    }

    expect(offenders).toEqual([])
  })
})
