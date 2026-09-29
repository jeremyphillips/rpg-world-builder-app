import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'
import { describe, expect, it, vi } from 'vitest'

import { lanternGuild } from './picker/organization-picker-drawer.fixtures'
import { EditOrganizationMembershipDrawer } from './edit-organization-membership-drawer'

describe('EditOrganizationMembershipDrawer', () => {
  it('saves selected title and closes on success', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn().mockResolvedValue(undefined)
    const onOpenChange = vi.fn()

    render(
      <EditOrganizationMembershipDrawer
        open
        onOpenChange={onOpenChange}
        organization={lanternGuild}
        characterName="Frug Daergel"
        currentMembershipTitleId="omt_guildmaster"
        onSave={onSave}
        onRemove={vi.fn()}
      />,
    )

    expect(
      screen.getByRole('heading', { name: 'Edit organization membership' }),
    ).toBeInTheDocument()
    expect(screen.getByText(/Lantern Guild/)).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'Guildmaster' })).toBeChecked()

    await user.click(screen.getByRole('radio', { name: 'Member' }))
    await user.click(screen.getByRole('button', { name: 'Save changes' }))

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith('omt_member')
      expect(onOpenChange).toHaveBeenCalledWith(false)
    })
  })

  it('preserves config and shows error when save fails', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn().mockRejectedValue(new Error('Save failed'))
    const onOpenChange = vi.fn()

    render(
      <EditOrganizationMembershipDrawer
        open
        onOpenChange={onOpenChange}
        organization={lanternGuild}
        characterName="Frug Daergel"
        currentMembershipTitleId="omt_guildmaster"
        onSave={onSave}
        onRemove={vi.fn()}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Save changes' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Save failed')
    expect(onOpenChange).not.toHaveBeenCalledWith(false)
    expect(screen.getByRole('radio', { name: 'Guildmaster' })).toBeChecked()
  })

  it('confirms removal then closes on success', async () => {
    const user = userEvent.setup()
    const onRemove = vi.fn().mockResolvedValue(undefined)
    const onOpenChange = vi.fn()

    render(
      <EditOrganizationMembershipDrawer
        open
        onOpenChange={onOpenChange}
        organization={lanternGuild}
        characterName="Frug Daergel"
        onSave={vi.fn()}
        onRemove={onRemove}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Remove organization' }))
    expect(
      screen.getByRole('alertdialog', { name: /Remove Frug Daergel from Lantern Guild/ }),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Remove organization' }))

    await waitFor(() => {
      expect(onRemove).toHaveBeenCalled()
      expect(onOpenChange).toHaveBeenCalledWith(false)
    })
  })

  it('clears selection when the stored id is absent from the catalog', () => {
    render(
      <EditOrganizationMembershipDrawer
        open
        onOpenChange={vi.fn()}
        organization={lanternGuild}
        characterName="Frug Daergel"
        currentMembershipTitleId="omt_missing"
        onSave={vi.fn()}
        onRemove={vi.fn()}
      />,
    )

    expect(screen.getByRole('radio', { name: 'Guildmaster' })).not.toBeChecked()
    expect(screen.getByRole('radio', { name: 'Member' })).not.toBeChecked()
  })

  it('resets title selection when reopened for the same membership', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()

    const { rerender } = render(
      <EditOrganizationMembershipDrawer
        open
        onOpenChange={onOpenChange}
        organization={lanternGuild}
        characterName="Frug Daergel"
        currentMembershipTitleId="omt_guildmaster"
        onSave={vi.fn()}
        onRemove={vi.fn()}
      />,
    )

    await user.click(screen.getByRole('radio', { name: 'Member' }))
    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    rerender(
      <EditOrganizationMembershipDrawer
        open
        onOpenChange={onOpenChange}
        organization={lanternGuild}
        characterName="Frug Daergel"
        currentMembershipTitleId="omt_guildmaster"
        onSave={vi.fn()}
        onRemove={vi.fn()}
      />,
    )

    expect(screen.getByRole('radio', { name: 'Guildmaster' })).toBeChecked()
  })

  itAxe('has no axe violations', async () => {
    const { container } = render(
      <EditOrganizationMembershipDrawer
        open
        onOpenChange={vi.fn()}
        organization={lanternGuild}
        characterName="Frug Daergel"
        currentMembershipTitleId="omt_guildmaster"
        onSave={vi.fn()}
        onRemove={vi.fn()}
      />,
    )
    await expectNoAxeViolations(container)
  })
})
