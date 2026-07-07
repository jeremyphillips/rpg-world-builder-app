import { describe, expect, it } from 'vitest'

import { expectRichTextHtml } from '../lib/expect-rich-text-html'
import {
  getClassBySlug,
  getSubclassBySlug,
  loadSeedClasses,
  loadSeedSubclasses,
  seedClassSlugs,
} from './index'
import {
  normalizeGrantGroups,
  subclassChoiceFeatureId,
  skillSlugsFromClassChoices,
  type CharacterClass,
} from '@rpg/contracts'

const RULESET = 'srd-cc-5.2.1'

function asiLevelsFromFeatures(cls: CharacterClass): number[] {
  return cls.features
    .filter((feature) => /^ability-score-improvement-\d+$/.test(feature.id))
    .map((feature) => feature.level)
    .sort((a, b) => a - b)
}

function isSubclassChoiceFeature(cls: CharacterClass, feature: CharacterClass['features'][number]) {
  return feature.id === subclassChoiceFeatureId(cls.slug)
}

function expectSubclassChoiceKind(cls: CharacterClass): void {
  const feature = cls.features.find((f) => isSubclassChoiceFeature(cls, f))
  expect(feature?.kind).toBe('subclass-choice')
}

function expectClassFeatureDescriptions(cls: CharacterClass): void {
  for (const feature of cls.features) {
    if (isSubclassChoiceFeature(cls, feature)) {
      expect(feature.description).toBe('')
    } else {
      expect(feature.description && feature.description.length > 0).toBe(true)
    }
  }
}

