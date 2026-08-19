import { describe, expect, it } from 'vitest'

import { CREATE_SETUP_DEFAULT_GROUPED_SUMMARY_EYEBROW } from '@/lib/create-setup'

import {
  resolveBuildingOrganizationComposerView,
  resolveBuildingOrganizationHasResolvedOrganizationTarget,
} from './building-organizations-create-tab-controller.lib'

describe('resolveBuildingOrganizationComposerView', () => {
  it('shows active relationship radios without a summary row on intent', () => {
    const view = resolveBuildingOrganizationComposerView({
      composerStage: 'intent',
      editingDecision: null,
      kindLabel: null,
      organizationName: null,
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
      hasKind: true,
      hasResolvedOrganization: false,
      relationshipKindCount: 4,
    })

    expect(view.activeDecision).toBe('organization')
    expect(view.showDiscovery).toBe(true)
    expect(view.summaryEyebrow).toBe(CREATE_SETUP_DEFAULT_GROUPED_SUMMARY_EYEBROW)
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
      hasKind: true,
      hasResolvedOrganization: true,
      relationshipKindCount: 4,
    })

    expect(view.activeDecision).toBeNull()
    expect(view.showCommit).toBe(true)
    expect(view.summaryRows.map((row) => row.value)).toEqual(['Owner', 'City Bank'])
  })

  it('shows branch form with relationship row only and no placeholder organization row', () => {
    const view = resolveBuildingOrganizationComposerView({
      composerStage: 'branch',
      editingDecision: null,
      kindLabel: 'Owner',
      organizationName: 'New Organization',
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
        organizationName: 'New Organization',
      }),
    ).toBe(false)
  })
})
