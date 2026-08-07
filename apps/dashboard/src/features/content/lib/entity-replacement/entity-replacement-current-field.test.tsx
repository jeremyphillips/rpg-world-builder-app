import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { EntityReplacementCurrentField } from './entity-replacement-current-field.client'

describe('EntityReplacementCurrentField', () => {
  it('renders label, heading, and subheading in a sunken inset panel', () => {
    const { container } = render(
      <EntityReplacementCurrentField
        label="Current location"
        heading="Thieves' Guildhouse"
        subheading="Structure"
      />,
    )

    expect(screen.getByText('Current location')).toBeInTheDocument()
    expect(screen.getByText("Thieves' Guildhouse")).toBeInTheDocument()
    expect(screen.getByText('Structure')).toBeInTheDocument()
    expect(container.querySelector('.bg-sunken')).toBeInTheDocument()
  })
})
