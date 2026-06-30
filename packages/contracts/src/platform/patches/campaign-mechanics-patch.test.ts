import { describe, expect, it } from 'vitest'

import {
  defaultCampaignMechanicsPatch,
  mechanicsDriftFromPreset,
  resolveMechanicsPatch,
  updateCampaignMechanicsInputSchema,
} from './campaign-mechanics-patch'
import { getEditionPresetMechanics } from '../vocab/mechanics'

describe('resolveMechanicsPatch', () => {
  it('returns 5e SRD defaults when patch is absent', () => {
    expect(resolveMechanicsPatch(undefined)).toEqual({
      editionPreset: { id: '5e', modified: false },
      armorClass: { mode: 'ascending', base: 10 },
      attackResolution: { mode: 'proficiency_attack_vs_ac' },
    })
  })

  it('materializes becmi preset knobs when only preset id is stored', () => {
    expect(
      resolveMechanicsPatch({
        editionPreset: { id: 'becmi' },
      }),
    ).toEqual({
      editionPreset: { id: 'becmi', modified: false },
      armorClass: { mode: 'descending', base: 9 },
      attackResolution: { mode: 'attack_matrix' },
    })
  })

  it('preserves appliedAt when stored on patch', () => {
    const resolved = resolveMechanicsPatch({
      editionPreset: {
        id: '3e',
        appliedAt: '2026-06-27T00:00:00.000Z',
      },
    })

    expect(resolved.editionPreset.appliedAt).toBe('2026-06-27T00:00:00.000Z')
  })

  it('uses stored modified flag when present', () => {
    const becmi = getEditionPresetMechanics('becmi')

    expect(
      resolveMechanicsPatch({
        editionPreset: { id: 'becmi', modified: true },
        armorClass: becmi.armorClass,
        attackResolution: becmi.attackResolution,
      }).editionPreset.modified,
    ).toBe(true)
  })

  it('detects drift when knobs differ from the selected preset bundle', () => {
    expect(
      resolveMechanicsPatch({
        editionPreset: { id: '5e' },
        armorClass: { mode: 'descending', base: 9 },
      }).editionPreset.modified,
    ).toBe(true)
  })

  it('does not mark modified when knobs match the selected preset bundle', () => {
    const preset = getEditionPresetMechanics('2e')

    expect(
      resolveMechanicsPatch({
        editionPreset: { id: '2e' },
        armorClass: preset.armorClass,
        attackResolution: preset.attackResolution,
      }).editionPreset.modified,
    ).toBe(false)
  })
})

describe('mechanicsDriftFromPreset', () => {
  it('returns false when knobs match the preset bundle', () => {
    const knobs = getEditionPresetMechanics('1e')
    expect(mechanicsDriftFromPreset('1e', knobs)).toBe(false)
  })

  it('returns true when attack resolution mode differs', () => {
    const knobs = getEditionPresetMechanics('3e')
    expect(
      mechanicsDriftFromPreset('3e', {
        ...knobs,
        attackResolution: { mode: 'thac0' },
      }),
    ).toBe(true)
  })
})

describe('defaultCampaignMechanicsPatch', () => {
  it('matches resolveMechanicsPatch(undefined)', () => {
    expect(defaultCampaignMechanicsPatch()).toEqual(resolveMechanicsPatch(undefined))
  })
})

describe('updateCampaignMechanicsInputSchema', () => {
  it('accepts partial knob updates without server-managed fields', () => {
    expect(
      updateCampaignMechanicsInputSchema.safeParse({
        armorClass: { mode: 'descending' },
      }).success,
    ).toBe(true)
  })

  it('rejects modified and appliedAt on edition preset input', () => {
    expect(
      updateCampaignMechanicsInputSchema.safeParse({
        editionPreset: {
          id: 'becmi',
          modified: true,
          appliedAt: '2026-06-27T00:00:00.000Z',
        },
      }).success,
    ).toBe(false)
  })

  it('rejects unknown fields', () => {
    expect(
      updateCampaignMechanicsInputSchema.safeParse({
        extra: true,
      }).success,
    ).toBe(false)
  })
})
