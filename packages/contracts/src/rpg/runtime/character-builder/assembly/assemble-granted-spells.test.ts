import { describe, expect, it } from 'vitest'

import {
  assembleGrantedSpells,
  collectUnresolvedGrantedSpellIds,
  mergeCharacterSpellEntries,
} from './assemble-granted-spells'
import type { CharacterSpellEntry } from '../../character/sheet/spells'

describe('assembleGrantedSpells', () => {
  it('assembles free-cast-only racial spells outside class collections', () => {
    const draft = {
      class: { classId: 'srd-cc-5.2.1:fighter', level: 1 },
      species: { speciesId: 'srd-cc-5.2.1:elf', heritageId: 'drow' },
    } as const

    const catalogIndex = {
      species: new Map([
        [
          'srd-cc-5.2.1:elf',
          {
            id: 'srd-cc-5.2.1:elf',
            traits: [],
            heritage: {
              options: [
                {
                  kind: 'custom',
                  id: 'drow',
                  name: 'Drow',
                  grantGroups: [
                    {
                      grants: [
                        {
                          id: 'spells-1',
                          kind: 'spells',
                          ability: 'cha',
                          casting: { mode: 'free_cast', frequency: 'at_will' },
                          spellIds: ['dancing-lights'],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          },
        ],
      ]),
      classes: new Map(),
      languages: new Map(),
      equipment: new Map(),
      weapons: new Map(),
      armor: new Map(),
      tools: new Map(),
      spells: new Map([['dancing-lights', { id: 'dancing-lights' }]]),
      feats: new Map(),
      backgrounds: new Map(),
      skills: new Map(),
    }

    const entries = assembleGrantedSpells(draft as never, catalogIndex as never)
    expect(entries).toEqual([
      {
        spellId: 'dancing-lights',
        sources: [
          {
            kind: 'heritageOption',
            sourceId: 'srd-cc-5.2.1:elf',
            grantId: 'drow',
            grantRowId: 'spells-1',
          },
        ],
        access: { granted: true },
        castingEntitlements: [
          {
            mode: 'free_cast',
            frequency: 'at_will',
            allowsSlotCasting: false,
            sources: [
              {
                kind: 'heritageOption',
                sourceId: 'srd-cc-5.2.1:elf',
                grantId: 'drow',
                grantRowId: 'spells-1',
              },
            ],
          },
        ],
      },
    ])
  })

  it('merges availability and casting on a single grant row', () => {
    const draft = {
      class: { classId: 'srd-cc-5.2.1:warlock', level: 9 },
      species: { speciesId: undefined },
    } as const

    const catalogIndex = {
      species: new Map(),
      classes: new Map([
        [
          'srd-cc-5.2.1:warlock',
          {
            id: 'srd-cc-5.2.1:warlock',
            features: [
              {
                id: 'contact-patron',
                level: 9,
                grantGroups: [
                  {
                    grants: [
                      {
                        id: 'spells-2',
                        kind: 'spells',
                        ability: 'cha',
                        availability: 'always_prepared',
                        casting: {
                          mode: 'free_cast',
                          frequency: 'once_per_long_rest',
                        },
                        spellIds: ['contact-other-plane'],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      ]),
      languages: new Map(),
      equipment: new Map(),
      weapons: new Map(),
      armor: new Map(),
      tools: new Map(),
      spells: new Map([['contact-other-plane', { id: 'contact-other-plane' }]]),
      feats: new Map(),
      backgrounds: new Map(),
      skills: new Map(),
    }

    const characterClass = catalogIndex.classes.get('srd-cc-5.2.1:warlock')

    const entries = assembleGrantedSpells(
      draft as never,
      catalogIndex as never,
      characterClass as never,
    )
    expect(
      collectUnresolvedGrantedSpellIds(
        draft as never,
        catalogIndex as never,
        characterClass as never,
      ),
    ).toEqual([])
    expect(entries[0]).toMatchObject({
      spellId: 'contact-other-plane',
      access: { alwaysPrepared: true },
      castingEntitlements: [
        {
          mode: 'free_cast',
          frequency: 'once_per_long_rest',
          allowsSlotCasting: false,
        },
      ],
    })
  })

  it('omits an unresolved grant reference and reports granted_spell_unavailable', () => {
    const draft = {
      class: { classId: 'srd-cc-5.2.1:fighter', level: 1 },
      species: { speciesId: 'srd-cc-5.2.1:elf', heritageId: 'drow' },
    } as const
    const catalogIndex = {
      species: new Map([
        [
          'srd-cc-5.2.1:elf',
          {
            id: 'srd-cc-5.2.1:elf',
            traits: [],
            heritage: {
              options: [
                {
                  id: 'drow',
                  grantGroups: [
                    {
                      grants: [
                        {
                          id: 'missing-spells',
                          kind: 'spells',
                          ability: 'cha',
                          casting: { mode: 'free_cast', frequency: 'at_will' },
                          spellIds: ['srd-cc-5.2.1:missing'],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          },
        ],
      ]),
      classes: new Map(),
      spells: new Map(),
    }

    expect(assembleGrantedSpells(draft as never, catalogIndex as never)).toEqual([])
    expect(collectUnresolvedGrantedSpellIds(draft as never, catalogIndex as never)).toEqual([
      'srd-cc-5.2.1:missing',
    ])
  })
})

describe('mergeCharacterSpellEntries', () => {
  it('merges class-known and grant-derived rows by spellId', () => {
    const classSpells: CharacterSpellEntry[] = [
      {
        spellId: 'bless',
        access: { classKnown: true },
        selection: { prepared: true },
        sources: [{ kind: 'classSpellcasting', sourceId: 'cleric', grantId: 'spells' }],
      },
    ]

    const grantedSpells: CharacterSpellEntry[] = [
      {
        spellId: 'bless',
        access: { alwaysPrepared: true },
        sources: [{ kind: 'classFeature', sourceId: 'cleric', grantId: 'life-domain' }],
      },
    ]

    const merged = mergeCharacterSpellEntries(classSpells, grantedSpells)
    expect(merged).toHaveLength(1)
    expect(merged[0]?.access).toEqual({ classKnown: true, alwaysPrepared: true })
    expect(merged[0]?.selection).toEqual({ prepared: true })
    expect(merged[0]?.sources).toHaveLength(2)
  })
})
