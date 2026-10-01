import { describe, expect, it } from 'vitest'

import type { CharacterClass } from '../../../content/classes/class'
import {
  resolveNpcTemplateRecommendations,
  toAutomaticNpcBuildPreferences,
} from './resolve-npc-template-recommendations'

function makeClass(slug: string): CharacterClass {
  return {
    id: `srd-cc-5.2.1:${slug}`,
    slug,
    rulesetId: 'srd-cc-5.2.1',
    source: 'system',
    status: 'published',
    campaignId: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    name: slug,
    primaryAbilities: ['str'],
    hitDie: 8,
    proficiencies: {
      savingThrows: ['str', 'con'],
      armor: { categories: [], items: [] },
      weapons: { categories: [], items: [] },
      skills: { categories: [], items: [] },
    },
    features: [],
  }
}

const playableClasses = ['fighter', 'paladin', 'ranger', 'rogue', 'cleric', 'wizard'].map(makeClass)

describe('resolveNpcTemplateRecommendations', () => {
  it('resolves every v1 template and keeps class preferences off level 0', () => {
    const commoner = resolveNpcTemplateRecommendations({
      level: 0,
      userTemplateId: 'commoner',
      playableClasses,
    })
    expect(commoner.npcTemplateId).toBe('commoner')
    expect(commoner.classApplicable).toBe(false)
    expect(commoner.classes).toEqual([])
    expect(commoner.skills.map((entry) => entry.id).slice(0, 1)).toEqual(['animal-handling'])

    const priest = resolveNpcTemplateRecommendations({
      level: 0,
      userTemplateId: 'priest',
      playableClasses,
    })
    expect(priest.classes).toEqual([])
    expect(priest.skills.map((entry) => entry.id)).toEqual([
      'religion',
      'insight',
      'medicine',
      'persuasion',
    ])
  })

  it('applies class preferences only at level 1 and up, and does not auto-seed two priest classes', () => {
    const priest = resolveNpcTemplateRecommendations({
      level: 1,
      userTemplateId: 'priest',
      playableClasses,
    })
    expect(priest.classes.map((entry) => entry.id)).toEqual([
      'srd-cc-5.2.1:cleric',
      'srd-cc-5.2.1:paladin',
    ])
    expect(priest.classes.every((entry) => entry.sources.includes('template'))).toBe(true)

    const guard = resolveNpcTemplateRecommendations({
      level: 3,
      userTemplateId: 'guard',
      playableClasses,
    })
    expect(guard.classes).toEqual([{ id: 'srd-cc-5.2.1:fighter', sources: ['template'] }])
  })

  it('uses Commoner only as a resolver fallback and never as the selected template', () => {
    const fallback = resolveNpcTemplateRecommendations({ level: 2, playableClasses })
    expect(fallback.usedCommonerFallback).toBe(true)
    expect(fallback.npcTemplateId).toBeUndefined()
    expect(fallback.abilityPriority[0]).toBe('con')
    expect(fallback.classes).toEqual([])
  })

  it('lets a title class override replace template classes and prepends skill and tool preferences', () => {
    const narrowed = resolveNpcTemplateRecommendations({
      level: 5,
      title: {
        templateId: 'artisan',
        classPreferenceOverrideSlugs: ['wizard'],
        skillPreferenceSlugs: ['athletics'],
        toolPreferenceSlugs: ['smiths-tools'],
      },
      playableClasses,
    })
    expect(narrowed.npcTemplateId).toBe('artisan')
    expect(narrowed.classes).toEqual([{ id: 'srd-cc-5.2.1:wizard', sources: ['title'] }])
    expect(narrowed.skills[0]).toEqual({ id: 'athletics', sources: ['title'] })
    expect(narrowed.tools[0]).toEqual({ id: 'smiths-tools', sources: ['title', 'template'] })
    expect(narrowed.tools.map((entry) => entry.id)).toContain('carpenters-tools')
  })

  it('does not invent a tool recommendation slot when the title prefers a tool the role does not use', () => {
    const guard = resolveNpcTemplateRecommendations({
      level: 2,
      userTemplateId: 'guard',
      title: { toolPreferenceSlugs: ['smiths-tools'] },
      playableClasses,
    })
    expect(guard.tools.map((entry) => entry.id)).toEqual(['smiths-tools'])
    expect(guard.npcTemplateId).toBe('guard')
  })

  it('orders languages species first, then template, without adding slots in the preference list beyond those sources', () => {
    const merchant = resolveNpcTemplateRecommendations({
      level: 0,
      userTemplateId: 'merchant',
      speciesLanguageAffinityIds: ['elvish', 'common'],
      playableClasses,
    })
    expect(merchant.languages.map((entry) => entry.id)).toEqual([
      'elvish',
      'common',
      'dwarvish',
      'halfling',
      'gnomish',
    ])
    expect(merchant.languages[0]?.sources).toEqual(['species', 'template'])
  })

  it('lets an explicit user template and class win over title and organization', () => {
    const chosen = resolveNpcTemplateRecommendations({
      level: 4,
      userTemplateId: 'criminal',
      userClassIds: ['srd-cc-5.2.1:fighter'],
      title: { templateId: 'priest' },
      organizationTemplateId: 'guard',
      organizationClassAffinityIds: ['srd-cc-5.2.1:rogue'],
      playableClasses,
    })
    expect(chosen.npcTemplateId).toBe('criminal')
    expect(chosen.classes).toEqual([{ id: 'srd-cc-5.2.1:fighter', sources: ['user'] }])
  })

  it('keeps sourced preferences in recommendation order', () => {
    const recommendations = resolveNpcTemplateRecommendations({
      level: 1,
      userTemplateId: 'scout',
      playableClasses,
    })
    const preferences = toAutomaticNpcBuildPreferences(recommendations)
    expect(preferences.skills?.[0]).toMatchObject({ id: 'perception', sources: ['template'] })
    expect(preferences.abilityPriority?.[0]).toBe('dex')
  })

  it('merges user then role weapon and armor preferences into an equipment stream', () => {
    const recommendations = resolveNpcTemplateRecommendations({
      level: 1,
      userTemplateId: 'guard',
      userWeaponSlugs: ['longbow'],
      playableClasses,
    })
    expect(recommendations.weapons[0]).toEqual({ id: 'longbow', sources: ['user'] })
    expect(recommendations.weapons.map((entry) => entry.id)).toContain('spear')
    expect(recommendations.armor.map((entry) => entry.id)).toContain('leather-armor')
    const preferences = toAutomaticNpcBuildPreferences(recommendations)
    expect(preferences.equipmentPreferences?.[0]).toMatchObject({
      kind: 'weapon',
      slug: 'longbow',
      source: 'user',
    })
    expect(preferences.equipmentPreferences?.some((entry) => entry.slug === 'spear')).toBe(true)
  })
})
