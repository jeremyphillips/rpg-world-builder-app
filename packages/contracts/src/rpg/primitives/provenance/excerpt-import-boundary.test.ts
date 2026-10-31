import { readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../../../..')

function sourceFiles(directory: string): string[] {
  const files: string[] = []
  for (const entry of readdirSync(directory)) {
    if (entry === 'node_modules' || entry === 'dist') continue
    const filePath = path.join(directory, entry)
    if (statSync(filePath).isDirectory()) files.push(...sourceFiles(filePath))
    else if (/\.(ts|tsx)$/.test(entry)) files.push(filePath)
  }
  return files
}

describe('excerpt store import boundary', () => {
  it('keeps runtime and dashboard modules from importing the source excerpt store', () => {
    const roots = [
      path.join(repoRoot, 'packages/contracts/src/rpg/runtime'),
      path.join(repoRoot, 'apps/dashboard/src'),
    ]
    const offenders = roots.flatMap(sourceFiles).filter((filePath) => {
      const source = readFileSync(filePath, 'utf8')
      return source.includes('@rpg/catalog/source-excerpts') || source.includes('source-excerpts/')
    })
    expect(offenders).toEqual([])
  })
})
