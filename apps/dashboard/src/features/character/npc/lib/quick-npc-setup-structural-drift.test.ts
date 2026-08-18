import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const quickNpcCreateModalPath = fileURLToPath(
  new URL('../components/quick-npc-create-modal.client.tsx', import.meta.url),
)
const quickNpcCreateSetupPhasePath = fileURLToPath(
  new URL('../components/quick-npc-create-setup-phase.client.tsx', import.meta.url),
)

describe('quick-npc setup structural drift', () => {
  it('composes setup through shared create-setup sets and the setup phase shell', () => {
    const modalSource = readFileSync(quickNpcCreateModalPath, 'utf8')
    const setupPhaseSource = readFileSync(quickNpcCreateSetupPhasePath, 'utf8')

    expect(modalSource).toContain('QuickNpcCreateSetupPhase')
    expect(modalSource).not.toMatch(/buildQuickNpcFormFields/)
    expect(modalSource).not.toMatch(/<TabbedForm/)
    expect(modalSource).not.toMatch(/<Form[\s/>]/)
    expect(modalSource).toMatch(/FormShellFooterScope/)

    expect(setupPhaseSource).toContain('CreateSetupPanel')
    expect(setupPhaseSource).toContain('QuickNpcBuildCard')
    expect(setupPhaseSource).toContain('buildQuickNpcCreateSetupSets')
  })
})
