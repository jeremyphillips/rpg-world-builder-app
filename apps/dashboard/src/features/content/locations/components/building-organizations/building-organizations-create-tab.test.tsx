/**
 * @vitest-environment jsdom
 */
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import { makeOrganization } from '@/test/fixtures/factories/organization'

import { BuildingOrganizationsCreateTab } from './building-organizations-create-tab'
import type { BuildingOrganizationsCreateTabController } from './building-organizations-create-tab'
import {
  BUILDING_ORGANIZATIONS_ADD_ANOTHER_LABEL,
  BUILDING_ORGANIZATIONS_ADD_FIRST_LABEL,
  BUILDING_ORGANIZATIONS_COMPOSER_HEADING,
  BUILDING_ORGANIZATIONS_CREATE_NEW_LABEL,
  BUILDING_ORGANIZATIONS_DISCOVERY_HEADING,
  BUILDING_ORGANIZATIONS_EDIT_ACTION_LABEL,
  BUILDING_ORGANIZATIONS_EMPTY_STATE_LABEL,
  BUILDING_ORGANIZATIONS_IN_PROGRESS_MESSAGE,
  BUILDING_ORGANIZATIONS_INTENT_PROMPT,
  BUILDING_ORGANIZATIONS_OVERFLOW_LABEL,
  BUILDING_ORGANIZATIONS_PENDING_HEADING,
  BUILDING_ORGANIZATIONS_REMOVE_ACTION_LABEL,
  BUILDING_ORGANIZATIONS_SEARCH_LABEL,
  BUILDING_ORGANIZATIONS_SELECT_LABEL,
  BUILDING_ORGANIZATIONS_TAB_DESCRIPTION,
  BUILDING_ORGANIZATIONS_TAB_HEADING,
} from '../../lib/building-organizations/building-organizations-create-tab.lib'
import type { BuildingOrganizationDraftPlan } from '../../lib/building-organizations/building-organization-create-drafts'

const organizations = [
  makeOrganization({
    id: 'organization-1',
    slug: 'organization-1',
    name: 'Copper Kettle Guild',
    organizationDomain: 'commercial',
  }),
  makeOrganization({
    id: 'organization-2',
    slug: 'organization-2',
    name: 'Harbor Merchants Guild',
    organizationDomain: 'commercial',
  }),
]

vi.mock('../../../organizations', () => ({
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

async function startComposing(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: BUILDING_ORGANIZATIONS_ADD_FIRST_LABEL }))
}

async function chooseOwnerIntent(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('radio', { name: /Owner/i }))
}

async function addExistingOwner(
  user: ReturnType<typeof userEvent.setup>,
  controllerRef?: { current: BuildingOrganizationsCreateTabController | null },
) {
  await startComposing(user)
  await chooseOwnerIntent(user)
  await user.click(screen.getAllByRole('button', { name: BUILDING_ORGANIZATIONS_SELECT_LABEL })[0]!)
  if (controllerRef) {
    act(() => controllerRef.current?.commitComposer?.())
  }
}

function expectRelationshipSummary(value: string) {
  expect(screen.getByRole('button', { name: `${value}, Change relationship` })).toBeInTheDocument()
}

function expectNoRelationshipSummary() {
  expect(screen.queryByRole('button', { name: /Change relationship/i })).not.toBeInTheDocument()
}

function expectOrganizationSummary(value: string) {
  expect(screen.getByRole('button', { name: `${value}, Change organization` })).toBeInTheDocument()
}

function expectNoOrganizationSummary() {
  expect(screen.queryByRole('button', { name: /Change organization/i })).not.toBeInTheDocument()
}

