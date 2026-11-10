import { describe, expect, it } from 'vitest'

import { joinMasterDetailCaption, type MasterDetailItemMeta } from './master-detail-item-meta'

const bite: MasterDetailItemMeta = {
  provenance: 'homebrew',
  persistence: 'new',
  kindLabel: 'Natural weapon',
  sectionLabel: 'Actions',
}

describe('joinMasterDetailCaption', () => {
  it('shows kind and unsaved in the list and adds section and source name in the detail', () => {
    expect(joinMasterDetailCaption(bite, 'list')).toBe('Natural weapon · Unsaved')
    expect(joinMasterDetailCaption(bite, 'detail', 'Bite')).toBe(
      'Bite · Natural weapon · Actions · Unsaved',
    )
  })

  it('drops unsaved after the same facts become persisted', () => {
    const saved = { ...bite, persistence: 'persisted' as const }
    expect(joinMasterDetailCaption(saved, 'list')).toBe('Natural weapon')
    expect(joinMasterDetailCaption(saved, 'detail')).toBe('Natural weapon · Actions')
    expect(
      joinMasterDetailCaption(
        {
          provenance: 'system',
          persistence: 'persisted',
          eyebrow: 'Level 1',
        },
        'detail',
      ),
    ).toBe('Level 1 · System')
  })

  it('shows provenance when there is no kind, and unsaved instead of provenance when new', () => {
    const trait: MasterDetailItemMeta = { provenance: 'homebrew', persistence: 'persisted' }
    expect(joinMasterDetailCaption(trait, 'list')).toBe('Homebrew')
    expect(joinMasterDetailCaption({ ...trait, persistence: 'new' }, 'detail')).toBe('Unsaved')
    expect(
      joinMasterDetailCaption({ provenance: 'system', persistence: 'persisted' }, 'list'),
    ).toBe('System')
  })

  it('does not emit empty separators', () => {
    expect(
      joinMasterDetailCaption(
        { provenance: 'system', persistence: 'persisted', kindLabel: 'Weapon' },
        'detail',
      ),
    ).toBe('Weapon')
  })
})
