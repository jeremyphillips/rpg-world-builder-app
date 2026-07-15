import { describe, expect, it } from 'vitest'

import type { CharacterBuilderDraftIdentity } from '@rpg/contracts'

import type { IdentityFormValues } from './identity-form-fields'
import {
  areIdentityDraftsEqual,
  emptyNarrativeFormValues,
  identityDraftToFormValues,
  identityFormValuesToDraft,
} from './identity-form-values'

const emptyNarrative = emptyNarrativeFormValues()

const fullIdentityDraft: CharacterBuilderDraftIdentity = {
  name: 'Verna',
  alignment: 'ng',
  narrative: {
    personalityTraits: ['Quiet and watchful.'],
    ideals: ['Protect the weak.'],
    bonds: ['My clan'],
    flaws: ['Stubborn'],
    backstory: '<p>A veteran soldier.</p>',
  },
}

describe('identityDraftToFormValues', () => {
  it('maps all narrative slots to form values', () => {
    expect(identityDraftToFormValues(fullIdentityDraft)).toEqual({
      name: 'Verna',
      alignment: 'ng',
      narrative: {
        personalityTraits: [{ value: 'Quiet and watchful.' }],
        ideals: [{ value: 'Protect the weak.' }],
        bonds: [{ value: 'My clan' }],
        flaws: [{ value: 'Stubborn' }],
        backstory: '<p>A veteran soldier.</p>',
      },
    })
  })

  it('seeds blank rows when narrative is unset', () => {
    expect(identityDraftToFormValues({ name: 'Verna' }).narrative).toEqual(emptyNarrative)
  })
})

describe('identityFormValuesToDraft', () => {
  it('omits blank narrative rows from the draft', () => {
    const values = {
      name: 'Verna',
      narrative: {
        ...emptyNarrative,
        personalityTraits: [{ value: 'Quiet and watchful.' }],
      },
      alignment: '',
    } as unknown as IdentityFormValues

    expect(identityFormValuesToDraft(values)).toEqual({
      name: 'Verna',
      narrative: { personalityTraits: ['Quiet and watchful.'] },
    })
  })

  it('drops untouched blank narrative rows on save', () => {
    const values = {
      name: 'Verna',
      narrative: emptyNarrative,
      alignment: '',
    } as unknown as IdentityFormValues

    expect(identityFormValuesToDraft(values)).toEqual({ name: 'Verna' })
  })

  it('round-trips all narrative fields through form values', () => {
    const values = identityDraftToFormValues(fullIdentityDraft)
    expect(identityFormValuesToDraft(values)).toEqual(fullIdentityDraft)
  })

  it('compares normalized identity drafts', () => {
    expect(areIdentityDraftsEqual({ name: 'Verna' }, { name: 'Verna', alignment: undefined })).toBe(
      true,
    )
    expect(areIdentityDraftsEqual({ name: 'Verna' }, { name: 'Other' })).toBe(false)
  })
})
