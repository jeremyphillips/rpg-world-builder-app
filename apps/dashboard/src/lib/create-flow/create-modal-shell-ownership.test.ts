import { readdirSync, readFileSync } from 'node:fs'
import { extname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

const FEATURES_ROOT = fileURLToPath(new URL('../../features', import.meta.url))

function createModalClientFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) return createModalClientFiles(path)
    if (extname(entry.name) !== '.tsx' || !entry.name.includes('create-modal.client')) return []
    return [path]
  })
}

describe('create modal shell ownership', () => {
  it('keeps feature create modals from constructing local Modal.Content shells', () => {
    const violations = createModalClientFiles(FEATURES_ROOT).filter((path) =>
      readFileSync(path, 'utf8').includes('Modal.Content'),
    )

    expect(violations).toEqual([])
  })
})
