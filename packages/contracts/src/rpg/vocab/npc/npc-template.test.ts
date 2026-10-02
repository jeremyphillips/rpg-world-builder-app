import { describe, expect, it } from 'vitest'

import { ABILITY_IDS } from '../ability'
import {
  getNpcTemplateClassPreferenceSlugs,
  getNpcTemplateEntry,
  getNpcTemplateLabel,
  NPC_TEMPLATE_ENTRIES,
  NPC_TEMPLATE_FALLBACK_ID,
  NPC_TEMPLATE_IDS,
  NPC_TEMPLATE_ROLE_CHOICE_LIMITS,
  NPC_TEMPLATE_TERM,
  npcTemplateIdSchema,
  resolveNpcTemplateRoleChoiceCounts,
} from './npc-template'

describe('NPC_TEMPLATE_ENTRIES', () => {
  it('publishes the eight v1 roles in catalog order', () => {
    expect(NPC_TEMPLATE_TERM.label).toBe('NPC Role')
    expect(NPC_TEMPLATE_IDS).toEqual([
      'commoner',
      'guard',
      'scout',
      'merchant',
      'artisan',
      'scholar',
      'priest',
      'criminal',
    ])
    expect(NPC_TEMPLATE_FALLBACK_ID).toBe('commoner')
    expect(npcTemplateIdSchema.safeParse('civilian').success).toBe(false)
  })

  it('keeps card descriptions free of class names and levels', () => {
    const banned =
      /\b(level \d|fighter|wizard|rogue|cleric|paladin|ranger|barbarian|bard|druid|sorcerer|monk|warlock)\b/i
    for (const entry of Object.values(NPC_TEMPLATE_ENTRIES)) {
      expect(entry.description).not.toMatch(banned)
    }
  })

  it('uses a full ability permutation and satisfies the role-choice list invariant', () => {
    for (const [id, entry] of Object.entries(NPC_TEMPLATE_ENTRIES)) {
      expect([...entry.recommendations.abilityPriority].sort()).toEqual([...ABILITY_IDS].sort())
      const counts = resolveNpcTemplateRoleChoiceCounts(entry.levelZero?.roleChoices)
      expect(counts.skillCount).toBeLessThanOrEqual(NPC_TEMPLATE_ROLE_CHOICE_LIMITS.skills)
      expect(counts.toolCount).toBeLessThanOrEqual(NPC_TEMPLATE_ROLE_CHOICE_LIMITS.tools)
      expect(entry.recommendations.skillSlugs.length).toBeGreaterThanOrEqual(counts.skillCount + 2)
      if (counts.toolCount > 0) {
        expect(entry.recommendations.toolSlugs.length).toBeGreaterThan(0)
      } else {
        expect(entry.recommendations.toolSlugs).toEqual([])
      }
      expect(getNpcTemplateEntry(id)?.label).toBe(entry.label)
    }
  })

  it('keeps class preferences off the classless roles and doubles the priest', () => {
    expect(getNpcTemplateClassPreferenceSlugs('commoner')).toEqual([])
    expect(getNpcTemplateClassPreferenceSlugs('merchant')).toEqual([])
    expect(getNpcTemplateClassPreferenceSlugs('priest')).toEqual(['cleric', 'paladin'])
    expect(getNpcTemplateEntry('criminal')?.levelZero?.roleChoices).toEqual({
      skillCount: 2,
      toolCount: 1,
    })
    expect(getNpcTemplateEntry('merchant')?.levelZero?.wealthTier).toBe('comfortable')
    expect(getNpcTemplateLabel('missing')).toBe('missing')
  })

  it('reserves wealthy and gives Commoner the poor unskilled purse', () => {
    const tiers = new Set<string>(
      Object.values(NPC_TEMPLATE_ENTRIES).flatMap((entry) =>
        entry.levelZero ? [entry.levelZero.wealthTier] : [],
      ),
    )
    expect(tiers.has('wealthy')).toBe(false)
    expect(getNpcTemplateEntry('commoner')?.levelZero?.wealthTier).toBe('poor')
  })
})