describe('SRD 5.2.1 class seed', () => {
  const classes = loadSeedClasses(RULESET)
  const subclasses = loadSeedSubclasses(RULESET)

  it('ships all 12 classes and their subclasses (validated against the schema at load)', () => {
    expect(classes).toHaveLength(12)
    expect(subclasses).toHaveLength(12)
    for (const cls of classes) {
      expectSubclassChoiceKind(cls)
    }
  })

  it('uses deterministic system ids and null campaignId', () => {
    for (const cls of classes) {
      expect(cls.id).toBe(`${RULESET}:${cls.slug}`)
      expect(cls.source).toBe('system')
      expect(cls.campaignId).toBeNull()
      expect(cls.rulesetId).toBe(RULESET)
    }
  })

  it('has unique class slugs', () => {
    const slugs = classes.map((c) => c.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
    expect(seedClassSlugs(RULESET).size).toBe(12)
  })

  it('references existing parent class ids from every subclass', () => {
    const classIds = new Set(classes.map((c) => c.id))
    for (const sub of subclasses) {
      expect(classIds.has(sub.classId)).toBe(true)
    }
  })

  it('stores non-empty descriptions as rich-text HTML', () => {
    for (const cls of classes) {
      expectRichTextHtml(cls.description)
      for (const feature of cls.features) {
        if (isSubclassChoiceFeature(cls, feature)) {
          expect(feature.description).toBe('')
          continue
        }
        expectRichTextHtml(feature.description)
      }
    }
    for (const sub of subclasses) {
      expectRichTextHtml(sub.description)
      for (const feature of sub.features) {
        expectRichTextHtml(feature.description)
      }
    }
  })

  it('Bard ships full feature prose, prepared spells, and Bardic Die resource', () => {
    const bard = getClassBySlug(RULESET, 'bard')
    expect(bard.features).toHaveLength(14)
    expectClassFeatureDescriptions(bard)
    expect(bard.spellcasting?.description).toContain('cast spells through your bardic arts')
    expect(asiLevelsFromFeatures(bard)).toEqual([4, 8, 12, 16])
    expect(bard.spellcasting?.spellsAvailable?.find((e) => e.level === 1)?.count).toBe(4)
    expect(bard.spellcasting?.spellsAvailable?.find((e) => e.level === 20)?.count).toBe(22)
    const bardicDie = bard.resources?.find((r) => r.name === 'Bardic Die')
    expect(bardicDie?.entries).toEqual([
      { level: 1, value: 6 },
      { level: 5, value: 8 },
      { level: 10, value: 10 },
      { level: 15, value: 12 },
    ])
    const words = bard.features.find((f) => f.id === 'words-of-creation')
    const spellGrant = words?.grantGroups?.[0]?.grants?.find((g) => g.kind === 'spells')
    expect(spellGrant).toMatchObject({
      kind: 'spells',
      mode: 'always_prepared',
      spellIds: ['power-word-heal', 'power-word-kill'],
    })
  })

  it('College of Lore ships four subclass features with rich-text HTML', () => {
    const lore = getSubclassBySlug(RULESET, 'college-of-lore')
    expect(lore.features).toHaveLength(4)
    expect(lore.features.map((f) => f.id)).toEqual([
      'bonus-proficiencies',
      'cutting-words',
      'magical-discoveries',
      'peerless-skill',
    ])
    expect(lore.description).toContain('libraries and universities')
  })

  it('Ranger ships spellcasting prose, prepared spells, and Favored Enemy resource', () => {
    const ranger = getClassBySlug(RULESET, 'ranger')
    expect(ranger.features).toHaveLength(19)
    expectClassFeatureDescriptions(ranger)
    expect(asiLevelsFromFeatures(ranger)).toEqual([4, 8, 12, 16])
    expect(ranger.spellcasting?.description).toContain('channel the magical essence of nature')
    expect(ranger.spellcasting?.spellsAvailable?.find((e) => e.level === 1)?.count).toBe(2)
    expect(ranger.spellcasting?.spellsAvailable?.find((e) => e.level === 19)?.count).toBe(15)
    const favoredEnemy = ranger.features.find((f) => f.id === 'favored-enemy')
    const spellGrant = favoredEnemy?.grantGroups?.[0]?.grants?.find((g) => g.kind === 'spells')
    expect(spellGrant).toMatchObject({
      kind: 'spells',
      mode: 'always_prepared',
      spellIds: ['hunters-mark'],
    })
    expect(ranger.resources?.find((r) => r.name === 'Favored Enemy')?.entries).toEqual([
      { level: 1, value: 2 },
      { level: 5, value: 3 },
      { level: 9, value: 4 },
      { level: 13, value: 5 },
      { level: 17, value: 6 },
    ])
  })

  it('Hunter ships five subclass features with rich-text HTML', () => {
    const hunter = getSubclassBySlug(RULESET, 'hunter')
    expect(hunter.tagline).toBe('Protect Nature and People from Destruction')
    expect(hunter.features).toHaveLength(5)
    expect(hunter.features.map((f) => f.id)).toEqual([
      'hunters-lore',
      'hunters-prey',
      'defensive-tactics',
      'superior-hunters-prey',
      'superior-hunters-defense',
    ])
    expect(hunter.description).toContain('protect nature and people')
  })

  it('Rogue ships full feature prose and a subclass choice entry', () => {
    const rogue = getClassBySlug(RULESET, 'rogue')
    expect(rogue.features).toHaveLength(22)
    expectClassFeatureDescriptions(rogue)
    expect(asiLevelsFromFeatures(rogue)).toEqual([4, 8, 10, 12, 16])
    expect(rogue.features.map((f) => f.id)).toContain('rogue-subclass')
    expect(rogue.proficiencies.tools).toEqual({
      categories: [],
      items: ['thieves-tools'],
    })
    const cunningStrike = rogue.features.find((f) => f.id === 'cunning-strike')
    expect(cunningStrike?.description).toContain('<strong>Poison (Cost: 1d6).</strong>')
    const expertise = rogue.features.find((f) => f.id === 'expertise')
    expect(expertise?.description).toContain('At Rogue level 6')
  })

  it('Thief ships five subclass features with rich-text HTML', () => {
    const thief = getSubclassBySlug(RULESET, 'thief')
    expect(thief.tagline).toBe('Hunt for Treasure as a Classic Adventurer')
    expect(thief.features).toHaveLength(5)
    expect(thief.features.map((f) => f.id)).toEqual([
      'fast-hands',
      'second-story-work',
      'supreme-sneak',
      'use-magic-device',
      'thiefs-reflexes',
    ])
    expect(thief.description).toContain('burglar, treasure hunter, and explorer')
    const useMagicDevice = thief.features.find((f) => f.id === 'use-magic-device')
    expect(useMagicDevice?.description).toContain('<em>Spell Scroll</em>')
  })

  it('Barbarian ships full feature prose, resource columns, and no ASI entry', () => {
    const barbarian = getClassBySlug(RULESET, 'barbarian')
    expect(barbarian.features).toHaveLength(23)
    expectClassFeatureDescriptions(barbarian)
    expect(asiLevelsFromFeatures(barbarian)).toEqual([4, 8, 12, 16])
    const rage = barbarian.features.find((f) => f.id === 'rage')
    expect(rage?.description).toContain('<strong>Damage Resistance.</strong>')
    expect(rage?.description).toContain('<strong>Duration.</strong>')
    const brutalStrike = barbarian.features.find((f) => f.id === 'brutal-strike')
    expect(brutalStrike?.description).toContain('<strong>Forceful Blow.</strong>')
    expect(barbarian.resources?.find((r) => r.name === 'Rages')?.entries).toEqual([
      { level: 1, value: 2 },
      { level: 3, value: 3 },
      { level: 6, value: 4 },
      { level: 12, value: 5 },
      { level: 17, value: 6 },
    ])
    expect(barbarian.resources?.find((r) => r.name === 'Rage Damage')?.entries).toEqual([
      { level: 1, value: 2 },
      { level: 9, value: 3 },
      { level: 16, value: 4 },
    ])
    expect(barbarian.resources?.find((r) => r.name === 'Weapon Mastery')?.entries).toEqual([
      { level: 1, value: 2 },
      { level: 4, value: 3 },
      { level: 10, value: 4 },
    ])
  })

  it('Path of the Berserker ships four subclass features with rich-text HTML', () => {
    const berserker = getSubclassBySlug(RULESET, 'path-of-the-berserker')
    expect(berserker.tagline).toBe('Channel Rage into Violent Fury')
    expect(berserker.features).toHaveLength(4)
    expect(berserker.features.map((f) => f.id)).toEqual([
      'frenzy',
      'mindless-rage',
      'retaliation',
      'intimidating-presence',
    ])
    expect(berserker.description).toContain('direct their Rage primarily toward violence')
  })

  it('Cleric ships spellcasting prose, prepared spells, Channel Divinity resource, and features', () => {
    const cleric = getClassBySlug(RULESET, 'cleric')
    expect(cleric.features).toHaveLength(13)
    expectClassFeatureDescriptions(cleric)
    expect(asiLevelsFromFeatures(cleric)).toEqual([4, 8, 12, 16])
    expect(cleric.spellcasting?.description).toContain('cast spells through prayer and meditation')
    expect(cleric.spellcasting?.spellsAvailable?.find((e) => e.level === 1)?.count).toBe(4)
    expect(cleric.spellcasting?.spellsAvailable?.find((e) => e.level === 20)?.count).toBe(22)
    const channelDivinity = cleric.features.find((f) => f.id === 'channel-divinity')
    expect(channelDivinity?.description).toContain('<strong>Divine Spark.</strong>')
    expect(channelDivinity?.description).toContain('<strong>Turn Undead.</strong>')
    expect(cleric.resources?.find((r) => r.name === 'Channel Divinity')?.entries).toEqual([
      { level: 2, value: 2 },
      { level: 6, value: 3 },
      { level: 18, value: 4 },
    ])
    const greaterIntervention = cleric.features.find((f) => f.id === 'greater-divine-intervention')
    expect(greaterIntervention?.description).toContain('<em>Wish</em>')
  })

  it('Life Domain ships five subclass features with domain spell grants', () => {
    const life = getSubclassBySlug(RULESET, 'life-domain')
    expect(life.tagline).toBe('Preserve and Heal Those in Need')
    expect(life.features).toHaveLength(5)
    expect(life.features.map((f) => f.id)).toEqual([
      'disciple-of-life',
      'life-domain-spells',
      'preserve-life',
      'blessed-healer',
      'supreme-healing',
    ])
    expect(life.description).toContain('positive energy that helps sustain all life')
    const domainSpells = life.features.find((f) => f.id === 'life-domain-spells')
    // level-3 entry → default group (= feature level); 5/7/9 → level-gated groups
    expect(domainSpells?.grantGroups).toHaveLength(4)
    expect(domainSpells?.grantGroups?.[0]?.grants[0]).toMatchObject({
      kind: 'spells',
      mode: 'always_prepared',
      spellIds: ['aid', 'bless', 'cure-wounds', 'lesser-restoration'],
    })
    expect(domainSpells?.grantGroups?.[1]).toMatchObject({
      unlock: { level: 5 },
      grants: [
        { kind: 'spells', mode: 'always_prepared', spellIds: ['mass-healing-word', 'revivify'] },
      ],
    })
    expect(domainSpells?.grantGroups?.[3]?.unlock).toEqual({ level: 9 })
  })

  it('Druid ships spellcasting prose, prepared spells, Wild Shape resource, and features', () => {
    const druid = getClassBySlug(RULESET, 'druid')
    expect(druid.features).toHaveLength(15)
    expectClassFeatureDescriptions(druid)
    expect(asiLevelsFromFeatures(druid)).toEqual([4, 8, 12, 16])
    expect(druid.spellcasting?.description).toContain('studying the mystical forces of nature')
    expect(druid.spellcasting?.spellsAvailable?.find((e) => e.level === 1)?.count).toBe(4)
    expect(druid.spellcasting?.spellsAvailable?.find((e) => e.level === 20)?.count).toBe(22)
    const druidic = druid.features.find((f) => f.id === 'druidic')
    const druidicGrants = druidic?.grantGroups?.[0]?.grants ?? []
    const druidicSpell = druidicGrants.find((g) => g.kind === 'spells')
    expect(druidicSpell).toMatchObject({
      kind: 'spells',
      mode: 'always_prepared',
      spellIds: ['speak-with-animals'],
    })
    const druidicLanguage = druidicGrants.find((g) => g.kind === 'languages')
    expect(druidicLanguage).toEqual({ kind: 'languages', languageIds: ['druidic'] })
    const wildShape = druid.features.find((f) => f.id === 'wild-shape')
    expect(wildShape?.description).toContain('<strong>Beast Shapes.</strong>')
    expect(wildShape?.description).toContain('<strong>Game Statistics.</strong>')
    expect(druid.resources?.find((r) => r.name === 'Wild Shape')?.entries).toEqual([
      { level: 2, value: 2 },
      { level: 6, value: 3 },
      { level: 17, value: 4 },
    ])
  })

  it('Circle of the Land ships five subclass features with land spell tables', () => {
    const land = getSubclassBySlug(RULESET, 'circle-of-the-land')
    expect(land.tagline).toBe('Celebrate Connection to the Natural World')
    expect(land.features).toHaveLength(5)
    expect(land.features.map((f) => f.id)).toEqual([
      'circle-of-the-land-spells',
      'lands-aid',
      'natural-recovery',
      'natures-ward',
      'natures-sanctuary',
    ])
    expect(land.description).toContain('safeguard ancient knowledge and rites')
    const circleSpells = land.features.find((f) => f.id === 'circle-of-the-land-spells')
    expect(circleSpells?.description).toContain('<strong>Arid Land.</strong>')
    expect(circleSpells?.description).toContain('<em>Fireball</em>')
    const naturesWard = land.features.find((f) => f.id === 'natures-ward')
    expect(naturesWard?.description).toContain('Temperate: Lightning')
  })

  it('Fighter ships full feature prose, resource columns, and no ASI entry', () => {
    const fighter = getClassBySlug(RULESET, 'fighter')
    expect(fighter.features).toHaveLength(20)
    expectClassFeatureDescriptions(fighter)
    expect(asiLevelsFromFeatures(fighter)).toEqual([4, 6, 8, 12, 14, 16])
    expect(fighter.features.map((f) => f.id)).toEqual([
      'fighting-style',
      'second-wind',
      'weapon-mastery',
      'action-surge',
      'tactical-mind',
      'fighter-subclass',
      'ability-score-improvement-4',
      'extra-attack',
      'tactical-shift',
      'ability-score-improvement-6',
      'ability-score-improvement-8',
      'indomitable',
      'tactical-master',
      'two-extra-attacks',
      'ability-score-improvement-12',
      'studied-attacks',
      'ability-score-improvement-14',
      'ability-score-improvement-16',
      'epic-boon',
      'three-extra-attacks',
    ])
    expect(fighter.resources?.find((r) => r.name === 'Second Wind')?.entries).toEqual([
      { level: 1, value: 2 },
      { level: 4, value: 3 },
      { level: 10, value: 4 },
    ])
    expect(fighter.resources?.find((r) => r.name === 'Weapon Mastery')?.entries).toEqual([
      { level: 1, value: 3 },
      { level: 4, value: 4 },
      { level: 10, value: 5 },
      { level: 16, value: 6 },
    ])
    expect(fighter.resources?.find((r) => r.name === 'Indomitable')?.entries).toEqual([
      { level: 9, value: 1 },
      { level: 13, value: 2 },
      { level: 17, value: 3 },
    ])
    const fightingStyle = fighter.features.find((f) => f.id === 'fighting-style')
    const fightingStyleGrant = fightingStyle?.grantGroups?.[0]?.grants?.find(
      (g) => g.kind === 'featChoice',
    )
    expect(fightingStyleGrant).toMatchObject({
      kind: 'featChoice',
      category: 'fighting-style',
      choose: 1,
      replaceable: true,
      recommendedFeatIds: ['defense'],
    })
    const epicBoon = fighter.features.find((f) => f.id === 'epic-boon')
    const epicGrant = epicBoon?.grantGroups?.[0]?.grants?.find((g) => g.kind === 'featChoice')
    expect(epicGrant).toMatchObject({
      kind: 'featChoice',
      category: 'epic-boon',
      choose: 1,
      allowAnyQualifying: true,
      recommendedFeatIds: ['boon-of-combat-prowess'],
    })
  })

  it('Champion ships six subclass features with rich-text HTML', () => {
    const champion = getSubclassBySlug(RULESET, 'champion')
    expect(champion.tagline).toBe('Pursue Physical Excellence in Combat')
    expect(champion.features).toHaveLength(6)
    expect(champion.features.map((f) => f.id)).toEqual([
      'improved-critical',
      'remarkable-athlete',
      'additional-fighting-style',
      'heroic-warrior',
      'superior-critical',
      'survivor',
    ])
    expect(champion.description).toContain('relentless pursuit of victory')
    const survivor = champion.features.find((f) => f.id === 'survivor')
    expect(survivor?.description).toContain('<strong>Defy Death.</strong>')
    expect(survivor?.description).toContain('<strong>Heroic Rally.</strong>')
    const additionalFightingStyle = champion.features.find(
      (f) => f.id === 'additional-fighting-style',
    )
    const champFightingStyleGrant = additionalFightingStyle?.grantGroups?.[0]?.grants?.find(
      (g) => g.kind === 'featChoice',
    )
    expect(champFightingStyleGrant).toMatchObject({
      kind: 'featChoice',
      category: 'fighting-style',
      choose: 1,
    })
  })

  it('Monk ships feature prose and Martial Arts, Focus Points, and Unarmored Movement resources', () => {
    const monk = getClassBySlug(RULESET, 'monk')
    expect(monk.features).toHaveLength(25)
    expectClassFeatureDescriptions(monk)
    expect(asiLevelsFromFeatures(monk)).toEqual([4, 8, 12, 16])
    const martialArts = monk.features.find((f) => f.id === 'martial-arts')
    expect(martialArts?.description).toContain('<strong>Martial Arts Die.</strong>')
    const monksFocus = monk.features.find((f) => f.id === 'monks-focus')
    expect(monksFocus?.description).toContain('<strong>Flurry of Blows.</strong>')
    expect(monk.resources?.find((r) => r.name === 'Martial Arts')?.entries).toEqual([
      { level: 1, value: 6 },
      { level: 5, value: 8 },
      { level: 11, value: 10 },
      { level: 17, value: 12 },
    ])
    expect(monk.resources?.find((r) => r.name === 'Focus Points')?.entries).toHaveLength(19)
    expect(monk.resources?.find((r) => r.name === 'Focus Points')?.entries.at(-1)).toEqual({
      level: 20,
      value: 20,
    })
    expect(monk.resources?.find((r) => r.name === 'Unarmored Movement')?.entries).toEqual([
      { level: 2, value: 10 },
      { level: 6, value: 15 },
      { level: 10, value: 20 },
      { level: 14, value: 25 },
      { level: 18, value: 30 },
    ])
  })

  it('Warrior of the Open Hand ships four subclass features with rich-text HTML', () => {
    const openHand = getSubclassBySlug(RULESET, 'warrior-of-the-open-hand')
    expect(openHand.tagline).toBe('Master Unarmed Combat Techniques')
    expect(openHand.features).toHaveLength(4)
    expect(openHand.features.map((f) => f.id)).toEqual([
      'open-hand-technique',
      'wholeness-of-body',
      'fleet-step',
      'quivering-palm',
    ])
    expect(openHand.description).toContain('masters of unarmed combat')
    const technique = openHand.features.find((f) => f.id === 'open-hand-technique')
    expect(technique?.description).toContain('<strong>Addle.</strong>')
    expect(technique?.description).toContain('<strong>Topple.</strong>')
  })

  it('Paladin ships spellcasting prose, prepared spells, Channel Divinity resource, and features', () => {
    const paladin = getClassBySlug(RULESET, 'paladin')
    expect(paladin.features).toHaveLength(19)
    expectClassFeatureDescriptions(paladin)
    expect(asiLevelsFromFeatures(paladin)).toEqual([4, 8, 12, 16])
    expect(paladin.spellcasting?.description).toContain('cast spells through prayer and meditation')
    expect(paladin.spellcasting?.spellsAvailable?.find((e) => e.level === 1)?.count).toBe(2)
    expect(paladin.spellcasting?.spellsAvailable?.find((e) => e.level === 19)?.count).toBe(15)
    const channelDivinity = paladin.features.find((f) => f.id === 'channel-divinity')
    expect(channelDivinity?.description).toContain('<strong>Divine Sense.</strong>')
    const paladinsSmite = paladin.features.find((f) => f.id === 'paladins-smite')
    const smiteSpell = paladinsSmite?.grantGroups?.[0]?.grants?.find((g) => g.kind === 'spells')
    expect(smiteSpell).toMatchObject({
      kind: 'spells',
      mode: 'always_prepared',
      spellIds: ['divine-smite'],
    })
    expect(paladin.resources?.find((r) => r.name === 'Channel Divinity')?.entries).toEqual([
      { level: 3, value: 2 },
      { level: 11, value: 3 },
    ])
  })

  it('Oath of Devotion ships five subclass features with oath spell grants', () => {
    const devotion = getSubclassBySlug(RULESET, 'oath-of-devotion')
    expect(devotion.tagline).toBe('Uphold the Ideals of Justice and Order')
    expect(devotion.features).toHaveLength(5)
    expect(devotion.features.map((f) => f.id)).toEqual([
      'oath-of-devotion-spells',
      'sacred-weapon',
      'aura-of-devotion',
      'smite-of-protection',
      'holy-nimbus',
    ])
    expect(devotion.description).toContain('knight in shining armor')
    const oathSpells = devotion.features.find((f) => f.id === 'oath-of-devotion-spells')
    // level-3 entry → default group; 5/9/13/17 → level-gated groups
    expect(oathSpells?.grantGroups).toHaveLength(5)
    expect(oathSpells?.grantGroups?.[0]?.grants[0]).toMatchObject({
      kind: 'spells',
      mode: 'always_prepared',
      spellIds: ['protection-from-evil-and-good', 'shield-of-faith'],
    })
    expect(oathSpells?.grantGroups?.[4]).toMatchObject({
      unlock: { level: 17 },
      grants: [{ kind: 'spells', mode: 'always_prepared', spellIds: ['commune', 'flame-strike'] }],
    })
    const holyNimbus = devotion.features.find((f) => f.id === 'holy-nimbus')
    expect(holyNimbus?.description).toContain('<strong>Holy Ward.</strong>')
    expect(holyNimbus?.description).toContain('<strong>Sunlight.</strong>')
  })

  it('Sorcerer ships spellcasting prose, prepared spells, Sorcery Points resource, and features', () => {
    const sorcerer = getClassBySlug(RULESET, 'sorcerer')
    expect(sorcerer.features).toHaveLength(12)
    expectClassFeatureDescriptions(sorcerer)
    expect(asiLevelsFromFeatures(sorcerer)).toEqual([4, 8, 12, 16])
    expect(sorcerer.features.map((f) => f.id)).toContain('sorcerer-subclass')
    expect(sorcerer.spellcasting?.description).toContain('Drawing from your innate magic')
    expect(sorcerer.spellcasting?.spellsAvailable?.find((e) => e.level === 1)?.count).toBe(2)
    expect(sorcerer.spellcasting?.spellsAvailable?.find((e) => e.level === 20)?.count).toBe(22)
    const fontOfMagic = sorcerer.features.find((f) => f.id === 'font-of-magic')
    expect(fontOfMagic?.description).toContain('<strong>Creating Spell Slots.</strong>')
    expect(fontOfMagic?.description).toContain('Min. Sorcerer Level 9')
    const innateSorcery = sorcerer.features.find((f) => f.id === 'innate-sorcery')
    expect(innateSorcery?.description).toContain(
      'spell save DC of your Sorcerer spells increases by 1',
    )
    expect(sorcerer.resources?.find((r) => r.name === 'Sorcery Points')?.entries).toEqual([
      { level: 2, value: 2 },
      { level: 3, value: 3 },
      { level: 4, value: 4 },
      { level: 5, value: 5 },
      { level: 6, value: 6 },
      { level: 7, value: 7 },
      { level: 8, value: 8 },
      { level: 9, value: 9 },
      { level: 10, value: 10 },
      { level: 11, value: 11 },
      { level: 12, value: 12 },
      { level: 13, value: 13 },
      { level: 14, value: 14 },
      { level: 15, value: 15 },
      { level: 16, value: 16 },
      { level: 17, value: 17 },
      { level: 18, value: 18 },
      { level: 19, value: 19 },
      { level: 20, value: 20 },
    ])
  })

  it('Draconic Sorcery ships five subclass features with draconic spell grants', () => {
    const draconic = getSubclassBySlug(RULESET, 'draconic-sorcery')
    expect(draconic.tagline).toBe('Breathe the Magic of Dragons')
    expect(draconic.features).toHaveLength(5)
    expect(draconic.features.map((f) => f.id)).toEqual([
      'draconic-resilience',
      'draconic-spells',
      'elemental-affinity',
      'dragon-wings',
      'dragon-companion',
    ])
    expect(draconic.description).toContain('gift of a dragon')
    const draconicSpells = draconic.features.find((f) => f.id === 'draconic-spells')
    expect(draconicSpells?.description).toContain('<strong>Draconic Spells.</strong>')
    // level-3 entry → default group; 5/7/9 → level-gated groups
    expect(draconicSpells?.grantGroups).toHaveLength(4)
    expect(draconicSpells?.grantGroups?.[0]?.grants[0]).toMatchObject({
      kind: 'spells',
      mode: 'always_prepared',
      spellIds: ['alter-self', 'chromatic-orb', 'command', 'dragons-breath'],
    })
    expect(draconicSpells?.grantGroups?.[3]?.unlock).toEqual({ level: 9 })
    const dragonCompanion = draconic.features.find((f) => f.id === 'dragon-companion')
    expect(dragonCompanion?.description).toContain('<em>Summon Dragon</em>')
    const dragonSpell = dragonCompanion?.grantGroups?.[0]?.grants?.find((g) => g.kind === 'spells')
    expect(dragonSpell).toMatchObject({
      kind: 'spells',
      mode: 'free_cast',
      frequency: 'once_per_long_rest',
      spellIds: ['summon-dragon'],
    })
  })

  it('Warlock ships Pact Magic prose, prepared spells, Eldritch Invocations resource, and features', () => {
    const warlock = getClassBySlug(RULESET, 'warlock')
    expect(warlock.features).toHaveLength(11)
    expectClassFeatureDescriptions(warlock)
    expect(asiLevelsFromFeatures(warlock)).toEqual([4, 8, 12, 16])
    expect(warlock.features.map((f) => f.id)).toContain('warlock-subclass')
    expect(warlock.spellcasting?.preparation).toBe('prepared')
    expect(warlock.spellcasting?.description).toContain('formed a pact with a mysterious entity')
    expect(warlock.spellcasting?.spellsAvailable?.find((e) => e.level === 1)?.count).toBe(2)
    expect(warlock.spellcasting?.spellsAvailable?.find((e) => e.level === 19)?.count).toBe(15)
    const invocations = warlock.features.find((f) => f.id === 'eldritch-invocations')
    expect(invocations?.description).toContain('<strong>Prerequisites.</strong>')
    expect(invocations?.description).toContain(
      '<strong>Replacing and Gaining Invocations.</strong>',
    )
    const contactPatron = warlock.features.find((f) => f.id === 'contact-patron')
    // both entries at level 9 (= feature level) → default group, two spell grants
    const contactGrants = contactPatron?.grantGroups?.[0]?.grants ?? []
    expect(contactGrants).toHaveLength(2)
    expect(contactGrants[0]).toMatchObject({
      kind: 'spells',
      mode: 'always_prepared',
      spellIds: ['contact-other-plane'],
    })
    expect(contactGrants[1]).toMatchObject({
      kind: 'spells',
      mode: 'free_cast',
      frequency: 'once_per_long_rest',
      spellIds: ['contact-other-plane'],
    })
    expect(warlock.resources?.find((r) => r.name === 'Eldritch Invocations')?.entries).toEqual([
      { level: 1, value: 1 },
      { level: 2, value: 3 },
      { level: 5, value: 5 },
      { level: 7, value: 6 },
      { level: 9, value: 7 },
      { level: 12, value: 8 },
      { level: 15, value: 9 },
      { level: 18, value: 10 },
    ])
  })

  it('Fiend Patron ships five subclass features with fiend spell grants', () => {
    const fiend = getSubclassBySlug(RULESET, 'fiend-patron')
    expect(fiend.tagline).toBe('Make a Deal with the Lower Planes')
    expect(fiend.features).toHaveLength(5)
    expect(fiend.features.map((f) => f.id)).toEqual([
      'dark-ones-blessing',
      'fiend-spells',
      'dark-ones-own-luck',
      'fiendish-resilience',
      'hurl-through-hell',
    ])
    expect(fiend.description).toContain('realms of perdition')
    const fiendSpells = fiend.features.find((f) => f.id === 'fiend-spells')
    expect(fiendSpells?.description).toContain('<strong>Fiend Spells.</strong>')
    // level-3 entry → default group; 5/7/9 → level-gated groups
    expect(fiendSpells?.grantGroups).toHaveLength(4)
    expect(fiendSpells?.grantGroups?.[0]?.grants[0]).toMatchObject({
      kind: 'spells',
      mode: 'always_prepared',
      spellIds: ['burning-hands', 'command', 'scorching-ray', 'suggestion'],
    })
    expect(fiendSpells?.grantGroups?.[3]?.unlock).toEqual({ level: 9 })
    const hurlThroughHell = fiend.features.find((f) => f.id === 'hurl-through-hell')
    expect(hurlThroughHell?.description).toContain('8d10 Psychic damage')
  })

  it('School of Evocation ships five subclass features with rich-text HTML', () => {
    const evoker = getSubclassBySlug(RULESET, 'school-of-evocation')
    expect(evoker.tagline).toBe('Create Explosive Elemental Effects')
    expect(evoker.features).toHaveLength(5)
    expect(evoker.features.map((f) => f.id)).toEqual([
      'evocation-savant',
      'potent-cantrip',
      'sculpt-spells',
      'empowered-evocation',
      'overchannel',
    ])
    expect(evoker.description).toContain('bitter cold, searing flame')
    const overchannel = evoker.features.find((f) => f.id === 'overchannel')
    expect(overchannel?.description).toContain('2d12 Necrotic damage')
  })

  it('Wizard ships spellcasting prose, prepared spells, and features', () => {
    const wizard = getClassBySlug(RULESET, 'wizard')
    expect(wizard.features).toHaveLength(12)
    expectClassFeatureDescriptions(wizard)
    expect(asiLevelsFromFeatures(wizard)).toEqual([4, 8, 12, 16])
    expect(wizard.features.map((f) => f.id)).toContain('wizard-subclass')
    expect(wizard.spellcasting?.description).toContain('student of arcane magic')
    expect(wizard.spellcasting?.description).toContain('<strong>Spellbook.</strong>')
    expect(wizard.spellcasting?.spellsAvailable?.find((e) => e.level === 1)?.count).toBe(4)
    expect(wizard.spellcasting?.spellsAvailable?.find((e) => e.level === 20)?.count).toBe(25)
    const arcaneRecovery = wizard.features.find((f) => f.id === 'arcane-recovery')
    expect(arcaneRecovery?.description).toContain('half your Wizard level')
    const signatureSpells = wizard.features.find((f) => f.id === 'signature-spells')
    expect(signatureSpells?.description).toContain('Short or Long Rest')
  })

  it('stores class skill options under characterCreation.proficiencies', () => {
    for (const cls of classes) {
      const from = skillSlugsFromClassChoices(cls)
      const choice = cls.characterCreation?.proficiencies?.skills?.choices?.[0]
      if (from.length === 0) {
        expect(choice).toBeUndefined()
        continue
      }
      expect(choice?.from).toEqual(from)
      expect(choice?.choose).toBeGreaterThan(0)
    }
  })

  it('ships starting equipment for every class with at least two options', () => {
    for (const cls of classes) {
      const startingEquipment = cls.characterCreation?.startingEquipment
      expect(
        startingEquipment,
        `${cls.slug} missing characterCreation.startingEquipment`,
      ).toBeDefined()
      expect(startingEquipment!.choose).toBe(1)
      expect(startingEquipment!.options.length).toBeGreaterThanOrEqual(2)
      expect(new Set(startingEquipment!.options.map((option) => option.id)).size).toBe(
        startingEquipment!.options.length,
      )
    }
  })

  it('Fighter ships three distinct starting equipment packages', () => {
    const fighter = getClassBySlug(RULESET, 'fighter')
    const startingEquipment = fighter.characterCreation?.startingEquipment
    expect(startingEquipment).toBeDefined()
    expect(startingEquipment!.options.map((option) => option.id)).toEqual([
      'heavy',
      'skirmisher',
      'gold',
    ])
  })

  it('gold alternatives match SRD starting wealth amounts', () => {
    const expectedGoldGp: Record<string, number> = {
      barbarian: 75,
      bard: 90,
      cleric: 110,
      druid: 50,
      fighter: 155,
      monk: 50,
      paladin: 150,
      ranger: 150,
      rogue: 100,
      sorcerer: 50,
      warlock: 100,
      wizard: 55,
    }

    for (const cls of classes) {
      const startingEquipment = cls.characterCreation?.startingEquipment
      const goldOption = startingEquipment?.options.find((option) => option.id === 'gold')
      expect(goldOption, `${cls.slug} missing gold starting equipment option`).toBeDefined()
      expect(goldOption!.wealth).toEqual({ gp: expectedGoldGp[cls.slug] })
    }
  })

  it('Monk documents tool/instrument cross-reference in prose (FOLLOWUP: proficiencyLinkedChoice)', () => {
    const monk = getClassBySlug(RULESET, 'monk')
    const startingEquipment = monk.characterCreation?.startingEquipment
    expect(startingEquipment).toBeDefined()
    const standard = startingEquipment!.options.find((option) => option.id === 'standard')
    expect(standard?.description).toContain('Artisan')
    expect(standard?.description).toContain('FOLLOWUP: proficiencyLinkedChoice')
    expect(standard?.items.some((item) => item.kind === 'choice')).toBe(false)
  })

  it('all seed grantGroups are already in canonical form (normalizeGrantGroups round-trip is identity)', () => {
    for (const cls of classes) {
      for (const feature of cls.features) {
        if (!feature.grantGroups) continue
        expect(normalizeGrantGroups(feature.grantGroups), `${cls.slug} > ${feature.id}`).toEqual(
          feature.grantGroups,
        )
      }
    }
    for (const sub of subclasses) {
      for (const feature of sub.features) {
        if (!feature.grantGroups) continue
        expect(normalizeGrantGroups(feature.grantGroups), `${sub.slug} > ${feature.id}`).toEqual(
          feature.grantGroups,
        )
      }
    }
  })
})
