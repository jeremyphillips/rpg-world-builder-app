import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'
import { createDefaultCharacterLifecycle } from '@rpg/contracts'

import { CharacterIdentityLifecycleSummary } from './character-identity-lifecycle-summary.client'

describe('CharacterIdentityLifecycleSummary', () => {
  it('renders roster and vital labels', () => {
    const { getByText } = render(
      <CharacterIdentityLifecycleSummary lifecycle={createDefaultCharacterLifecycle()} />,
    )

    expect(getByText('Roster: Active')).toBeInTheDocument()
    expect(getByText('Vital: Alive')).toBeInTheDocument()
  })

  it('has no axe violations', async () => {
    const { container } = render(
      <CharacterIdentityLifecycleSummary lifecycle={createDefaultCharacterLifecycle()} />,
    )

    await expectNoAxeViolations(container)
  })
})
