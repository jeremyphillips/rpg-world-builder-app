import { describe, expect, it } from 'vitest'

import {
  formatCantripAcquisitionCopy,
  formatSpellAcquisitionCopy,
  spellAcquisitionCopyLines,
} from './format-spell-acquisition-copy'

describe('formatSpellAcquisitionCopy', () => {
  it('formats full-list prepared copy with long-rest replacement', () => {
    const copy = formatSpellAcquisitionCopy({
      spellSelection: {
        model: 'prepareFromClassList',
        change: { kind: 'replace', trigger: 'longRest', limit: 'all' },
      },
      className: 'Druid',
      max: 6,
      requiredToComplete: true,
      destination: 'classList',
    })

    expect(spellAcquisitionCopyLines(copy)).toEqual([
      'Prepare 6 spells from the Druid spell list.',
      'You can change your prepared spells after a long rest.',
    ])
  })

  it('formats optional prepared copy with up to wording', () => {
    const copy = formatSpellAcquisitionCopy({
      spellSelection: {
        model: 'prepareFromClassList',
        change: { kind: 'replace', trigger: 'longRest', limit: 'all' },
      },
      className: 'Druid',
      max: 6,
      requiredToComplete: false,
      destination: 'classList',
    })

    expect(copy.lead).toBe('Prepare up to 6 spells from the Druid spell list.')
  })

  it('formats replace-one prepared copy with capitalized trigger', () => {
    const copy = formatSpellAcquisitionCopy({
      spellSelection: {
        model: 'prepareFromClassList',
        change: { kind: 'replace', trigger: 'longRest', limit: 1 },
      },
      className: 'Paladin',
      max: 2,
      requiredToComplete: true,
      destination: 'classList',
    })

    expect(copy.change).toBe('After a long rest, you can replace 1 prepared spell.')
  })

  it('formats limited repertoire on two lines', () => {
    const copy = formatSpellAcquisitionCopy({
      spellSelection: {
        model: 'limitedRepertoire',
        change: { kind: 'replace', trigger: 'levelUp', limit: 1 },
      },
      className: 'Bard',
      max: 4,
      requiredToComplete: true,
      destination: 'classList',
    })

    expect(spellAcquisitionCopyLines(copy)).toEqual([
      'Prepare 4 spells from the Bard spell list.',
      'These remain prepared as you gain levels; when you gain a class level, you can replace 1.',
    ])
  })

  it('formats spellbook acquisition without change copy', () => {
    const copy = formatSpellAcquisitionCopy({
      spellSelection: {
        model: 'prepareFromLearnedCollection',
        collection: 'spellbook',
        acquisition: { curve: { rows: [{ level: 1, count: 6 }] }, extension: 'zero' },
        change: { kind: 'replace', trigger: 'longRest', limit: 'all' },
      },
      className: 'Wizard',
      max: 6,
      requiredToComplete: true,
      destination: 'spellbook',
    })

    expect(spellAcquisitionCopyLines(copy)).toEqual([
      'Learn 6 spells from the Wizard spell list and add them to your spellbook.',
      'Spells in your spellbook remain there and can be prepared later.',
    ])
  })

  it('formats deferred prepared-from-spellbook copy', () => {
    const copy = formatSpellAcquisitionCopy({
      spellSelection: {
        model: 'prepareFromLearnedCollection',
        collection: 'spellbook',
        acquisition: { curve: { rows: [{ level: 1, count: 6 }] }, extension: 'zero' },
        change: { kind: 'replace', trigger: 'longRest', limit: 'all' },
      },
      className: 'Wizard',
      max: 4,
      requiredToComplete: true,
      destination: 'deferredPrepared',
    })

    expect(spellAcquisitionCopyLines(copy)).toEqual([
      'Prepare 4 spells from your spellbook.',
      'You can change your prepared spells after a long rest.',
    ])
  })

  it('never exceeds two acquisition lines', () => {
    const copy = formatSpellAcquisitionCopy({
      spellSelection: {
        model: 'limitedRepertoire',
        change: { kind: 'replace', trigger: 'levelUp', limit: 1 },
      },
      className: 'Bard',
      max: 4,
      requiredToComplete: true,
      destination: 'classList',
    })

    expect(spellAcquisitionCopyLines(copy)).toHaveLength(2)
  })
})

describe('formatCantripAcquisitionCopy', () => {
  it('uses to-learn cantrip wording', () => {
    expect(spellAcquisitionCopyLines(formatCantripAcquisitionCopy('Druid', 3, true))).toEqual([
      'Choose 3 cantrips to learn from the Druid spell list.',
    ])
  })

  it('supports optional cantrip copy', () => {
    expect(formatCantripAcquisitionCopy('Druid', 3, false).lead).toBe(
      'Choose up to 3 cantrips to learn from the Druid spell list.',
    )
  })
})
