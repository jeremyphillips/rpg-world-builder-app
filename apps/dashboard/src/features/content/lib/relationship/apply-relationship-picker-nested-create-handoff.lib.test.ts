import { describe, expect, it, vi } from 'vitest'

import { applyRelationshipPickerNestedCreateHandoff } from './apply-relationship-picker-nested-create-handoff.lib'

describe('applyRelationshipPickerNestedCreateHandoff', () => {
  it('invokes organization selection when handoff is selected', () => {
    const onSelectCreatedOrganization = vi.fn()

    applyRelationshipPickerNestedCreateHandoff(
      { status: 'selected', organizationId: 'org-1' },
      { onSelectCreatedOrganization },
    )

    expect(onSelectCreatedOrganization).toHaveBeenCalledWith('org-1')
  })

  it('does not invoke callbacks for non-selected handoff statuses', () => {
    const onSelectCreatedOrganization = vi.fn()
    const onSelectCreatedLocation = vi.fn()
    const onSelectCreatedNpc = vi.fn()

    applyRelationshipPickerNestedCreateHandoff(
      { status: 'ineligible' },
      { onSelectCreatedOrganization, onSelectCreatedLocation, onSelectCreatedNpc },
    )

    expect(onSelectCreatedOrganization).not.toHaveBeenCalled()
    expect(onSelectCreatedLocation).not.toHaveBeenCalled()
    expect(onSelectCreatedNpc).not.toHaveBeenCalled()
  })
})
