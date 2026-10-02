import { describe, expect, it } from 'vitest'

import { toEquipmentContentId } from '@rpg/contracts'

import { reconcileQuickNpcEquipmentSelections } from './quick-npc-equipment-selections.lib'

const RULESET = 'srd-cc-5.2.1' as const

function id(slug: string): string {
  return toEquipmentContentId(RULESET, slug)
}

describe('reconcileQuickNpcEquipmentSelections', () => {
  it('seeds a classless role and keeps a later manual add across a role change', () => {
    const seeded = reconcileQuickNpcEquipmentSelections({
      current: [],
      previous: { level: 0 },
      next: { templateId: 'guard', classId: '', level: 0, rulesetId: RULESET },
    })
    expect(seeded.map((row) => row.equipmentId)).toEqual([id('spear'), id('leather-armor')])
    expect(seeded.every((row) => row.origin === 'role-default')).toBe(true)

    const withRope = [
      ...seeded,
      { equipmentId: id('rope'), quantity: 1, origin: 'manual' as const },
    ]
    const scout = reconcileQuickNpcEquipmentSelections({
      current: withRope,
      previous: { templateId: 'guard', classId: '', level: 0 },
      next: { templateId: 'scout', classId: '', level: 0, rulesetId: RULESET },
    })
    expect(scout.some((row) => row.equipmentId === id('spear'))).toBe(false)
    expect(scout.find((row) => row.equipmentId === id('leather-armor'))).toMatchObject({
      origin: 'role-default',
      quantity: 1,
    })
    expect(scout.find((row) => row.equipmentId === id('rope'))).toMatchObject({
      origin: 'manual',
      quantity: 1,
    })
    expect(scout.find((row) => row.equipmentId === id('arrows'))).toMatchObject({
      origin: 'role-default',
      quantity: 20,
    })
  })

  it('does not duplicate a manual item that the new role also defaults', () => {
    const next = reconcileQuickNpcEquipmentSelections({
      current: [{ equipmentId: id('dagger'), quantity: 1, origin: 'manual' }],
      previous: { templateId: 'guard', classId: '', level: 0 },
      next: { templateId: 'scout', classId: '', level: 0, rulesetId: RULESET },
    })
    expect(next.filter((row) => row.equipmentId === id('dagger'))).toEqual([
      { equipmentId: id('dagger'), quantity: 1, origin: 'manual' },
    ])
  })

  it('drops role defaults when a class is selected and reseeds them when the class is cleared', () => {
    const classed = reconcileQuickNpcEquipmentSelections({
      current: [
        { equipmentId: id('spear'), quantity: 1, origin: 'role-default' },
        { equipmentId: id('rope'), quantity: 1, origin: 'manual' },
      ],
      previous: { templateId: 'guard', classId: '', level: 0 },
      next: { templateId: 'guard', classId: 'srd-cc-5.2.1:fighter', level: 1, rulesetId: RULESET },
    })
    expect(classed).toEqual([{ equipmentId: id('rope'), quantity: 1, origin: 'manual' }])

    const classless = reconcileQuickNpcEquipmentSelections({
      current: classed,
      previous: { templateId: 'guard', classId: 'srd-cc-5.2.1:fighter', level: 1 },
      next: { templateId: 'guard', classId: '', level: 0, rulesetId: RULESET },
    })
    expect(classless.map((row) => `${row.origin}:${row.equipmentId}`)).toEqual([
      `role-default:${id('spear')}`,
      `role-default:${id('leather-armor')}`,
      `manual:${id('rope')}`,
    ])
  })

  it('keeps a removed default until the role changes', () => {
    const kept = reconcileQuickNpcEquipmentSelections({
      current: [{ equipmentId: id('spear'), quantity: 1, origin: 'role-default' }],
      previous: { templateId: 'guard', classId: '', level: 0 },
      next: { templateId: 'guard', classId: '', level: 0, rulesetId: RULESET },
    })
    expect(kept).toHaveLength(1)
  })

  it('preserves role default rows when the template is unchanged', () => {
    const seeded = reconcileQuickNpcEquipmentSelections({
      current: [],
      previous: { templateId: 'guard', classId: '', level: 0 },
      next: { templateId: 'guard', classId: '', level: 0, rulesetId: RULESET },
    })
    const withManual = [
      ...seeded,
      { equipmentId: id('rope'), quantity: 1, origin: 'manual' as const },
    ]
    const unchanged = reconcileQuickNpcEquipmentSelections({
      current: withManual,
      previous: { templateId: 'guard', classId: '', level: 0 },
      next: { templateId: 'guard', classId: '', level: 0, rulesetId: RULESET },
    })
    expect(unchanged).toEqual(withManual)
  })
})
