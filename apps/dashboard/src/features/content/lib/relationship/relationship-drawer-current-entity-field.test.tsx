import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { RelationshipDrawerCurrentEntityField } from './relationship-drawer-current-entity-field.client'

describe('RelationshipDrawerCurrentEntityField', () => {
  it('renders label, heading, and subheading', () => {
    render(
      <RelationshipDrawerCurrentEntityField
        label="Current location"
        heading="Thieves' Guildhouse"
        subheading="Structure"
      />,
    )

    expect(screen.getByText('Current location')).toBeInTheDocument()
    expect(screen.getByText("Thieves' Guildhouse")).toBeInTheDocument()
    expect(screen.getByText('Structure')).toBeInTheDocument()
  })
})
