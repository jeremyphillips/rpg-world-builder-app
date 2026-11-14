import { describe, expect, it } from 'vitest'

import { buildSubclassMasterDetailListItem } from './build-subclass-master-detail-list-item'

describe('buildSubclassMasterDetailListItem', () => {
  it('maps name, source, modified eyebrow, and availability', () => {
    const item = buildSubclassMasterDetailListItem({
      item: {
        id: 'sub_a',
        name: 'Champion',
        catalogLayer: 'system',
        classId: 'class_fighter',
      },
      isModified: true,
      isAvailable: false,
    })

    expect(item).toMatchObject({
      id: 'sub_a',
      title: 'Champion',
      meta: { eyebrow: 'Modified', provenance: 'system', persistence: 'persisted' },
      availabilityStatusLabel: 'Unavailable',
      deletable: false,
    })
  })

  it('marks a saved homebrew draft as persisted', () => {
    const item = buildSubclassMasterDetailListItem({
      item: {
        id: 'sub_draft',
        name: 'Path',
        catalogLayer: 'homebrew',
        classId: 'class_fighter',
      },
      isModified: true,
      isAvailable: true,
    })

    expect(item.meta).toMatchObject({
      eyebrow: 'Modified',
      provenance: 'homebrew',
      persistence: 'persisted',
    })
  })

  it('marks local drafts as new homebrew rows', () => {
    const item = buildSubclassMasterDetailListItem({
      item: {
        id: 'draft-abc',
        name: '',
        catalogLayer: 'unsaved',
        classId: 'class_fighter',
      },
      isModified: false,
      isAvailable: true,
    })

    expect(item.meta).toMatchObject({ provenance: 'homebrew', persistence: 'new' })
    expect(item.deletable).toBe(true)
  })
})
