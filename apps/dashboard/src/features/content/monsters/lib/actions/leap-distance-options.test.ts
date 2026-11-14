import { MEASURED_RANGE_FEET } from '@rpg/contracts'
import { describe, expect, it } from 'vitest'

import { leapJumpPresetFeet, leapMovementPresetFeet, readWalkSpeed } from './leap-distance-options'
import { formatLeapWalkSpeedHint, MONSTER_LEAP_MOVEMENT_HINT } from '../monster-form-labels'

describe('leap distance presets', () => {
  it('filters jump distances above the cost and costs below the jump', () => {
    expect(leapJumpPresetFeet(undefined)).toEqual(MEASURED_RANGE_FEET)
    expect(leapJumpPresetFeet(10)).not.toContain(10)
    expect(leapJumpPresetFeet(10)).toContain(15)
    expect(leapMovementPresetFeet(30, { status: 'missing' })).toEqual([5, 10, 15, 20, 25])
    expect(leapMovementPresetFeet(undefined, { status: 'missing' })).toEqual(MEASURED_RANGE_FEET)
  })

  it('narrows movement presets to a positive Walk Speed without treating zero as missing', () => {
    expect(leapMovementPresetFeet(30, { status: 'usable', feet: 30 })).toEqual([5, 10, 15, 20, 25])
    expect(leapMovementPresetFeet(30, { status: 'zero' })).toEqual([5, 10, 15, 20, 25])
    expect(leapMovementPresetFeet(30, { status: 'incomplete' })).toEqual([5, 10, 15, 20, 25])
    expect(leapMovementPresetFeet(undefined, { status: 'usable', feet: 30 })).toEqual([
      5, 10, 15, 20, 25, 30,
    ])
  })

  it('reads missing, blank, zero, and usable Walk rows', () => {
    expect(readWalkSpeed(undefined)).toEqual({ status: 'missing' })
    expect(readWalkSpeed([{ mode: 'fly', feet: 40 }])).toEqual({ status: 'missing' })
    expect(readWalkSpeed([{ mode: 'walk', feet: '' }])).toEqual({ status: 'incomplete' })
    expect(readWalkSpeed([{ mode: 'walk', feet: 0 }])).toEqual({ status: 'zero' })
    expect(
      readWalkSpeed([
        { mode: 'walk', feet: 30 },
        { mode: 'burrow', feet: 40 },
      ]),
    ).toEqual({
      status: 'usable',
      feet: 30,
    })
    expect(formatLeapWalkSpeedHint(30)).toBe(
      'Movement required to make the jump. Walk Speed: 30 ft.',
    )
    expect(MONSTER_LEAP_MOVEMENT_HINT).toBe('Movement required to make the jump.')
  })
})
