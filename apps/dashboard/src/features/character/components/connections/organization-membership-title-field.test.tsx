import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { OrganizationMembershipTitleField } from './organization-membership-title-field'

const sampleCatalog = [
  { id: 'omt_1', label: 'Guildmaster', priority: 50 as const },
  { id: 'omt_2', label: 'Member', priority: 20 as const },
]

describe('OrganizationMembershipTitleField', () => {
  it('renders catalog titles only', () => {
    render(
      <OrganizationMembershipTitleField
        titles={sampleCatalog}
        value={undefined}
        onValueChange={() => undefined}
        idPrefix="test"
      />,
    )

    expect(screen.queryByLabelText('No title')).not.toBeInTheDocument()
    expect(screen.getByLabelText('Guildmaster')).toBeInTheDocument()
    expect(screen.getByLabelText('Member')).toBeInTheDocument()
  })

  it('calls onValueChange when a title is selected', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()

    render(
      <OrganizationMembershipTitleField
        titles={sampleCatalog}
        value={undefined}
        onValueChange={onValueChange}
        idPrefix="test"
      />,
    )

    await user.click(screen.getByLabelText('Guildmaster'))
    expect(onValueChange).toHaveBeenCalledWith('omt_1')
  })
})
