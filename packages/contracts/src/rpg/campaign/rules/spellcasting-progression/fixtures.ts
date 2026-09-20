import type { SpellcastingProgressionSeed } from './patch'
import { indexSpellcastingProgressionRecords } from './patch'

/** Minimal slot + profile seed for contract/runtime tests (fixture class slugs). */
export const spellcastingProgressionTestSeed: SpellcastingProgressionSeed = {
  slotProgressions: [
    {
      id: 'full-caster',
      label: 'Full caster',
      kind: 'leveled',
      extension: 'carryForward',
      rows: [
        { level: 1, slots: [2] },
        { level: 2, slots: [3] },
        { level: 3, slots: [4, 2] },
        { level: 5, slots: [4, 3, 2] },
      ],
    },
    {
      id: 'half-caster',
      label: 'Half caster',
      kind: 'leveled',
      extension: 'carryForward',
      rows: [
        { level: 1, slots: [2] },
        { level: 5, slots: [4, 2] },
      ],
    },
    {
      id: 'pact-magic',
      label: 'Pact Magic',
      kind: 'pact',
      extension: 'carryForward',
      rows: [
        { level: 1, slotCount: 1, slotLevel: 1 },
        { level: 2, slotCount: 2, slotLevel: 1 },
      ],
    },
  ],
  profiles: [
    {
      id: 'fixture:wizard',
      label: 'Fixture wizard',
      choiceProgressions: [
        {
          id: 'cantrips',
          kind: 'capacity',
          extension: 'carryForward',
          source: { kind: 'classList' },
          destination: 'cantrips',
          mutation: { kind: 'replace', trigger: 'longRest', limit: 1 },
          curve: { rows: [{ level: 1, count: 3 }] },
          presentation: { column: { enabled: true, label: 'Cantrips' } },
        },
        {
          id: 'spellbook-gain',
          kind: 'gain',
          extension: 'zero',
          source: { kind: 'classList' },
          destination: 'spellbook',
          mutation: { kind: 'none' },
          curve: { rows: [{ level: 1, count: 6 }] },
          presentation: { column: { enabled: false, label: 'Spellbook Spells' } },
        },
        {
          id: 'prepared',
          kind: 'capacity',
          extension: 'carryForward',
          source: { kind: 'collection', collection: 'spellbook' },
          destination: 'prepared',
          mutation: { kind: 'replace', trigger: 'longRest', limit: 'all' },
          curve: { rows: [{ level: 1, count: 4 }] },
          presentation: { column: { enabled: true, label: 'Prepared Spells' } },
        },
      ],
    },
    {
      id: 'fixture:paladin',
      label: 'Fixture paladin',
      choiceProgressions: [
        {
          id: 'prepared',
          kind: 'capacity',
          extension: 'carryForward',
          source: { kind: 'classList' },
          destination: 'prepared',
          mutation: { kind: 'replace', trigger: 'longRest', limit: 1 },
          curve: { rows: [{ level: 1, count: 2 }] },
          presentation: { column: { enabled: true, label: 'Prepared Spells' } },
        },
      ],
    },
    {
      id: 'fixture:warlock',
      label: 'Fixture warlock',
      choiceProgressions: [
        {
          id: 'cantrips',
          kind: 'capacity',
          extension: 'carryForward',
          source: { kind: 'classList' },
          destination: 'cantrips',
          mutation: { kind: 'replace', trigger: 'longRest', limit: 1 },
          curve: { rows: [{ level: 1, count: 2 }] },
          presentation: { column: { enabled: true, label: 'Cantrips' } },
        },
        {
          id: 'repertoire',
          kind: 'capacity',
          extension: 'carryForward',
          source: { kind: 'classList' },
          destination: 'repertoire',
          mutation: { kind: 'replace', trigger: 'longRest', limit: 1 },
          curve: { rows: [{ level: 1, count: 2 }] },
          presentation: { column: { enabled: true, label: 'Prepared Spells' } },
        },
      ],
    },
  ],
}

export const spellcastingProgressionTestConfig = indexSpellcastingProgressionRecords(
  spellcastingProgressionTestSeed,
)
