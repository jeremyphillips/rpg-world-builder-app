/**
 * @vitest-environment jsdom
 */
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { MemoryRouter } from 'react-router-dom'

import { ActionBlockerReferences } from './action-blocker-references.client'

describe('ActionBlockerReferences', () => {
  it('renders flat blocker references without grouped summaries', () => {
    render(
      <MemoryRouter>
        <ActionBlockerReferences
          campaignId="camp_1"
          variant="flat"
          blockers={[
            {
              kind: 'usage',
              usage: {
                kind: 'character',
                id: 'pc_1',
                label: 'Morgran Stonebreaker',
                characterType: 'pc',
                campaignId: 'camp_1',
              },
            },
            {
              kind: 'usage',
              usage: {
                kind: 'character',
                id: 'pc_2',
                label: 'Thorin Strakeln',
                characterType: 'pc',
                campaignId: 'camp_1',
              },
            },
          ]}
        />
      </MemoryRouter>,
    )

    expect(screen.getByText('Morgran Stonebreaker')).toBeInTheDocument()
    expect(screen.getByText('Thorin Strakeln')).toBeInTheDocument()
    expect(screen.queryByText(/Used by \d+ active character/)).not.toBeInTheDocument()
    expect(screen.getByRole('list').closest('div')).toHaveClass('bg-destructive-subtle')
  })

  it('shows the first usage group by default and keeps later groups collapsed', () => {
    render(
      <MemoryRouter>
        <ActionBlockerReferences
          campaignId="camp_1"
          blockers={[
            {
              kind: 'usage',
              usage: {
                kind: 'character',
                id: 'pc_1',
                label: 'Morgran Stonebreaker',
                characterType: 'pc',
                campaignId: 'camp_1',
              },
            },
            {
              kind: 'content',
              contentTypeKey: 'species',
              id: 'sp_1',
              label: 'Elf',
              slug: 'elf',
            },
          ]}
        />
      </MemoryRouter>,
    )

    expect(screen.getByText('Used by 1 active character')).toBeInTheDocument()
    expect(screen.getByText('Morgran Stonebreaker')).toBeInTheDocument()
    expect(screen.getByText('Used by 1 active species entry')).toBeInTheDocument()
    expect(screen.queryByText('Elf')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /show/i })).toBeInTheDocument()
  })
})
