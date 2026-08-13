/**
 * @vitest-environment jsdom
 */
import { act, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import type { Organization } from '@rpg/contracts'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import { BuildingOrganizationsCreateTab } from './building-organizations-create-tab.client'
import type { BuildingOrganizationsCreateTabController } from './building-organizations-create-tab.client'
import {
  BUILDING_ORGANIZATIONS_ADD_ANOTHER_LABEL,
  BUILDING_ORGANIZATIONS_ADD_DESCRIPTION,
  BUILDING_ORGANIZATIONS_ADD_RELATIONSHIP_LABEL,
  BUILDING_ORGANIZATIONS_CREATE_NEW_LABEL,
  BUILDING_ORGANIZATIONS_EDIT_ACTION_LABEL,
  BUILDING_ORGANIZATIONS_IN_PROGRESS_MESSAGE,
  BUILDING_ORGANIZATIONS_OVERFLOW_LABEL,
  BUILDING_ORGANIZATIONS_PENDING_HEADING,
  BUILDING_ORGANIZATIONS_REMOVE_ACTION_LABEL,
  BUILDING_ORGANIZATIONS_UPDATE_RELATIONSHIP_LABEL,
} from '../lib/building-organizations-create-tab.lib'
import type { BuildingOrganizationDraftPlan } from '../lib/building-organization-create-drafts'

const organizations = [
  {
    id: 'organization-1',
    name: 'Copper Kettle Guild',
    organizationDomain: 'commercial',
    activities: [],
    connections: { locations: [] },
  },
  {
    id: 'organization-2',
    name: 'Harbor Merchants Guild',
    organizationDomain: 'commercial',
    activities: [],
    connections: { locations: [] },
  },
] as unknown as Organization[]

vi.mock('../../organizations', () => ({
  useOrganizations: () => ({ data: organizations, isPending: false, isError: false }),
}))

beforeAll(() => {
  if (!HTMLElement.prototype.hasPointerCapture) {
    HTMLElement.prototype.hasPointerCapture = () => false
  }
  if (!HTMLElement.prototype.setPointerCapture) {
    HTMLElement.prototype.setPointerCapture = () => undefined
  }
  if (!HTMLElement.prototype.releasePointerCapture) {
    HTMLElement.prototype.releasePointerCapture = () => undefined
  }
  if (!HTMLElement.prototype.scrollIntoView) {
    HTMLElement.prototype.scrollIntoView = () => undefined
  }
})

const allKindsPlan: BuildingOrganizationDraftPlan = {
  organizations: [],
  relationships: [
    {
      draftId: 'relationship-owns',
      kind: 'owns',
      organization: { kind: 'existing', organizationId: 'organization-1' },
    },
    {
      draftId: 'relationship-tenant',
      kind: 'tenant',
      organization: { kind: 'existing', organizationId: 'organization-1' },
    },
    {
      draftId: 'relationship-operator',
      kind: 'operator',
      organization: { kind: 'existing', organizationId: 'organization-1' },
    },
    {
      draftId: 'relationship-hq',
      kind: 'headquarters',
      organization: { kind: 'existing', organizationId: 'organization-1' },
    },
  ],
}

const threeKindsPlan: BuildingOrganizationDraftPlan = {
  organizations: [],
  relationships: allKindsPlan.relationships.slice(0, 3),
}

async function addExistingOwner(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getAllByRole('button', { name: 'Add' })[0]!)
  await user.click(screen.getByRole('radio', { name: 'Owner' }))
  await user.click(
    screen.getByRole('button', { name: BUILDING_ORGANIZATIONS_ADD_RELATIONSHIP_LABEL }),
  )
}

