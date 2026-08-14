import { readdirSync, readFileSync } from 'node:fs'
import { extname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

const FEATURES_ROOT = fileURLToPath(new URL('../../features', import.meta.url))
const CREATE_FLOW_ROOT = fileURLToPath(new URL('.', import.meta.url))

const MODAL_HEIGHT_TOKEN_PATTERN =
  /modalStable(?:Tall)?BlockSizeClasses|h-\[min\(|max-h-\[85vh\]|max-h-\[90vh\]|40rem|48rem/

function collectSourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) return collectSourceFiles(path)
    if (!['.ts', '.tsx'].includes(extname(entry.name))) return []
    if (entry.name.includes('.test.')) return []
    return [path]
  })
}

function createModalClientFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) return createModalClientFiles(path)
    if (extname(entry.name) !== '.tsx' || !entry.name.includes('create-modal.client')) return []
    return [path]
  })
}

function findModalHeightViolations(files: readonly string[]): string[] {
  return files.filter((path) => {
    const source = readFileSync(path, 'utf8')
    if (!MODAL_HEIGHT_TOKEN_PATTERN.test(source)) return false

    // CreateModalShell is the sole owner — stableSize selection is allowed there.
    if (path.endsWith('create-modal-shell.client.tsx')) return false

    return true
  })
}

describe('create modal shell ownership', () => {
  it('keeps feature create modals from constructing local Modal.Content shells', () => {
    const violations = createModalClientFiles(FEATURES_ROOT).filter((path) =>
      readFileSync(path, 'utf8').includes('Modal.Content'),
    )

    expect(violations).toEqual([])
  })

  it('keeps modal height geometry owned by @rpg/ui (no app-local height tokens)', () => {
    const createFlowFiles = collectSourceFiles(CREATE_FLOW_ROOT)
    const featureCreateModalFiles = createModalClientFiles(FEATURES_ROOT)
    const violations = findModalHeightViolations([...createFlowFiles, ...featureCreateModalFiles])

    expect(violations).toEqual([])
  })
})
