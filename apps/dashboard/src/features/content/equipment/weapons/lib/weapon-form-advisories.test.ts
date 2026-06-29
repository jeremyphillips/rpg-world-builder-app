import { describe, expect, it, vi } from 'vitest'
import { useForm } from 'react-hook-form'
import { renderHook, act } from '@testing-library/react'

import type { EquipmentFormValues } from '../../lib/equipment-form-def'
import {
  blockWeaponSaveForInvalidMastery,
  formatWeaponPropertyAdvisoryConfirmMessage,
  getWeaponFormPropertyAdvisories,
  weaponFormHasInvalidMastery,
} from './weapon-form-advisories'

describe('getWeaponFormPropertyAdvisories', () => {
  it('returns advisories for incompatible selected properties', () => {
    expect(
      getWeaponFormPropertyAdvisories({
        mode: 'ranged',
        properties: ['reach', 'finesse'],
      } as EquipmentFormValues),
    ).toEqual([
      {
        property: 'reach',
        mode: 'ranged',
        message: "Reach isn't compatible with ranged weapons.",
      },
    ])
  })
})

describe('weaponFormHasInvalidMastery', () => {
  it('flags cleave with ranged mode', () => {
    expect(
      weaponFormHasInvalidMastery({
        mode: 'ranged',
        mastery: 'cleave',
      } as EquipmentFormValues),
    ).toBe(true)
  })

  it('allows compatible mastery selections', () => {
    expect(
      weaponFormHasInvalidMastery({
        mode: 'ranged',
        mastery: 'vex',
      } as EquipmentFormValues),
    ).toBe(false)
  })
})

describe('blockWeaponSaveForInvalidMastery', () => {
  it('sets a mastery field error and returns true when blocked', () => {
    const { result } = renderHook(() =>
      useForm<EquipmentFormValues>({
        defaultValues: {
          mode: 'ranged',
          mastery: 'cleave',
        } as EquipmentFormValues,
      }),
    )

    const setError = vi.spyOn(result.current, 'setError')

    let blocked = false
    act(() => {
      blocked = blockWeaponSaveForInvalidMastery(result.current)
    })

    expect(blocked).toBe(true)
    expect(setError).toHaveBeenCalledWith('mastery', {
      type: 'manual',
      message: "Cleave isn't available for ranged weapons.",
    })
  })

  it('returns false when mastery is compatible', () => {
    const { result } = renderHook(() =>
      useForm<EquipmentFormValues>({
        defaultValues: {
          mode: 'ranged',
          mastery: 'vex',
        } as EquipmentFormValues,
      }),
    )

    const setError = vi.spyOn(result.current, 'setError')

    let blocked = false
    act(() => {
      blocked = blockWeaponSaveForInvalidMastery(result.current)
    })

    expect(blocked).toBe(false)
    expect(setError).not.toHaveBeenCalled()
  })
})

describe('formatWeaponPropertyAdvisoryConfirmMessage', () => {
  it('formats a single advisory confirm message', () => {
    expect(
      formatWeaponPropertyAdvisoryConfirmMessage([
        {
          property: 'reach',
          mode: 'ranged',
          message: "Reach isn't compatible with ranged weapons.",
        },
      ]),
    ).toBe("Reach isn't compatible with ranged weapons. Save anyway?")
  })

  it('joins multiple advisories before the confirm prompt', () => {
    expect(
      formatWeaponPropertyAdvisoryConfirmMessage([
        {
          property: 'reach',
          mode: 'ranged',
          message: "Reach isn't compatible with ranged weapons.",
        },
        {
          property: 'versatile',
          mode: 'ranged',
          message: "Versatile isn't compatible with ranged weapons.",
        },
      ]),
    ).toBe(
      "Reach isn't compatible with ranged weapons. Versatile isn't compatible with ranged weapons. Save anyway?",
    )
  })
})
