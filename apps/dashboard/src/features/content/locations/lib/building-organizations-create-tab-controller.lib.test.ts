import { describe, expect, it } from 'vitest'

import {
  resolveBuildingOrganizationChildWorkflowView,
  resolveBuildingOrganizationComposerView,
  resolveBuildingOrganizationHasResolvedOrganizationTarget,
} from './building-organizations-create-tab-controller.lib'
import {
  BUILDING_NEW_ORGANIZATION_FORM_ID,
  BUILDING_ORGANIZATIONS_ADD_RELATIONSHIP_LABEL,
  BUILDING_ORGANIZATIONS_UPDATE_RELATIONSHIP_LABEL,
} from './building-organizations-create-tab.lib'

describe('resolveBuildingOrganizationComposerView', () => {
  it('shows active relationship radios without a summary row on intent', () => {
    const view = resolveBuildingOrganizationComposerView({
      composerStage: 'intent',
      editingDecision: null,
      kindLabel: null,
      organizationName: null,
      organizationDomainLabel: null,
      hasKind: false,
      hasResolvedOrganization: false,
      relationshipKindCount: 4,
    })

    expect(view.activeDecision).toBe('relationship')
    expect(view.summaryRows).toEqual([])
    expect(view.showDiscovery).toBe(false)
    expect(view.showBranch).toBe(false)
    expect(view.showCommit).toBe(false)
  })

  it('shows relationship summary and discovery after kind is chosen', () => {
    const view = resolveBuildingOrganizationComposerView({
      composerStage: 'discovery',
      editingDecision: null,
      kindLabel: 'Owner',
      organizationName: null,
      organizationDomainLabel: null,
      hasKind: true,
      hasResolvedOrganization: false,
      relationshipKindCount: 4,
    })

    expect(view.activeDecision).toBe('organization')
    expect(view.showDiscovery).toBe(true)
    expect(view.summaryRows).toEqual([
      { id: 'relationship', decision: 'relationship', label: 'Relationship', value: 'Owner' },
    ])
    expect(view.summaryRows.some((row) => row.id === 'organization')).toBe(false)
  })

  it('shows review commit with both summary rows when organization is resolved', () => {
    const view = resolveBuildingOrganizationComposerView({
      composerStage: 'review',
      editingDecision: null,
      kindLabel: 'Owner',
      organizationName: 'City Bank',
      organizationDomainLabel: 'Commercial',
      hasKind: true,
      hasResolvedOrganization: true,
      relationshipKindCount: 4,
    })

    expect(view.activeDecision).toBeNull()
    expect(view.showCommit).toBe(true)
    expect(view.summaryRows.map((row) => row.value)).toEqual(['Owner', 'City Bank · Commercial'])
  })

  it('shows branch form with relationship row only and no placeholder organization row', () => {
    const view = resolveBuildingOrganizationComposerView({
      composerStage: 'branch',
      editingDecision: null,
      kindLabel: 'Owner',
      organizationName: 'New organization',
      organizationDomainLabel: null,
      hasKind: true,
      hasResolvedOrganization: false,
      relationshipKindCount: 4,
    })

    expect(view.activeDecision).toBe('organization')
    expect(view.showBranch).toBe(true)
    expect(view.summaryRows).toEqual([
      { id: 'relationship', decision: 'relationship', label: 'Relationship', value: 'Owner' },
    ])
    expect(view.showCommit).toBe(false)
  })

  it('hides downstream UI while editing relationship', () => {
    const view = resolveBuildingOrganizationComposerView({
      composerStage: 'discovery',
      editingDecision: 'relationship',
      kindLabel: 'Owner',
      organizationName: 'City Bank',
      organizationDomainLabel: 'Commercial',
      hasKind: true,
      hasResolvedOrganization: true,
      relationshipKindCount: 4,
    })

    expect(view.activeDecision).toBe('relationship')
    expect(view.summaryRows).toEqual([])
    expect(view.showDiscovery).toBe(false)
    expect(view.showBranch).toBe(false)
    expect(view.showCommit).toBe(false)
    expect(view.showBranch && view.activeDecision === 'relationship').toBe(false)
    expect(view.showDiscovery && view.activeDecision === 'relationship').toBe(false)
  })

  it('shows unpinned discovery with relationship row only while editing organization', () => {
    const view = resolveBuildingOrganizationComposerView({
      composerStage: 'review',
      editingDecision: 'organization',
      kindLabel: 'Owner',
      organizationName: 'City Bank',
      organizationDomainLabel: 'Commercial',
      hasKind: true,
      hasResolvedOrganization: true,
      relationshipKindCount: 4,
    })

    expect(view.activeDecision).toBe('organization')
    expect(view.showDiscovery).toBe(true)
    expect(view.showCommit).toBe(false)
    expect(view.summaryRows).toEqual([
      { id: 'relationship', decision: 'relationship', label: 'Relationship', value: 'Owner' },
    ])
  })
})

