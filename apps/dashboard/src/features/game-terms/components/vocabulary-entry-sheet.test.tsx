import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { renderWithProviders } from '@/test/render'

import { VocabularyEntrySheet } from './vocabulary-entry-sheet'

describe('VocabularyEntrySheet', () => {
  it('renders a fresh create form with the campaign helper line', () => {
    renderWithProviders(
      <VocabularyEntrySheet
        open
        onOpenChange={vi.fn()}
        mode="create"
        campaignId="camp_1"
        setId="creature-types"
        createHeadline="Add creature type"
        isPending={false}
        onSubmit={vi.fn()}
      />,
    )

    expect(screen.getByRole('dialog', { name: 'Add creature type' })).toBeInTheDocument()
    expect(
      screen.getByText('Custom entries appear as Custom in this campaign.'),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Create' })).toBeInTheDocument()
  })

  it('renders an edit session with save affordances', () => {
    renderWithProviders(
      <VocabularyEntrySheet
        open
        onOpenChange={vi.fn()}
        mode="edit"
        campaignId="camp_1"
        setId="creature-types"
        createHeadline="Add creature type"
        entry={{
          id: 'fey-kin',
          label: 'Fey Kin',
          description: 'Otherworldly ancestry.',
          source: 'campaign',
          status: 'active',
          usedBy: 0,
        }}
        isPending={false}
        onSubmit={vi.fn()}
      />,
    )

    expect(screen.getByRole('dialog', { name: 'Edit Fey Kin' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
    expect(screen.getByDisplayValue('Fey Kin')).toBeInTheDocument()
  })

  it('disables submit while pending', () => {
    renderWithProviders(
      <VocabularyEntrySheet
        open
        onOpenChange={vi.fn()}
        mode="create"
        campaignId="camp_1"
        setId="creature-types"
        createHeadline="Add creature type"
        isPending
        onSubmit={vi.fn()}
      />,
    )

    expect(screen.getByRole('button', { name: 'Create' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled()
  })

  it('submits create values through the parent callback', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()

    renderWithProviders(
      <VocabularyEntrySheet
        open
        onOpenChange={vi.fn()}
        mode="create"
        campaignId="camp_1"
        setId="creature-types"
        createHeadline="Add creature type"
        isPending={false}
        onSubmit={onSubmit}
      />,
    )

    await user.type(screen.getByRole('textbox', { name: 'Name' }), 'Construct')
    await user.click(screen.getByRole('button', { name: 'Create' }))

    expect(onSubmit).toHaveBeenCalledWith({
      label: 'Construct',
      description: '',
      status: 'active',
    })
  })
})
