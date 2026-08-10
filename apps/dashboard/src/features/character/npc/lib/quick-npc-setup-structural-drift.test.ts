import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const quickNpcCreateModalPath = fileURLToPath(
  new URL('../components/quick-npc-create-modal.client.tsx', import.meta.url),
)

describe('quick-npc setup structural drift', () => {
  it('composes setup exclusively through shared create-setup sets', () => {
    const source = readFileSync(quickNpcCreateModalPath, 'utf8')

    expect(source).toContain('CreateSetupPanel')
    expect(source).toContain('buildQuickNpcCreateSetupSets')
    expect(source).not.toMatch(/buildQuickNpcSetupFields/)
    expect(source).not.toMatch(/<Form/)
    expect(source).not.toMatch(/from '@rpg\/ui\/form'/)
  })
})
