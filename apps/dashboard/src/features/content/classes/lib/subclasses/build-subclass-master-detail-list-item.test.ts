import { describe, expect, it } from 'vitest'

import { buildSubclassMasterDetailListItem } from './build-subclass-master-detail-list-item'

describe('buildSubclassMasterDetailListItem', () => {
  it('maps name, source, modified eyebrow, and availability', () => {
    const item = buildSubclassMasterDetailListItem({
      item: {
        id: 'sub_a',
        name: 'Champion',
        source: 'system',
        classId: 'class_fighter',
      },
      isModified: true,
      isAvailable: false,
    })

    expect(item).toMatchObject({
      id: 'sub_a',
      title: 'Champion',
      meta: { eyebrow: 'Modified', sourceLabel: 'System' },
      active: false,
      deletable: false,
    })
  })

  it('marks unsaved drafts as deletable homebrew rows', () => {
    const item = buildSubclassMasterDetailListItem({
      item: {
        id: 'draft-abc',
        name: '',
        source: 'unsaved',
        classId: 'class_fighter',
      },
      isModified: false,
      isAvailable: true,
    })

    expect(item.meta?.sourceLabel).toBe('Unsaved')
    expect(item.deletable).toBe(true)
  })
})
