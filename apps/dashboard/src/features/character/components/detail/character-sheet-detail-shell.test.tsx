import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'

import { ROUTES } from '@/app/routes'

import { CHARACTER_SHEET_ERROR_LABELS } from '../../lib/character-sheet-error-labels'
import { CharacterSheetDetailShell } from './character-sheet-detail-shell'

describe('CharacterSheetDetailShell', () => {
  it('renders standalone error copy', () => {
    render(
      <MemoryRouter>
        <CharacterSheetDetailShell
          scope="standalone"
          isPending={false}
          isError
          errorLabel={CHARACTER_SHEET_ERROR_LABELS.standaloneNotFound}
        />
      </MemoryRouter>,
    )

    expect(screen.getByRole('alert')).toHaveTextContent(
      CHARACTER_SHEET_ERROR_LABELS.standaloneNotFound,
    )
  })

  it('renders the campaign heading and error copy without a campaign back link', () => {
    render(
      <MemoryRouter>
        <CharacterSheetDetailShell
          scope="campaign"
          isPending={false}
          isError
          errorLabel={CHARACTER_SHEET_ERROR_LABELS.campaignPermissionDenied}
        />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: 'Campaign character' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'The Argent Road' })).not.toBeInTheDocument()
    expect(screen.getByRole('alert')).toHaveTextContent(
      CHARACTER_SHEET_ERROR_LABELS.campaignPermissionDenied,
    )
  })

  it('renders an optional back link beneath campaign errors', () => {
    render(
      <MemoryRouter>
        <CharacterSheetDetailShell
          scope="campaign"
          errorBackLink={{
            href: ROUTES.campaign.characters.list('camp-1'),
            label: 'My Character',
          }}
          isPending={false}
          isError
          errorLabel={CHARACTER_SHEET_ERROR_LABELS.campaignNotFoundInCampaign}
        />
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: 'Back to My Character' })).toHaveAttribute(
      'href',
      ROUTES.campaign.characters.list('camp-1'),
    )
  })

  it('has no axe accessibility violations for campaign error state', async () => {
    const { container } = render(
      <MemoryRouter>
        <CharacterSheetDetailShell
          scope="campaign"
          isPending={false}
          isError
          errorLabel={CHARACTER_SHEET_ERROR_LABELS.campaignNotFoundInCampaign}
        />
      </MemoryRouter>,
    )

    await expectNoAxeViolations(container)
  })
})
