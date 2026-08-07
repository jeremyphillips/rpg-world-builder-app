import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'
import { createDefaultCharacterVitalState } from '@rpg/contracts'

import { CharacterVitalSummary } from './character-vital-summary.client'

describe('CharacterVitalSummary', () => {
  it('renders vital label', () => {
    const { getByText } = render(
      <CharacterVitalSummary vital={createDefaultCharacterVitalState()} />,
    )

    expect(getByText('Vital: Alive')).toBeInTheDocument()
  })

  itAxe('has no axe violations', async () => {
    const { container } = render(
      <CharacterVitalSummary vital={createDefaultCharacterVitalState()} />,
    )

    await expectNoAxeViolations(container)
  })
})
