import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { QuickNpcStartingChoiceSelectedRow } from './quick-npc-starting-choice-selected-row'

describe('QuickNpcStartingChoiceSelectedRow', () => {
  it('renders owned compatibility status without changing the description', () => {
    render(
      <QuickNpcStartingChoiceSelectedRow
        label="Greatsword"
        suggestionHint="2 total · Fighter package ×1"
        status={[{ kind: 'badge', label: 'Not proficient', tone: 'warning', appearance: 'soft' }]}
        onRemove={() => undefined}
      />,
    )
    expect(screen.getByText('2 total · Fighter package ×1')).toBeTruthy()
    expect(screen.getByText('Not proficient')).toBeTruthy()
  })
})
