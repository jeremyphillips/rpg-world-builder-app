import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const FORBIDDEN_EMIT_PATTERN = /deliverToUser\(|io\.to\(/

function collectSourceFiles(directory: string): string[] {
  const entries = readdirSync(directory)
  const files: string[] = []

  for (const entry of entries) {
    const path = join(directory, entry)
    const stats = statSync(path)
    if (stats.isDirectory()) {
      files.push(...collectSourceFiles(path))
      continue
    }
    if (path.endsWith('.ts') && !path.endsWith('.test.ts')) {
      files.push(path)
    }
  }

  return files
}

describe('realtime delivery boundary', () => {
  it('keeps direct Socket.IO emits out of domain features', () => {
    const featuresDir = join(import.meta.dirname, '../features')
    const offenders = collectSourceFiles(featuresDir).filter((file) =>
      FORBIDDEN_EMIT_PATTERN.test(readFileSync(file, 'utf8')),
    )

    expect(offenders).toEqual([])
  })
})