describe('resolveBuildingOrganizationHasResolvedOrganizationTarget', () => {
  it('treats existing organizations as resolved', () => {
    expect(
      resolveBuildingOrganizationHasResolvedOrganizationTarget({
        selectedOrganization: { kind: 'existing', organizationId: 'organization-1' },
        organizationName: 'City Bank',
      }),
    ).toBe(true)
  })

  it('rejects placeholder new organization names', () => {
    expect(
      resolveBuildingOrganizationHasResolvedOrganizationTarget({
        selectedOrganization: { kind: 'new', draftOrganizationId: 'draft-1' },
        organizationName: 'New organization',
      }),
    ).toBe(false)
  })
})

describe('resolveBuildingOrganizationChildWorkflowView', () => {
  const enabledKindOptions = [{ value: 'owns' as const, label: 'Owner', description: '' }]

  it('returns null while resting', () => {
    expect(
      resolveBuildingOrganizationChildWorkflowView({
        composerMode: 'resting',
        composerStage: 'review',
        editingDraftId: null,
        kind: 'owns',
        selectedOrganization: { kind: 'existing', organizationId: 'organization-1' },
        organizationOptions: enabledKindOptions,
      }),
    ).toBeNull()
  })

  it('projects an action commit on review with a resolved existing organization', () => {
    expect(
      resolveBuildingOrganizationChildWorkflowView({
        composerMode: 'composing',
        composerStage: 'review',
        editingDraftId: null,
        kind: 'owns',
        selectedOrganization: { kind: 'existing', organizationId: 'organization-1' },
        organizationOptions: enabledKindOptions,
      }),
    ).toEqual({
      active: true,
      canCommit: true,
      commitLabel: BUILDING_ORGANIZATIONS_ADD_RELATIONSHIP_LABEL,
      commitTarget: { kind: 'action' },
    })
  })

  it('projects a form commit on branch for new organizations', () => {
    expect(
      resolveBuildingOrganizationChildWorkflowView({
        composerMode: 'composing',
        composerStage: 'branch',
        editingDraftId: null,
        kind: 'owns',
        selectedOrganization: { kind: 'new', draftOrganizationId: 'draft-1' },
        organizationOptions: enabledKindOptions,
      }),
    ).toEqual({
      active: true,
      canCommit: true,
      commitLabel: BUILDING_ORGANIZATIONS_ADD_RELATIONSHIP_LABEL,
      commitTarget: { kind: 'form', formId: BUILDING_NEW_ORGANIZATION_FORM_ID },
    })
  })

  it('uses the update label while editing a pending relationship', () => {
    expect(
      resolveBuildingOrganizationChildWorkflowView({
        composerMode: 'composing',
        composerStage: 'review',
        editingDraftId: 'relationship-1',
        kind: 'owns',
        selectedOrganization: { kind: 'existing', organizationId: 'organization-1' },
        organizationOptions: enabledKindOptions,
      }),
    ).toMatchObject({
      commitLabel: BUILDING_ORGANIZATIONS_UPDATE_RELATIONSHIP_LABEL,
    })
  })
})
