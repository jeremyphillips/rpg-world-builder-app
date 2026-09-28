import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { OrganizationMembershipTitleDefinition } from '@rpg/contracts'

import {
  buildOrganizationMembershipTitleRadioOptions,
  ORGANIZATION_MEMBERSHIP_NO_TITLE_VALUE,
} from '@/features/character/lib/organization-membership/organization-membership-title.lib'

import { OrganizationMembershipTitlesSummary } from './organization-membership-titles-summary'

const sampleCatalog: OrganizationMembershipTitleDefinition[] = [
  { id: 'omt_member', label: 'Member', priority: 20 },
  { id: 'omt_guildmaster', label: 'Guildmaster', priority: 50, sourceTitleId: 'guildmaster' },
  { id: 'omt_captain', label: 'Captain', priority: 40 },
]

function listItemLabels(): string[] {
  const list = screen.getByTestId('organization-membership-titles-list')
  return within(list)
    .getAllByRole('listitem')
    .map((item) => item.textContent ?? '')
}

describe('OrganizationMembershipTitlesSummary', () => {
  it('renders titles in canonical priority-descending order', () => {
    render(
      <OrganizationMembershipTitlesSummary
        titles={[sampleCatalog[0]!, sampleCatalog[2]!, sampleCatalog[1]!]}
      />,
    )

    expect(listItemLabels()).toEqual(['Guildmaster', 'Captain', 'Member'])
  })

  it('keeps stored array order for equal priorities', () => {
    const tied: OrganizationMembershipTitleDefinition[] = [
      { id: 'omt_a', label: 'Alpha', priority: 30 },
      { id: 'omt_b', label: 'Beta', priority: 30 },
    ]
    render(<OrganizationMembershipTitlesSummary titles={tied} />)
    expect(listItemLabels()).toEqual(['Alpha', 'Beta'])
  })

  it('renders only catalog labels without internal metadata', () => {
    render(<OrganizationMembershipTitlesSummary titles={sampleCatalog} />)

    expect(listItemLabels()).toEqual(['Guildmaster', 'Captain', 'Member'])
    expect(screen.queryByText(/omt_/)).not.toBeInTheDocument()
    expect(screen.queryByText(/guildmaster/)).not.toBeInTheDocument()
    expect(screen.queryByText('50')).not.toBeInTheDocument()
    expect(screen.queryByText('40')).not.toBeInTheDocument()
    expect(screen.queryByText('20')).not.toBeInTheDocument()
  })

  it('matches picker catalog options after excluding the picker sentinel', () => {
    render(<OrganizationMembershipTitlesSummary titles={sampleCatalog} />)

    const summaryLabels = listItemLabels()
    const pickerLabels = buildOrganizationMembershipTitleRadioOptions({
      titles: sampleCatalog,
    })
      .filter((option) => option.value !== ORGANIZATION_MEMBERSHIP_NO_TITLE_VALUE)
      .map((option) => option.label)

    expect(summaryLabels).toEqual(pickerLabels)
  })

  it('does not render picker-only out-of-catalog compatibility values', () => {
    render(<OrganizationMembershipTitlesSummary titles={sampleCatalog} />)

    const pickerWithLegacy = buildOrganizationMembershipTitleRadioOptions({
      titles: sampleCatalog,
      currentValue: 'Sea Lord',
    }).map((option) => option.label)

    expect(pickerWithLegacy).toContain('Sea Lord')
    expect(listItemLabels()).not.toContain('Sea Lord')
  })

  it('renders the empty state for missing and empty catalogs', () => {
    const { rerender } = render(<OrganizationMembershipTitlesSummary />)
    expect(screen.getByText('No membership titles')).toBeInTheDocument()
    expect(screen.getByText('Members can still be added without a title.')).toBeInTheDocument()
    expect(screen.queryByRole('list')).not.toBeInTheDocument()

    rerender(<OrganizationMembershipTitlesSummary titles={[]} />)
    expect(screen.getByText('No membership titles')).toBeInTheDocument()
    expect(screen.queryByRole('list')).not.toBeInTheDocument()
  })
})
