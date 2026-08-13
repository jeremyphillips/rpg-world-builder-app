/**
 * @vitest-environment jsdom
 */
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import type { Organization } from '@rpg/contracts'

import { BuildingOrganizationsCreateTab } from './building-organizations-create-tab.client'
import type { BuildingOrganizationsCreateTabController } from './building-organizations-create-tab.client'

const organizations = [
  {
    id: 'organization-1',
    name: 'Copper Kettle Guild',
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

describe('BuildingOrganizationsCreateTab', () => {
  it('starts as an untouched optional panel', async () => {
    const onStatusChange = vi.fn()
    render(
      <BuildingOrganizationsCreateTab campaignId="campaign-1" onStatusChange={onStatusChange} />,
    )

    await waitFor(() =>
      expect(onStatusChange).toHaveBeenLastCalledWith({ invalid: false, dirty: false }),
    )
    expect(screen.getByText('No Organization relationships will be created.')).toBeInTheDocument()
  })

  it('adds, edits, and removes an existing Organization draft without persistence', async () => {
    const user = userEvent.setup()
    const onPlanChange = vi.fn()
    render(<BuildingOrganizationsCreateTab campaignId="campaign-1" onPlanChange={onPlanChange} />)

    await user.click(screen.getByRole('combobox', { name: 'Connection type' }))
    await user.click(screen.getByRole('option', { name: 'Owner' }))
    await user.click(screen.getByRole('button', { name: /Copper Kettle Guild/ }))
    await user.click(screen.getByRole('button', { name: 'Add relationship' }))

    expect(screen.getAllByText('Owner')).not.toHaveLength(0)
    expect(onPlanChange).toHaveBeenCalledOnce()
    const firstPlan = onPlanChange.mock.calls[0]![0]
    expect(firstPlan.relationships[0]).toMatchObject({
      kind: 'owns',
      organization: { kind: 'existing', organizationId: 'organization-1' },
    })

    await user.click(screen.getByRole('button', { name: 'Relationship actions' }))
    await user.click(screen.getByRole('menuitem', { name: 'Edit' }))
    await user.click(screen.getByRole('button', { name: 'Update relationship' }))
    expect(onPlanChange.mock.calls[1]![0].relationships[0].draftId).toBe(
      firstPlan.relationships[0].draftId,
    )

    await user.click(screen.getByRole('button', { name: 'Relationship actions' }))
    await user.click(screen.getByRole('menuitem', { name: 'Remove' }))
    expect(screen.getByText('No Organization relationships will be created.')).toBeInTheDocument()
  })

  it('normalizes incomplete editor and attributed server issues through its panel controller', async () => {
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

    await user.click(screen.getByRole('button', { name: 'New Organization' }))
    await waitFor(() =>
      expect(onStatusChange).toHaveBeenLastCalledWith({
        invalid: true,
        issueCount: 2,
        dirty: true,
      }),
    )

    act(() => {
      controllerRef.current?.hydrateServerIssues([
        { relationshipDraftId: 'relationship-server', message: 'Server-attributed issue.' },
      ])
    })
    expect(await controllerRef.current?.validate()).toEqual({ valid: false, issueCount: 3 })
    act(() => controllerRef.current?.focusFirstIssue())
    expect(screen.getByText('Server-attributed issue.')).toHaveFocus()
  })
})
