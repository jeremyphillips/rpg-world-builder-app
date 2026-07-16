import { describe, expect, it } from 'vitest'

import { pickClass } from '../../../lib/fixtures/pick'
import {
  characterCreationProficienciesFromFormValues,
  characterCreationProficienciesToFormValues,
} from './class-character-creation-proficiencies-form-values'

describe('characterCreationProficiencies form values', () => {
  it('maps bard skill and tool pool choices to flat form state', () => {
    const bard = pickClass('bard')
    expect(characterCreationProficienciesToFormValues(bard.characterCreation)).toMatchObject({
      skills: { choose: 3, from: expect.arrayContaining(['performance', 'persuasion']) },
      tools: {
        choose: 3,
        poolSource: 'filtered',
        poolToolCategories: ['musical_instrument'],
      },
    })
  })

  it('persists both skill and tool choices for bard', () => {
    const bard = pickClass('bard')
    const formValues = characterCreationProficienciesToFormValues(bard.characterCreation)
    const persisted = characterCreationProficienciesFromFormValues(formValues, bard)
    expect(persisted?.skills?.choices).toEqual(
      bard.characterCreation?.proficiencies?.skills?.choices,
    )
    expect(persisted?.tools?.choices?.[0]).toMatchObject({
      id: 'class-tools',
      choose: 3,
      pool: { source: 'filtered', toolCategories: ['musical_instrument'] },
    })
  })

  it('omits tool choices when choose is zero', () => {
    const persisted = characterCreationProficienciesFromFormValues({
      skills: { choose: 2, from: ['acrobatics', 'stealth'] },
      tools: {
        choose: 0,
        poolSource: 'filtered',
        poolToolCategories: ['musical_instrument'],
      },
    })
    expect(persisted?.skills).toBeDefined()
    expect(persisted?.tools).toBeUndefined()
  })

  it('omits skill choices when from is empty', () => {
    const persisted = characterCreationProficienciesFromFormValues({
      skills: { choose: 2, from: [] },
      tools: {
        choose: 1,
        poolSource: 'explicit',
        poolToolSlugs: ['lute'],
      },
    })
    expect(persisted?.skills).toBeUndefined()
    expect(persisted?.tools?.choices?.[0]?.pool).toEqual({
      source: 'explicit',
      toolSlugs: ['lute'],
    })
  })

  it('normalizes legacy from slugs to explicit pool on save', () => {
    const persisted = characterCreationProficienciesFromFormValues({
      skills: { choose: 0, from: [] },
      tools: {
        choose: 2,
        poolSource: 'explicit',
        poolToolSlugs: ['lute', 'flute'],
      },
    })
    expect(persisted?.tools?.choices?.[0]).toEqual({
      id: 'class-tools',
      choose: 2,
      pool: { source: 'explicit', toolSlugs: ['lute', 'flute'] },
    })
  })
})
