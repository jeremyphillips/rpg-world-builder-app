import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'
import { describe, expect, it, vi } from 'vitest'

import { OrganizationMembershipTitleField } from './organization-membership-title-field.client'
import { ORGANIZATION_MEMBERSHIP_NO_TITLE_VALUE } from './organization-membership-title-field.types'

describe('OrganizationMembershipTitleField', () => {
  it('emits selected title values including No title', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()

    render(
      <OrganizationMembershipTitleField
        kind="occupational"
        value={ORGANIZATION_MEMBERSHIP_NO_TITLE_VALUE}
        onValueChange={onValueChange}
        idPrefix="membership-title"
      />,
    )

    expect(screen.getByRole('radio', { name: 'No title' })).toBeChecked()
    await user.click(screen.getByRole('radio', { name: 'Guildmaster' }))
    expect(onValueChange).toHaveBeenCalledWith('Guildmaster')
  })

  it('shows an unrecognized current value as a selectable option', () => {
    render(
      <OrganizationMembershipTitleField
        kind="occupational"
        value="Custom Chronicler"
        onValueChange={vi.fn()}
        idPrefix="membership-title"
      />,
    )

    expect(screen.getByRole('radio', { name: 'Custom Chronicler' })).toBeChecked()
  })

  itAxe('has no axe accessibility violations', async () => {
    const { container } = render(
      <OrganizationMembershipTitleField
        kind="occupational"
        value={ORGANIZATION_MEMBERSHIP_NO_TITLE_VALUE}
        onValueChange={vi.fn()}
        idPrefix="membership-title"
      />,
    )
    await expectNoAxeViolations(container)
  })
})
