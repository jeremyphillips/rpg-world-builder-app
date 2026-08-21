import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createEmptyCharacterBuilderDraft } from '@rpg/contracts'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'
import { describe, expect, it, vi } from 'vitest'

import { createStandaloneBuilderContextFixture } from '../../../../lib/fixtures/character-builder-fixtures'
import { cityCouncil, lanternGuild } from '../../../connections/organization-picker-drawer.fixtures'
import { ConnectionsStep } from './connections-step.client'

const context = createStandaloneBuilderContextFixture({
  catalog: {
    ...createStandaloneBuilderContextFixture().catalog,
    organizations: [lanternGuild, cityCouncil],
  },
})

describe('ConnectionsStep', () => {
  it('adds titled memberships and removes them from the summary', async () => {
    const user = userEvent.setup()
    const onDraftChange = vi.fn()
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      connections: {
        organizations: [{ organizationId: lanternGuild.id, title: 'Guildmaster' }],
        locations: [],
      },
    }

    render(
      <ConnectionsStep
        context={context}
        draft={draft}
        validationIssues={[]}
        onDraftChange={onDraftChange}
      />,
    )

    expect(screen.getByText('Lantern Guild')).toBeInTheDocument()
    expect(screen.getByText('Guildmaster')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Remove Lantern Guild' }))
    expect(onDraftChange).toHaveBeenCalledWith({
      connections: { organizations: [], locations: [] },
    })

    await user.click(screen.getByRole('button', { name: '+ Add organization' }))
    await user.click(screen.getByRole('button', { name: 'Add' }))
    expect(onDraftChange).not.toHaveBeenCalledWith(
      expect.objectContaining({
        connections: expect.objectContaining({
          organizations: expect.arrayContaining([
            expect.objectContaining({ organizationId: cityCouncil.id }),
          ]),
        }),
      }),
    )
    await user.click(screen.getByRole('button', { name: 'Add organization' }))
    expect(onDraftChange).toHaveBeenCalledWith({
      connections: {
        organizations: [
          { organizationId: lanternGuild.id, title: 'Guildmaster' },
          { organizationId: cityCouncil.id },
        ],
        locations: [],
      },
    })
  })

  it('shows stale selections as recoverable and has no axe violations', async () => {
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      connections: { organizations: [{ organizationId: 'organization-missing' }], locations: [] },
    }
    const { container } = render(
      <ConnectionsStep
        context={context}
        draft={draft}
        validationIssues={[]}
        onDraftChange={vi.fn()}
      />,
    )

    expect(screen.getByText('organization-missing')).toBeInTheDocument()
    expect(screen.getByText('Missing organization')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Remove organization-missing' })).toBeInTheDocument()
    await expectNoAxeViolations(container)
  })

  it('renders the optional empty selection state', () => {
    render(
      <ConnectionsStep
        context={context}
        draft={createEmptyCharacterBuilderDraft()}
        validationIssues={[]}
        onDraftChange={vi.fn()}
      />,
    )

    expect(screen.getByText('No organizations selected yet.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add organization' })).toBeInTheDocument()
  })
})
