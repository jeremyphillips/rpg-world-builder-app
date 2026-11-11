import { describe, expect, it } from 'vitest'
import { formatSpellCastAtLevelName } from '@rpg/contracts'

import type { ContentFormCtx } from '../../../lib/forms/registry/content-form-registry'
import {
  LEGENDARY_CAST_SPELL_DISABLED_NOTE,
  LEGENDARY_REFERENCE_DISABLED_NOTE,
  LEGENDARY_SPELLCASTING_DISABLED_NOTE,
} from '../monster-form-labels'
import type { MonsterFormValues } from '../monster-form-values'
import { monsterActionDetailFields } from './monster-action-detail-fields'
import {
  createLegendaryActionDraft,
  legendaryActionAcquisitionItems,
  legendarySourceSpellOptions,
} from './monster-legendary-action-acquisition'
import { parseMonsterActionAcquisitionId } from './monster-action-acquisition'
import { resolveMonsterCreateDefaultValues } from '../monster-form-values'

const ctx = {
  spellCatalogStatus: 'pending',
  spellCatalogById: new Map([['srd:fear', { id: 'srd:fear', name: 'Fear' }]]),
} as unknown as ContentFormCtx

function names(fields: { name?: string }[]): string[] {
  return fields.flatMap((field) => (field.name ? [field.name] : []))
}

describe('legendary action acquisition', () => {
  it('groups the four choices and explains each disabled item', () => {
    const values = resolveMonsterCreateDefaultValues()
    const items = legendaryActionAcquisitionItems(values, ctx)
    expect(items.map((item) => [item.groupId, item.label, item.metadata])).toEqual([
      ['existing', 'Attack or ability', 'Use an action already defined for this creature.'],
      ['existing', 'Spellcasting', 'Cast a spell from an existing Spellcasting action.'],
      ['new', 'Cast a spell', 'Choose a spell from the catalog.'],
      ['new', 'Custom ability', 'Write a standalone legendary ability.'],
    ])
    expect(items.find((item) => item.id === 'legendary:reference')?.note).toBe(
      LEGENDARY_REFERENCE_DISABLED_NOTE,
    )
    expect(items.find((item) => item.id === 'legendary:spellcasting')?.note).toBe(
      LEGENDARY_SPELLCASTING_DISABLED_NOTE,
    )
    expect(items.find((item) => item.id === 'legendary:cast-spell')?.note).toBe(
      LEGENDARY_CAST_SPELL_DISABLED_NOTE,
    )
    expect(parseMonsterActionAcquisitionId('legendary:reference')).toEqual({
      type: 'legendary',
      category: 'reference',
    })
    expect(parseMonsterActionAcquisitionId('legendary:cast-spell')).toEqual({
      type: 'legendary',
      category: 'cast-spell',
    })
    expect(parseMonsterActionAcquisitionId('create:special')).toEqual({
      type: 'create',
      kind: 'special',
    })
  })

  it('prefills the only target and one empty spell', () => {
    const values = resolveMonsterCreateDefaultValues()
    values.actions = [
      { id: 'rend', kind: 'natural-weapon', name: 'Rend' },
      {
        id: 'spellcasting',
        kind: 'spell',
        name: 'Spellcasting',
        castingAbility: { kind: 'ability', ability: 'cha' },
        spells: [{ spellId: 'srd:command' }],
      },
    ]
    expect(createLegendaryActionDraft('reference', values)).toMatchObject({
      kind: 'action-reference',
      actionIds: ['rend'],
    })
    expect(createLegendaryActionDraft('spellcasting', values)).toMatchObject({
      kind: 'spell',
      spellInvocation: 'use-entry',
      name: 'Use Spellcasting',
      castingAbility: { kind: 'shared', entryId: 'spellcasting' },
      spells: [{ spellId: undefined }],
    })
    const cast = createLegendaryActionDraft('cast-spell', values)
    expect(cast.kind === 'spell' ? cast.name : undefined).toBe('Cast a spell')
    expect(cast.kind === 'spell' ? cast.spells : undefined).toEqual([{ spellId: undefined }])
  })

  it('labels a source spell with the level that Spellcasting action already uses', () => {
    expect(formatSpellCastAtLevelName({ name: 'Fireball', castAtLevel: 5, spellLevel: 3 })).toBe(
      'Fireball (level 5 version)',
    )
    expect(formatSpellCastAtLevelName({ name: 'Fireball', castAtLevel: 3, spellLevel: 3 })).toBe(
      'Fireball',
    )
    const values = resolveMonsterCreateDefaultValues()
    values.actions = [
      {
        id: 'spellcasting',
        kind: 'spell',
        name: 'Spellcasting',
        castingAbility: { kind: 'ability', ability: 'cha' },
        spells: [{ spellId: 'srd:fireball', castAtLevel: 5 }, { spellId: 'srd:mage-hand' }],
      },
    ]
    expect(
      legendarySourceSpellOptions(
        values,
        {
          id: 'presence',
          kind: 'spell',
          spellInvocation: 'use-entry',
          castingAbility: { kind: 'shared', entryId: 'spellcasting' },
          spells: [{ spellId: undefined }],
        },
        new Map([
          ['srd:fireball', { name: 'Fireball', level: 3 }],
          ['srd:mage-hand', { name: 'Mage Hand', level: 0 }],
        ]),
      ),
    ).toEqual([
      { value: 'srd:fireball', label: 'Fireball (level 5 version)' },
      { value: 'srd:mage-hand', label: 'Mage Hand' },
    ])
  })
})

