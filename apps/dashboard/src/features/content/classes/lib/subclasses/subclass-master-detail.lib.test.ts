import { describe, expect, it, vi } from 'vitest'

import { buildMasterDetailAvailabilityPresentation } from '../../../lib/master-detail/master-detail-availability.types'
import { buildSubclassSelectedIdentity } from './subclass-master-detail.lib'

describe('buildSubclassSelectedIdentity', () => {
  it('returns undefined when required selection state is missing', () => {
    expect(
      buildSubclassSelectedIdentity({
        selectedId: null,
        selectedValues: null,
        selectedListItem: undefined,
        selectedEntity: undefined,
        selectedAvailability: undefined,
        modifiedIds: new Set(),
        onAvailabilityChange: vi.fn(),
      }),
    ).toBeUndefined()
  })

  it('builds identity with modified eyebrow and availability callback', () => {
    const onAvailabilityChange = vi.fn()

    const identity = buildSubclassSelectedIdentity({
      selectedId: 'sub_a',
      selectedValues: { name: 'Champion', features: [] },
      selectedListItem: {
        id: 'sub_a',
        name: 'Champion',
        source: 'system',
        classId: 'class_fighter',
      },
      selectedEntity: undefined,
      selectedAvailability: buildMasterDetailAvailabilityPresentation('sub_a', true),
      modifiedIds: new Set(['sub_a']),
      onAvailabilityChange,
    })

    expect(identity).toMatchObject({
      title: 'Champion',
      meta: { eyebrow: 'Modified', sourceLabel: 'System' },
      deletable: false,
    })
    identity?.onAvailabilityChange?.()
    expect(onAvailabilityChange).toHaveBeenCalledOnce()
  })
})
