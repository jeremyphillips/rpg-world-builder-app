import { describe, expect, it } from 'vitest'

import { pickMonster } from '@/test/fixtures/pick'

import type { MonsterFormValues } from '../monster-form-values'

import { buildMonsterDetailViewModel } from '../monster-display'
import {
  resolveTemplateTraitStatBlockRulesFacing,
  resolveTraitStatBlockRulesFacing,
  resolveTraitStatBlockRulesFacingForFormRow,
} from './resolve-trait-stat-block-rules-facing'

describe('resolveTraitStatBlockRulesFacing', () => {
  it('formats legendary resistance with lair-enabled stat-block heading', () => {
    const facing = resolveTemplateTraitStatBlockRulesFacing({
      id: 'legendary-resistance',
      templateId: 'legendary-resistance',
      config: { uses: { normal: 4, inLair: 5 } },
      monster: { name: 'Lich', lair: { enabled: true, experience: { mode: 'suggested' } } },
    })
    expect(facing.heading).toBe('Legendary Resistance (4/Day, or 5/Day in Lair)')
    expect(facing.proseText).toContain('fails a saving throw')
  })

  it('omits in-lair notation when lair enhancements are off', () => {
    const facing = resolveTemplateTraitStatBlockRulesFacing({
      id: 'legendary-resistance',
      templateId: 'legendary-resistance',
      config: { uses: { normal: 4, inLair: 5 } },
      monster: { name: 'Lich' },
    })
    expect(facing.heading).toBe('Legendary Resistance (4/Day)')
  })

  it('matches detail view model rules-facing fields for the lich seed', () => {
    const monster = pickMonster('lich')
    const record = monster.traits.find((trait) => trait.id === 'legendary-resistance')
    expect(record).toBeDefined()
    const detail = buildMonsterDetailViewModel({
      monster,
      creatureTypeLabel: 'Undead',
      equipmentById: new Map(),
      catalogState: 'ready',
    }).traits.find((trait) => trait.id === 'legendary-resistance')
    const facing = resolveTraitStatBlockRulesFacing({
      trait: record!,
      monster,
      record: record as Record<string, unknown>,
    })
    expect(facing).toBeDefined()
    expect(facing!.heading).toBe(detail?.name)
    expect(facing!.descriptionHtml).toBe(detail?.descriptionHtml)
    expect(facing!.proseText).toContain('fails a saving throw')
  })

  it('keeps form preview aligned with detail when lair is toggled', () => {
    const monster = pickMonster('lich')
    const row = {
      kind: 'template',
      id: 'legendary-resistance',
      templateId: 'legendary-resistance',
      config: { uses: { normal: 4, inLair: 5 } },
    }
    const previewOn = resolveTraitStatBlockRulesFacingForFormRow({
      row,
      monster: {
        name: monster.name,
        movement: monster.movement as MonsterFormValues['movement'],
        lair: { enabled: true },
        forms: monster.forms,
      },
    })
    const previewOff = resolveTraitStatBlockRulesFacingForFormRow({
      row,
      monster: {
        name: monster.name,
        movement: monster.movement as MonsterFormValues['movement'],
        lair: { enabled: false },
        forms: monster.forms,
      },
    })
    expect(previewOn?.heading).toBe('Legendary Resistance (4/Day, or 5/Day in Lair)')
    expect(previewOff?.heading).toBe('Legendary Resistance (4/Day)')
  })

  it('matches draft and published spider climb when climb is an alternative', () => {
    const movement = { walk: 20 }
    const movementAlternative = {
      modes: ['climb', 'fly'] as Array<'climb' | 'fly'>,
      feet: 20 as const,
    }
    const row = { id: 'climb', preset: 'spider-climb' as const }
    const draft = resolveTraitStatBlockRulesFacingForFormRow({
      row,
      monster: {
        name: 'Swarm of Insects',
        movement: [{ mode: 'walk', feet: 20 }],
        movementAlternative: { modes: ['climb', 'fly'] as const, feet: 20 as const },
      },
    })
    const published = resolveTraitStatBlockRulesFacing({
      trait: row,
      monster: {
        name: 'Swarm of Insects',
        movement,
        movementAlternative,
      },
      record: row,
    })
    expect(draft?.proseText).toBe(published?.proseText)
    expect(draft?.proseText).toMatch(/^If the swarm of insects has a Climb Speed,/)
  })
})