describe('legendary action fields', () => {
  const values = {
    ...resolveMonsterCreateDefaultValues(),
    actions: [
      { id: 'rend', kind: 'natural-weapon', name: 'Rend' },
      { id: 'glare', kind: 'special', name: 'Dreadful Glare', description: '<p>Gaze.</p>' },
      {
        id: 'spellcasting',
        kind: 'spell',
        name: 'Spellcasting',
        castingAbility: { kind: 'ability', ability: 'cha' },
        spells: [{ spellId: 'srd:command' }],
      },
    ],
  } as MonsterFormValues

  it('orders each category and omits limit, lead, and casting sentence', () => {
    const reference = names(
      monsterActionDetailFields({
        ctx,
        action: { id: 'pounce', kind: 'action-reference', name: 'Pounce', actionIds: ['rend'] },
        section: 'legendaryActions',
        namePrefix: 'legendaryActions.0',
        equipmentOptions: [],
        sharedCastingOptions: [],
        referenceOptions: [
          { value: 'rend', label: 'Rend' },
          { value: 'glare', label: 'Dreadful Glare' },
        ],
      }) as { name?: string }[],
    )
    expect(reference).toEqual([
      'buildAdvisories',
      'actionIds',
      'movement.allowance',
      'movement.withoutOpportunityAttacks',
      'onceUntilNextTurn',
    ])

    const spellcasting = names(
      monsterActionDetailFields({
        ctx,
        action: {
          id: 'presence',
          kind: 'spell',
          name: 'Commanding Presence',
          spellInvocation: 'use-entry',
          castingAbility: { kind: 'shared', entryId: 'spellcasting' },
          spells: [{ spellId: undefined }],
        },
        section: 'legendaryActions',
        namePrefix: 'legendaryActions.0',
        equipmentOptions: [],
        sharedCastingOptions: [{ value: 'spellcasting', label: 'Spellcasting' }],
        sourceSpellOptions: [{ value: 'srd:command', label: 'Command' }],
      }) as { name?: string }[],
    )
    expect(spellcasting).toEqual([
      'buildAdvisories',
      'castingAbility',
      'spells.0.spellId',
      'onceUntilNextTurn',
    ])

    const cast = monsterActionDetailFields({
      ctx,
      action: { id: 'beguile', kind: 'spell', name: 'Beguile', spells: [{ spellId: undefined }] },
      section: 'legendaryActions',
      namePrefix: 'legendaryActions.0',
      equipmentOptions: [],
      sharedCastingOptions: [],
    })
    expect(names(cast as { name?: string }[])).toEqual([
      'buildAdvisories',
      'castingAbility',
      'spells.0.spellId',
      'spells.0.castAtLevel',
      'omittedComponents',
      'onceUntilNextTurn',
    ])
    expect(JSON.stringify(cast)).not.toContain('Lead')
    expect(JSON.stringify(cast)).not.toContain('Casting sentence')

    const customFields = monsterActionDetailFields({
      ctx,
      action: { id: 'note', kind: 'special', name: 'Teleport' },
      section: 'legendaryActions',
      namePrefix: 'legendaryActions.0',
      equipmentOptions: [],
      sharedCastingOptions: [],
    })
    const custom = names(customFields as { name?: string }[])
    expect(custom).toContain('description')
    expect(custom).toContain('onceUntilNextTurn')
    expect(JSON.stringify(customFields)).toContain('limitedUse')
    expect(JSON.stringify(customFields)).not.toContain('Casting sentence')
    expect(values.actions).toHaveLength(3)
  })
})