describe('BuildingOrganizationsCreateTab', () => {
  it('starts as an untouched optional Add-mode panel', async () => {
    const onStatusChange = vi.fn()
    render(
      <BuildingOrganizationsCreateTab campaignId="campaign-1" onStatusChange={onStatusChange} />,
    )

    await waitFor(() =>
      expect(onStatusChange).toHaveBeenLastCalledWith({ invalid: false, dirty: false }),
    )
    expect(screen.getByText(BUILDING_ORGANIZATIONS_ADD_DESCRIPTION)).toBeInTheDocument()
    expect(screen.queryByText(BUILDING_ORGANIZATIONS_PENDING_HEADING)).not.toBeInTheDocument()
    expect(screen.queryByRole('combobox', { name: 'Connection type' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Existing Organization' })).not.toBeInTheDocument()
  })

  it('does not create a draft until Add relationship is confirmed', async () => {
    const user = userEvent.setup()
    const onPlanChange = vi.fn()
    const controllerRef = { current: null as BuildingOrganizationsCreateTabController | null }
    render(
      <BuildingOrganizationsCreateTab
        campaignId="campaign-1"
        controllerRef={controllerRef}
        onPlanChange={onPlanChange}
      />,
    )

    await user.click(screen.getAllByRole('button', { name: 'Add' })[0]!)
    expect(onPlanChange).not.toHaveBeenCalled()
    expect(screen.getByRole('radio', { name: 'Owner' })).toBeInTheDocument()
    expect(screen.queryByText(BUILDING_ORGANIZATIONS_PENDING_HEADING)).not.toBeInTheDocument()
    expect(screen.queryByText(BUILDING_ORGANIZATIONS_IN_PROGRESS_MESSAGE)).not.toBeInTheDocument()
    expect(await controllerRef.current?.validate()).toEqual({ valid: false, issueCount: 1 })
    expect(await screen.findByText(BUILDING_ORGANIZATIONS_IN_PROGRESS_MESSAGE)).toBeInTheDocument()
  })

  it('keeps only one discovery disclosure open', async () => {
    const user = userEvent.setup()
    render(<BuildingOrganizationsCreateTab campaignId="campaign-1" />)

    const addButtons = screen.getAllByRole('button', { name: 'Add' })
    await user.click(addButtons[0]!)
    expect(screen.getByRole('radio', { name: 'Owner' })).toBeInTheDocument()
    await user.click(addButtons[1]!)
    expect(screen.getAllByRole('radio', { name: 'Owner' })).toHaveLength(1)
  })

  it('adds, edits in Pending mode, and removes the last draft without persistence', async () => {
    const user = userEvent.setup()
    const onPlanChange = vi.fn()
    render(
      <BuildingOrganizationsCreateTab
        campaignId="campaign-1"
        organizationItems={organizations}
        onPlanChange={onPlanChange}
      />,
    )

    await addExistingOwner(user)

    expect(screen.getByText(BUILDING_ORGANIZATIONS_PENDING_HEADING)).toBeInTheDocument()
    expect(screen.queryByText(BUILDING_ORGANIZATIONS_ADD_DESCRIPTION)).not.toBeInTheDocument()
    expect(onPlanChange).toHaveBeenCalledOnce()
    const firstPlan = onPlanChange.mock.calls[0]![0]
    expect(firstPlan.relationships[0]).toMatchObject({
      kind: 'owns',
      organization: { kind: 'existing', organizationId: 'organization-1' },
    })

    await user.click(screen.getByRole('button', { name: BUILDING_ORGANIZATIONS_OVERFLOW_LABEL }))
    await user.click(
      screen.getByRole('menuitem', { name: BUILDING_ORGANIZATIONS_EDIT_ACTION_LABEL }),
    )
    expect(screen.getByText(BUILDING_ORGANIZATIONS_PENDING_HEADING)).toBeInTheDocument()
    expect(screen.queryByText(BUILDING_ORGANIZATIONS_ADD_DESCRIPTION)).not.toBeInTheDocument()
    await user.click(screen.getByRole('radio', { name: 'Operator' }))
    await user.click(
      screen.getByRole('button', { name: BUILDING_ORGANIZATIONS_UPDATE_RELATIONSHIP_LABEL }),
    )
    expect(onPlanChange.mock.calls[1]![0].relationships[0]).toMatchObject({
      draftId: firstPlan.relationships[0].draftId,
      kind: 'operator',
    })

    await user.click(screen.getByRole('button', { name: BUILDING_ORGANIZATIONS_OVERFLOW_LABEL }))
    await user.click(
      screen.getByRole('menuitem', { name: BUILDING_ORGANIZATIONS_REMOVE_ACTION_LABEL }),
    )
    expect(screen.getByText(BUILDING_ORGANIZATIONS_ADD_DESCRIPTION)).toBeInTheDocument()
    expect(screen.queryByText(BUILDING_ORGANIZATIONS_PENDING_HEADING)).not.toBeInTheDocument()
  })

  it('returns to Pending after add-another confirmation', async () => {
    const user = userEvent.setup()
    render(<BuildingOrganizationsCreateTab campaignId="campaign-1" />)

    await addExistingOwner(user)
    await user.click(screen.getByRole('button', { name: BUILDING_ORGANIZATIONS_ADD_ANOTHER_LABEL }))
    expect(screen.getByText(BUILDING_ORGANIZATIONS_ADD_DESCRIPTION)).toBeInTheDocument()

    await user.click(screen.getAllByRole('button', { name: 'Add' })[1]!)
    await user.click(screen.getByRole('radio', { name: 'Tenant' }))
    await user.click(
      screen.getByRole('button', { name: BUILDING_ORGANIZATIONS_ADD_RELATIONSHIP_LABEL }),
    )
    expect(screen.getByText(BUILDING_ORGANIZATIONS_PENDING_HEADING)).toBeInTheDocument()
    expect(screen.getByText('Copper Kettle Guild')).toBeInTheDocument()
    expect(screen.getByText('Harbor Merchants Guild')).toBeInTheDocument()
  })

  it('disables Add when no relationship kinds are eligible', () => {
    render(
      <BuildingOrganizationsCreateTab
        campaignId="campaign-1"
        initialPlan={allKindsPlan}
        initialMode="add"
      />,
    )

    const kettleCard = screen.getByText('Copper Kettle Guild').closest('article')
    expect(kettleCard).not.toBeNull()
    expect(within(kettleCard as HTMLElement).getByRole('button', { name: /Add/ })).toBeDisabled()
    expect(screen.queryByRole('radio')).not.toBeInTheDocument()
  })

  it('omits radios for a single eligible kind and still requires confirm', async () => {
    const user = userEvent.setup()
    const onPlanChange = vi.fn()
    render(
      <BuildingOrganizationsCreateTab
        campaignId="campaign-1"
        initialPlan={threeKindsPlan}
        initialMode="add"
        onPlanChange={onPlanChange}
      />,
    )

    const kettleCard = screen.getByText('Copper Kettle Guild').closest('article')
    await user.click(within(kettleCard as HTMLElement).getByRole('button', { name: 'Add' }))
    expect(screen.queryByRole('radio')).not.toBeInTheDocument()
    expect(onPlanChange).not.toHaveBeenCalled()
    await user.click(
      screen.getByRole('button', { name: BUILDING_ORGANIZATIONS_ADD_RELATIONSHIP_LABEL }),
    )
    expect(onPlanChange).toHaveBeenCalledOnce()
    expect(onPlanChange.mock.calls[0]![0].relationships.at(-1)).toMatchObject({
      kind: 'headquarters',
    })
  })

  it('normalizes in-progress disclosure and attributed server issues through its panel controller', async () => {
    const user = userEvent.setup()
    const onStatusChange = vi.fn()
    const controllerRef = { current: null as BuildingOrganizationsCreateTabController | null }
    render(
      <BuildingOrganizationsCreateTab
        campaignId="campaign-1"
        controllerRef={controllerRef}
        onStatusChange={onStatusChange}
      />,
    )

    await user.click(screen.getByRole('button', { name: BUILDING_ORGANIZATIONS_CREATE_NEW_LABEL }))
    await waitFor(() =>
      expect(onStatusChange).toHaveBeenLastCalledWith({
        invalid: false,
        dirty: true,
      }),
    )
    expect(screen.queryByText(BUILDING_ORGANIZATIONS_IN_PROGRESS_MESSAGE)).not.toBeInTheDocument()

    act(() => {
      controllerRef.current?.hydrateServerIssues([
        { relationshipDraftId: 'relationship-server', message: 'Server-attributed issue.' },
      ])
    })
    expect(await controllerRef.current?.validate()).toEqual({ valid: false, issueCount: 2 })
    expect(await screen.findByText(BUILDING_ORGANIZATIONS_IN_PROGRESS_MESSAGE)).toBeInTheDocument()
    act(() => controllerRef.current?.focusFirstIssue())
    expect(screen.getByText('Server-attributed issue.')).toHaveFocus()
  })

  itAxe('has no accessibility violations in Add mode', async () => {
    const { container } = render(<BuildingOrganizationsCreateTab campaignId="campaign-1" />)
    await expectNoAxeViolations(container)
  })
})
