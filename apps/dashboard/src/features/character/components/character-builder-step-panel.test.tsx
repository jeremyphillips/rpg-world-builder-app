import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'

import { CharacterBuilderStepPanel } from './character-builder-step-panel.client'

describe('CharacterBuilderStepPanel', () => {
  it('describes deferred proficiency choices', () => {
    render(<CharacterBuilderStepPanel stepId="proficiencies" status="deferred" />)

    expect(screen.getByRole('heading', { name: 'Proficiencies' })).toBeInTheDocument()
    expect(screen.getByText(/Proficiency and equipment choices arrive/i)).toBeInTheDocument()
  })

  it('marks spells as skipped for non-casters in MVP-A', () => {
    render(<CharacterBuilderStepPanel stepId="spells" status="deferred" />)

    expect(screen.getByText(/Spell selection is not required/i)).toBeInTheDocument()
  })

  it('has no axe accessibility violations', async () => {
    const { container } = render(<CharacterBuilderStepPanel stepId="equipment" status="deferred" />)
    await expectNoAxeViolations(container)
  })
})
