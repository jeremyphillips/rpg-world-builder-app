import { describe, expect, it } from 'vitest'

import {
  meaningfulMultiattackTargetActionIds,
  multiattackReplacementShowsStaticCount,
  multiattackSequenceAttackIds,
  primaryAttackSlotTotal,
  replacementCountMax,
  targetedAttackSlotTotal,
} from './multiattack-replacement-budget'

describe('multiattack replacement budget', () => {
  it('sums primary attack group counts only', () => {
    expect(
      primaryAttackSlotTotal([
        { count: 2, actionIds: ['bite'] },
        { kind: 'use', mode: 'single', actionId: 'constrict' },
        { count: 1, actionIds: ['claw'] },
      ]),
    ).toBe(3)
  })

  it('counts targeted slots in fixed single-id groups only', () => {
    const steps = [
      { count: 1, actionIds: ['bite'] },
      { count: 2, actionIds: ['handaxe', 'rend'] },
    ]
    expect(targetedAttackSlotTotal(steps, 'bite')).toBe(1)
    expect(targetedAttackSlotTotal(steps, 'rend')).toBe(0)
  })

  it('limits replacement max when a named target is meaningful', () => {
    const steps = [
      { count: 1, actionIds: ['bite'] },
      { count: 1, actionIds: ['claw'] },
    ]
    expect(replacementCountMax({}, steps)).toBe(2)
    expect(replacementCountMax({ replacesActionId: 'claw' }, steps)).toBe(1)
  })

  it('detects meaningful targets', () => {
    const steps = [
      { count: 1, actionIds: ['bite'] },
      { count: 2, actionIds: ['handaxe', 'rend'] },
    ]
    expect(meaningfulMultiattackTargetActionIds(steps)).toEqual(['bite'])
  })

  it('shows static count only when the primary sequence has one attack slot', () => {
    expect(
      multiattackReplacementShowsStaticCount({ count: 1 }, [{ count: 1, actionIds: ['bite'] }]),
    ).toBe(true)
    expect(
      multiattackReplacementShowsStaticCount({ count: 1, replacesActionId: 'claw' }, [
        { count: 1, actionIds: ['bite'] },
        { count: 1, actionIds: ['claw'] },
      ]),
    ).toBe(false)
    expect(
      multiattackReplacementShowsStaticCount({ count: 3 }, [{ count: 3, actionIds: ['rend'] }]),
    ).toBe(false)
  })

  it('caps combo-only targets to one replacement', () => {
    const lichSteps = [{ count: 3, actionIds: ['eldritch-burst', 'paralyzing-touch'] }]
    expect(multiattackSequenceAttackIds(lichSteps)).toEqual(['eldritch-burst', 'paralyzing-touch'])
    expect(replacementCountMax({ replacesActionId: 'paralyzing-touch' }, lichSteps)).toBe(1)
    expect(
      multiattackReplacementShowsStaticCount(
        { count: 1, replacesActionId: 'paralyzing-touch' },
        lichSteps,
      ),
    ).toBe(false)
  })
})
