import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const indexPath = fileURLToPath(new URL('./index.ts', import.meta.url))

describe('create-flow composition presentation ownership', () => {
  it('exports composition structural primitives from the create-flow barrel', () => {
    const source = readFileSync(indexPath, 'utf8')

    expect(source).toContain('CreateCompositionComposer')
    expect(source).toContain('CreateCompositionSummary')
    expect(source).toContain('CreateCompositionStage')
    expect(source).toContain('createCompositionStageStackClasses')
    expect(source).not.toContain('createTabStageSubheadingClasses')
    expect(source).not.toContain('createTabDiscoveryStackClasses')
    expect(source).not.toContain('createTabComposerStackClasses')
  })
})
