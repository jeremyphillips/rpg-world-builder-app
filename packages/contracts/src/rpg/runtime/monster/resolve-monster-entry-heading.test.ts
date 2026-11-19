import { describe, expect, it } from 'vitest'

import type { CreatureFormsDraft } from '../../content/creature/forms'
import { formatMonsterQualifiedHeading } from './spell-entry-presentation'
import {
  formatMonsterMissingFormLabel,
  resolveMonsterEntryHeading,
} from './resolve-monster-entry-heading'

const forms = {
  profileFormId: 'profile',
  trueForm: { kind: 'profile' },
  definedForms: [
    { id: 'bear', name: 'Bear' },
    { id: 'hybrid', name: 'Bear-humanoid hybrid' },
    { id: 'blank', name: '   ' },
  ],
} as CreatureFormsDraft

function heading(onlyInFormIds?: readonly string[], name = 'Bite') {
  return resolveMonsterEntryHeading({
    name,
    onlyInFormIds,
    forms,
    creatureName: 'Werebear',
  })
}

describe('resolveMonsterEntryHeading', () => {
  it('returns the base name when the restriction is absent or empty', () => {
    expect(heading(undefined)).toEqual({ name: 'Bite' })
    expect(heading([])).toEqual({ name: 'Bite' })
    expect(heading(undefined, '  Bite  ')).toEqual({ name: 'Bite' })
  })

  it('qualifies one form, several forms in stored order, and duplicate ids', () => {
    expect(heading(['bear'])).toEqual({ name: 'Bite', formQualifier: 'Bear Form Only' })
    expect(heading(['hybrid', 'bear'])).toEqual({
      name: 'Bite',
      formQualifier: 'Bear-humanoid hybrid or Bear Form Only',
    })
    expect(heading(['bear', 'bear']).formQualifier).toBe('Bear or Bear Form Only')
  })

  it('keeps unresolved and blank forms visible', () => {
    expect(heading(['gone']).formQualifier).toBe(
      `${formatMonsterMissingFormLabel('gone')} Form Only`,
    )
    expect(heading(['blank']).formQualifier).toBe('Untitled form Form Only')
    expect(heading(['bear'], '  ').name).toBe('')
  })

  it('formats with the existing heading helper, including limited use', () => {
    const resolved = heading(['bear'])
    expect(
      formatMonsterQualifiedHeading(resolved.name, {
        formQualifier: resolved.formQualifier,
        limitedUse: { kind: 'recharge', minRoll: 5 },
      }),
    ).toBe('Bite (Recharge 5–6; Bear Form Only)')
  })
})
