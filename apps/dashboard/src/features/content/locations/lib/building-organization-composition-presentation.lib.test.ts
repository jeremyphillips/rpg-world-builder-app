import { describe, expect, it, vi } from 'vitest'

import { mapBuildingOrganizationCompositionSummaryRows } from './building-organization-composition-presentation.lib'
import type { BuildingOrganizationComposerView } from './building-organizations-create-tab-controller.lib'

describe('mapBuildingOrganizationCompositionSummaryRows', () => {
  it('projects completed decisions without change handlers when change is hidden', () => {
    const composerView: BuildingOrganizationComposerView = {
      activeDecision: null,
      showDiscovery: false,
      showBranch: false,
      showCommit: false,
      showRelationshipChange: false,
      showOrganizationChange: false,
      summaryRows: [
        { id: 'relationship', decision: 'relationship', label: 'Relationship', value: 'Owner' },
      ],
    }

    expect(
      mapBuildingOrganizationCompositionSummaryRows({
        composerView,
        startEditingRelationship: vi.fn(),
        startEditingOrganization: vi.fn(),
      }),
    ).toEqual([{ id: 'relationship', label: 'Relationship', value: 'Owner' }])
  })

  it('projects change handlers for editable organization decisions', () => {
    const startEditingOrganization = vi.fn()
    const composerView: BuildingOrganizationComposerView = {
      activeDecision: null,
      showDiscovery: false,
      showBranch: false,
      showCommit: false,
      showRelationshipChange: false,
      showOrganizationChange: true,
      summaryRows: [
        {
          id: 'organization',
          decision: 'organizationResolved',
          label: 'Organization',
          value: 'Harbor Guild',
        },
      ],
    }

    const rows = mapBuildingOrganizationCompositionSummaryRows({
      composerView,
      startEditingRelationship: vi.fn(),
      startEditingOrganization,
    })

    expect(rows[0]?.onChange).toBe(startEditingOrganization)
    expect(rows[0]?.valueActionAriaLabel).toBe('Change organization')
  })
})