describe('BuildingOrganizationsCreateTab', () => {
  it('starts in resting empty state with tab intro and no auto-open composer', async () => {
    const onStatusChange = vi.fn()
    render(
      <BuildingOrganizationsCreateTab campaignId="campaign-1" onStatusChange={onStatusChange} />,
    )

    await waitFor(() =>
      expect(onStatusChange).toHaveBeenLastCalledWith({
        invalid: false,
        blocksSubmit: false,
        dirty: false,
      }),
    )
    expect(screen.getByText(BUILDING_ORGANIZATIONS_TAB_HEADING)).toBeInTheDocument()
    expect(screen.getByText(BUILDING_ORGANIZATIONS_TAB_DESCRIPTION)).toBeInTheDocument()
    expect(screen.getByText(BUILDING_ORGANIZATIONS_EMPTY_STATE_LABEL)).toBeInTheDocument()
    expect(screen.queryByText(BUILDING_ORGANIZATIONS_INTENT_PROMPT)).not.toBeInTheDocument()
    expect(screen.queryByText(BUILDING_ORGANIZATIONS_PENDING_HEADING)).not.toBeInTheDocument()
    expect(screen.queryByText(BUILDING_ORGANIZATIONS_COMPOSER_HEADING)).not.toBeInTheDocument()
  })

  it('does not create a draft until the relationship is committed', async () => {
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

    await startComposing(user)
    await chooseOwnerIntent(user)
    expect(onPlanChange).not.toHaveBeenCalled()
    expect(screen.queryByText(BUILDING_ORGANIZATIONS_PENDING_HEADING)).not.toBeInTheDocument()
    expect(screen.queryByText(BUILDING_ORGANIZATIONS_IN_PROGRESS_MESSAGE)).not.toBeInTheDocument()
    expect(await controllerRef.current?.validate()).toEqual({ valid: false, issueCount: 1 })
    expect(await screen.findByText(BUILDING_ORGANIZATIONS_IN_PROGRESS_MESSAGE)).toBeInTheDocument()
  })

  it('adds, edits in focused composer, and removes the last draft without persistence', async () => {
    const user = userEvent.setup()
    const onPlanChange = vi.fn()
    const controllerRef = { current: null as BuildingOrganizationsCreateTabController | null }
    render(
      <BuildingOrganizationsCreateTab
        campaignId="campaign-1"
        organizationItems={organizations}
        controllerRef={controllerRef}
        onPlanChange={onPlanChange}
      />,
    )

    await addExistingOwner(user, controllerRef)

    expect(screen.getByText(BUILDING_ORGANIZATIONS_PENDING_HEADING)).toBeInTheDocument()
    expect(screen.queryByText(BUILDING_ORGANIZATIONS_INTENT_PROMPT)).not.toBeInTheDocument()
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
    expect(screen.getByText(BUILDING_ORGANIZATIONS_COMPOSER_HEADING)).toBeInTheDocument()
    expect(screen.queryByText(BUILDING_ORGANIZATIONS_TAB_HEADING)).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Change relationship' }))
    await user.click(screen.getByRole('radio', { name: /Operator/i }))
    act(() => controllerRef.current?.commitComposer?.())
    expect(onPlanChange.mock.calls[1]![0].relationships[0]).toMatchObject({
      draftId: firstPlan.relationships[0].draftId,
      kind: 'operator',
    })

    await user.click(screen.getByRole('button', { name: BUILDING_ORGANIZATIONS_OVERFLOW_LABEL }))
    await user.click(
      screen.getByRole('menuitem', { name: BUILDING_ORGANIZATIONS_REMOVE_ACTION_LABEL }),
    )
    expect(screen.getByText(BUILDING_ORGANIZATIONS_EMPTY_STATE_LABEL)).toBeInTheDocument()
    expect(screen.queryByText(BUILDING_ORGANIZATIONS_PENDING_HEADING)).not.toBeInTheDocument()
  })

  it('restores the original pending relationship when a focused edit is cancelled', async () => {
    const user = userEvent.setup()
    const onPlanChange = vi.fn()
    const controllerRef = { current: null as BuildingOrganizationsCreateTabController | null }
    render(
      <BuildingOrganizationsCreateTab
        campaignId="campaign-1"
        organizationItems={organizations}
        controllerRef={controllerRef}
        onPlanChange={onPlanChange}
      />,
    )

    await addExistingOwner(user, controllerRef)
    const originalPlan = onPlanChange.mock.calls[0]![0]

    await user.click(screen.getByRole('button', { name: BUILDING_ORGANIZATIONS_OVERFLOW_LABEL }))
    await user.click(
      screen.getByRole('menuitem', { name: BUILDING_ORGANIZATIONS_EDIT_ACTION_LABEL }),
    )
    await user.click(screen.getByRole('button', { name: 'Change relationship' }))
    await user.click(screen.getByRole('radio', { name: /Operator/i }))
    act(() => controllerRef.current?.cancelComposer())

    expect(onPlanChange).toHaveBeenCalledTimes(1)
    expect(onPlanChange.mock.calls[0]![0]).toEqual(originalPlan)
    expect(screen.getByText(BUILDING_ORGANIZATIONS_PENDING_HEADING)).toBeInTheDocument()
  })

  it('updates a pending relationship in place without adding a duplicate row', async () => {
    const user = userEvent.setup()
    const onPlanChange = vi.fn()
    const controllerRef = { current: null as BuildingOrganizationsCreateTabController | null }
    render(
      <BuildingOrganizationsCreateTab
        campaignId="campaign-1"
        organizationItems={organizations}
        controllerRef={controllerRef}
        onPlanChange={onPlanChange}
      />,
    )

    await addExistingOwner(user, controllerRef)
    const firstPlan = onPlanChange.mock.calls[0]![0]

    await user.click(screen.getByRole('button', { name: BUILDING_ORGANIZATIONS_OVERFLOW_LABEL }))
    await user.click(
      screen.getByRole('menuitem', { name: BUILDING_ORGANIZATIONS_EDIT_ACTION_LABEL }),
    )
    await user.click(screen.getByRole('button', { name: 'Change relationship' }))
    await user.click(screen.getByRole('radio', { name: /Operator/i }))
    act(() => controllerRef.current?.commitComposer())

    expect(onPlanChange.mock.calls[1]![0].relationships).toHaveLength(1)
    expect(onPlanChange.mock.calls[1]![0].relationships[0]?.draftId).toBe(
      firstPlan.relationships[0]?.draftId,
    )
    expect(onPlanChange.mock.calls[1]![0].relationships[0]?.kind).toBe('operator')
  })

  it('returns to resting after add-another confirmation', async () => {
    const user = userEvent.setup()
    const controllerRef = { current: null as BuildingOrganizationsCreateTabController | null }
    render(<BuildingOrganizationsCreateTab campaignId="campaign-1" controllerRef={controllerRef} />)

    await addExistingOwner(user, controllerRef)
    await user.click(screen.getByRole('button', { name: BUILDING_ORGANIZATIONS_ADD_ANOTHER_LABEL }))
    expect(screen.getByText(BUILDING_ORGANIZATIONS_COMPOSER_HEADING)).toBeInTheDocument()
    expect(screen.getByText(BUILDING_ORGANIZATIONS_INTENT_PROMPT)).toBeInTheDocument()

    await user.click(screen.getByRole('radio', { name: /Tenant/i }))
    await user.click(
      screen.getAllByRole('button', { name: BUILDING_ORGANIZATIONS_SELECT_LABEL })[1]!,
    )
    act(() => controllerRef.current?.commitComposer?.())
    expect(screen.getByText(BUILDING_ORGANIZATIONS_PENDING_HEADING)).toBeInTheDocument()
    expect(screen.getByText('Copper Kettle Guild')).toBeInTheDocument()
    expect(screen.getByText('Harbor Merchants Guild')).toBeInTheDocument()
  })

  it('disables Select when the chosen kind is not eligible for the organization', async () => {
    const user = userEvent.setup()
    render(
      <BuildingOrganizationsCreateTab
        campaignId="campaign-1"
        initialPlan={allKindsPlan}
        initialComposerMode="composing"
      />,
    )

    await user.click(screen.getByRole('radio', { name: /Owner/i }))
    expect(
      screen.getAllByRole('button', { name: BUILDING_ORGANIZATIONS_SELECT_LABEL })[0],
    ).toBeDisabled()
  })

  it('renders placeholder-only discovery search with a clear control when filtered', async () => {
    const user = userEvent.setup()
    render(<BuildingOrganizationsCreateTab campaignId="campaign-1" />)

    await startComposing(user)
    await chooseOwnerIntent(user)

    const searchbox = screen.getByRole('searchbox', {
      name: BUILDING_ORGANIZATIONS_SEARCH_LABEL,
    })
    expect(searchbox).toBeInTheDocument()
    expect(screen.getByText(BUILDING_ORGANIZATIONS_DISCOVERY_HEADING)).toBeInTheDocument()
    expect(screen.queryByText(BUILDING_ORGANIZATIONS_SEARCH_LABEL)).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Clear search' })).not.toBeInTheDocument()

    await user.type(searchbox, 'Copper')
    expect(screen.getByRole('button', { name: 'Clear search' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Clear search' }))
    expect(searchbox).toHaveValue('')
  })

  it('reports blocksSubmit while the composer is in progress', async () => {
    const user = userEvent.setup()
    const onStatusChange = vi.fn()
    render(
      <BuildingOrganizationsCreateTab campaignId="campaign-1" onStatusChange={onStatusChange} />,
    )

    await startComposing(user)
    await waitFor(() =>
      expect(onStatusChange).toHaveBeenLastCalledWith({
        invalid: false,
        blocksSubmit: true,
        dirty: true,
      }),
    )
  })

  it('hides organization discovery while the intent kind is being edited', async () => {
    const user = userEvent.setup()
    render(<BuildingOrganizationsCreateTab campaignId="campaign-1" />)

    await startComposing(user)
    await chooseOwnerIntent(user)
    expect(
      screen.getByRole('searchbox', { name: BUILDING_ORGANIZATIONS_SEARCH_LABEL }),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Change relationship' }))
    expect(
      screen.queryByRole('searchbox', { name: BUILDING_ORGANIZATIONS_SEARCH_LABEL }),
    ).not.toBeInTheDocument()
    expect(screen.getByRole('radiogroup')).toBeInTheDocument()
    expectNoRelationshipSummary()
  })

  it('restores discovery after same-value kind reselect without resetting search state', async () => {
    const user = userEvent.setup()
    render(<BuildingOrganizationsCreateTab campaignId="campaign-1" />)

    await startComposing(user)
    await chooseOwnerIntent(user)
    const searchbox = screen.getByRole('searchbox', { name: BUILDING_ORGANIZATIONS_SEARCH_LABEL })
    await user.type(searchbox, 'Copper')
    expect(searchbox).toHaveValue('Copper')

    await user.click(screen.getByRole('button', { name: 'Change relationship' }))
    await user.click(screen.getByRole('radio', { name: /Owner/i }))

    expectRelationshipSummary('Owner')
    expect(
      screen.getByRole('searchbox', { name: BUILDING_ORGANIZATIONS_SEARCH_LABEL }),
    ).toHaveValue('Copper')
  })

  it('shows relationship summary before organization discovery', async () => {
    const user = userEvent.setup()
    const onPlanChange = vi.fn()
    const controllerRef = { current: null as BuildingOrganizationsCreateTabController | null }
    render(
      <BuildingOrganizationsCreateTab
        campaignId="campaign-1"
        initialPlan={threeKindsPlan}
        initialComposerMode="composing"
        controllerRef={controllerRef}
        onPlanChange={onPlanChange}
      />,
    )

    await user.click(screen.getByRole('radio', { name: /Headquarters/i }))
    expectRelationshipSummary('Headquarters')
    expect(screen.queryByRole('radio')).not.toBeInTheDocument()
    expectNoOrganizationSummary()
    expect(onPlanChange).not.toHaveBeenCalled()
    await user.click(
      screen.getAllByRole('button', { name: BUILDING_ORGANIZATIONS_SELECT_LABEL })[0]!,
    )
    expectOrganizationSummary('Copper Kettle Guild · Commercial')
    act(() => controllerRef.current?.commitComposer?.())
    expect(onPlanChange).toHaveBeenCalledOnce()
    expect(onPlanChange.mock.calls[0]![0].relationships.at(-1)).toMatchObject({
      kind: 'headquarters',
    })
  })

  it('uses compact summary rows for active and completed decisions', async () => {
    const user = userEvent.setup()
    render(<BuildingOrganizationsCreateTab campaignId="campaign-1" />)

    await startComposing(user)
    expectNoRelationshipSummary()
    expect(
      screen.getByRole('radiogroup', { name: BUILDING_ORGANIZATIONS_INTENT_PROMPT }),
    ).toBeInTheDocument()

    await chooseOwnerIntent(user)
    expectRelationshipSummary('Owner')
    expectNoOrganizationSummary()
    expect(
      screen.queryByRole('radiogroup', { name: BUILDING_ORGANIZATIONS_INTENT_PROMPT }),
    ).not.toBeInTheDocument()

    await user.click(
      screen.getAllByRole('button', { name: BUILDING_ORGANIZATIONS_SELECT_LABEL })[0]!,
    )
    expectRelationshipSummary('Owner')
    expectOrganizationSummary('Copper Kettle Guild · Commercial')
  })

  it('shows branch with relationship summary only and no placeholder organization row', async () => {
    const user = userEvent.setup()
    render(<BuildingOrganizationsCreateTab campaignId="campaign-1" />)

    await startComposing(user)
    await chooseOwnerIntent(user)
    await user.click(screen.getByRole('button', { name: BUILDING_ORGANIZATIONS_CREATE_NEW_LABEL }))

    expectRelationshipSummary('Owner')
    expectNoOrganizationSummary()
  })

  it('reopens unpinned discovery when changing organization from review', async () => {
    const user = userEvent.setup()
    render(<BuildingOrganizationsCreateTab campaignId="campaign-1" />)

    await startComposing(user)
    await chooseOwnerIntent(user)
    await user.click(
      screen.getAllByRole('button', { name: BUILDING_ORGANIZATIONS_SELECT_LABEL })[0]!,
    )
    expectOrganizationSummary('Copper Kettle Guild · Commercial')

    await user.click(screen.getByRole('button', { name: 'Change organization' }))
    expectRelationshipSummary('Owner')
    expectNoOrganizationSummary()
    expect(
      screen.getByRole('searchbox', { name: BUILDING_ORGANIZATIONS_SEARCH_LABEL }),
    ).toBeInTheDocument()
    expect(
      screen.getAllByRole('button', { name: BUILDING_ORGANIZATIONS_SELECT_LABEL }).length,
    ).toBeGreaterThan(0)
  })

  it('normalizes in-progress composer and attributed server issues through its panel controller', async () => {
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

    await startComposing(user)
    await chooseOwnerIntent(user)
    await user.click(screen.getByRole('button', { name: BUILDING_ORGANIZATIONS_CREATE_NEW_LABEL }))
    await waitFor(() =>
      expect(onStatusChange).toHaveBeenLastCalledWith({
        invalid: false,
        blocksSubmit: true,
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

  it('publishes child-workflow projection only on semantic changes', async () => {
    const user = userEvent.setup()
    const onChildWorkflowChange = vi.fn()
    render(
      <BuildingOrganizationsCreateTab
        campaignId="campaign-1"
        onChildWorkflowChange={onChildWorkflowChange}
      />,
    )

    expect(onChildWorkflowChange).toHaveBeenCalledTimes(1)
    expect(onChildWorkflowChange).toHaveBeenLastCalledWith(null)

    await startComposing(user)
    await waitFor(() => expect(onChildWorkflowChange).toHaveBeenCalledTimes(2))
    expect(onChildWorkflowChange.mock.calls[1]![0]).toMatchObject({
      active: true,
      commitTarget: { kind: 'action' },
    })

    await chooseOwnerIntent(user)
    expect(onChildWorkflowChange).toHaveBeenCalledTimes(2)

    await user.click(screen.getByRole('button', { name: BUILDING_ORGANIZATIONS_CREATE_NEW_LABEL }))
    await waitFor(() => expect(onChildWorkflowChange).toHaveBeenCalledTimes(3))
    expect(onChildWorkflowChange.mock.calls[2]![0]).toMatchObject({
      active: true,
      commitTarget: { kind: 'form', formId: 'building-new-organization-draft' },
    })
  })

  itAxe('has no accessibility violations in resting empty state', async () => {
    const { container } = render(<BuildingOrganizationsCreateTab campaignId="campaign-1" />)
    await expectNoAxeViolations(container)
  })
})
