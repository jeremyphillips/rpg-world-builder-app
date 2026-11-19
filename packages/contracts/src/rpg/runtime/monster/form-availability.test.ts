import { describe, expect, it } from 'vitest'

import type { CreatureFormsDraft } from '../../content/creature/forms'
import { collectFormAvailabilityAdvisories, isMonsterRowAvailableInForm } from './form-availability'

const werebearForms: CreatureFormsDraft = {
  profileFormId: 'profile',
  trueForm: { kind: 'defined', formId: 'humanoid' },
  definedForms: [
    { id: 'humanoid', name: 'Humanoid' },
    { id: 'hybrid', name: 'Bear-humanoid hybrid' },
    { id: 'bear', name: 'Bear' },
  ],
}

describe('form availability advisories', () => {
  it('treats a missing list as every form and an empty list as none', () => {
    expect(isMonsterRowAvailableInForm({}, 'bear')).toBe(true)
    expect(isMonsterRowAvailableInForm({ onlyInFormIds: ['bear'] }, 'hybrid')).toBe(false)
    expect(isMonsterRowAvailableInForm({ onlyInFormIds: [] }, 'bear')).toBe(false)
  })

  it('accepts the Werebear multiattack because each form has an alternative', () => {
    expect(
      collectFormAvailabilityAdvisories({
        name: 'Werebear',
        forms: werebearForms,
        actions: [
          { id: 'handaxe', name: 'Handaxe', onlyInFormIds: ['humanoid', 'hybrid'] },
          { id: 'rend', name: 'Rend', onlyInFormIds: ['bear', 'hybrid'] },
          {
            id: 'multi',
            kind: 'multiattack',
            name: 'Multiattack',
            steps: [{ actionIds: ['handaxe', 'rend'] }],
          },
        ],
      }),
    ).toEqual([])
  })

  it('warns when a multiattack form has no eligible attack', () => {
    const advisories = collectFormAvailabilityAdvisories({
      name: 'Werebear',
      forms: werebearForms,
      actions: [
        { id: 'bite', name: 'Bite', onlyInFormIds: ['bear'] },
        {
          id: 'multi',
          kind: 'multiattack',
          name: 'Multiattack',
          steps: [{ actionIds: ['bite'] }],
        },
      ],
    })
    expect(advisories).toEqual([
      expect.objectContaining({
        code: 'form-restricted-multiattack',
        path: 'actions.1',
        message: expect.stringContaining('Humanoid or Bear-humanoid hybrid'),
      }),
    ])
  })

  it('warns when Deathless Strike is available where Grave Strike is not', () => {
    const advisories = collectFormAvailabilityAdvisories({
      name: 'Vampire',
      forms: {
        profileFormId: 'profile',
        trueForm: { kind: 'defined', formId: 'vampire' },
        definedForms: [
          { id: 'vampire', name: 'Vampire' },
          { id: 'bat', name: 'Bat' },
          { id: 'mist', name: 'Mist' },
        ],
      },
      actions: [{ id: 'grave', kind: 'attack', name: 'Grave Strike', onlyInFormIds: ['vampire'] }],
      legendaryActions: {
        actions: [
          {
            id: 'deathless',
            kind: 'action-reference',
            name: 'Deathless Strike',
            actionIds: ['grave'],
          },
        ],
      },
    })
    expect(advisories).toEqual([
      {
        code: 'form-restricted-reference',
        path: 'legendaryActions.actions.0',
        message: 'Grave Strike is unavailable in Bat or Mist form, where this action is available.',
      },
    ])
  })
})
