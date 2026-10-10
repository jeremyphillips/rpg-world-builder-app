import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

const DASHBOARD_SRC = fileURLToPath(new URL('../../', import.meta.url))

const FORBIDDEN = [
  /text-sm font-medium/,
  /font-medium text-sm/,
  /text-sm text-muted-foreground/,
  /text-muted-foreground text-sm/,
  /text-xs text-muted-foreground/,
  /text-muted-foreground text-xs/,
]

function collect(directory: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const absolutePath = join(directory, entry.name)
    if (entry.isDirectory()) {
      collect(absolutePath, acc)
      continue
    }
    if (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) acc.push(absolutePath)
  }
  return acc
}

describe('text-style stack ratchet', () => {
  it('keeps dashboard copy on text-style composites instead of the retired stacks', () => {
    const hits: string[] = []
    for (const file of collect(DASHBOARD_SRC)) {
      if (file.endsWith('text-style-stack-ratchet.test.ts')) continue
      const source = readFileSync(file, 'utf8')
      for (const pattern of FORBIDDEN) {
        if (pattern.test(source)) hits.push(file)
      }
    }
    expect(hits).toEqual([])
  })
})
