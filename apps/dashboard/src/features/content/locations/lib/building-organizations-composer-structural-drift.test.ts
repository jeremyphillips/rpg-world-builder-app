import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const composerPath = fileURLToPath(
  new URL('../components/building-organizations-composer.client.tsx', import.meta.url),
)

describe('building organizations composer structural drift', () => {
  it('uses create-modal setup summary grammar instead of legacy selected-card chrome', () => {
    const source = readFileSync(composerPath, 'utf8')

    expect(source).toContain('SelectionSummaryCard')
    expect(source).toContain('RadioCardField')
    expect(source).not.toContain('ChooserSummaryCard')
    expect(source).not.toContain('CollapsibleRadioCardField')
    expect(source).not.toContain('LocationConnectionKindStep')
  })
})
