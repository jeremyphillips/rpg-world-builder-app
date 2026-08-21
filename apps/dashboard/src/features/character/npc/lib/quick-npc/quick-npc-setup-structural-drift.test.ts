import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const quickNpcCreateModalPath = fileURLToPath(
  new URL('../../components/quick-npc/quick-npc-create-modal.tsx', import.meta.url),
)
const quickNpcCreateSetupPhasePath = fileURLToPath(
  new URL('../../components/quick-npc/quick-npc-create-setup-phase.tsx', import.meta.url),
)

describe('quick-npc setup structural drift', () => {
  it('composes setup through shared create-setup sets and the setup phase shell', () => {
    const modalSource = readFileSync(quickNpcCreateModalPath, 'utf8')
    const setupPhaseSource = readFileSync(quickNpcCreateSetupPhasePath, 'utf8')

    expect(modalSource).toContain('QuickNpcCreateSetupPhase')
    expect(modalSource).toContain('buildQuickNpcCreateSetupSets')
    expect(modalSource).toContain('useCreateSetupSequence')
    expect(modalSource).toContain('CreateSetupFooter')
    expect(modalSource).not.toMatch(/buildQuickNpcFormFields/)
    expect(modalSource).not.toMatch(/<TabbedForm/)
    expect(modalSource).not.toMatch(/<Form[\s/>]/)
    expect(modalSource).toMatch(/FormShellFooterScope/)

    expect(setupPhaseSource).toContain('CreateSetupPanel')
    expect(setupPhaseSource).toContain('QuickNpcBuildCard')
  })
})
