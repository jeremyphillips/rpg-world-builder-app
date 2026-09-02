import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { EntityReplacementCurrentField } from '../entity-replacement-current-field'

describe('EntityReplacementCurrentField', () => {
  it('renders label and entity context in a sunken inset panel', () => {
    const { container } = render(
      <EntityReplacementCurrentField
        label="Current location"
        entity={{
          heading: "Thieves' Guildhouse",
          headingSuffix: ' · Building · Guildhall',
          supportingText: 'Located in Dock Ward',
        }}
      />,
    )

    expect(screen.getByText('Current location')).toBeInTheDocument()
    expect(screen.getByText("Thieves' Guildhouse")).toBeInTheDocument()
    expect(screen.getByText('Building · Guildhall')).toBeInTheDocument()
    expect(screen.getByText('Located in Dock Ward')).toHaveClass('text-xs')
    expect(container.querySelector('.bg-sunken')).toBeInTheDocument()
  })
})
