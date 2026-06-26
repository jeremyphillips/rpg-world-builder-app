import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'

import { isArmorEquipment, isWeaponEquipment } from '@rpg/contracts'

import { clearTestDb, startTestDb, stopTestDb } from '../../test/db'
import { createUser } from '../user'
import { createCampaign } from '../campaign'
import { classWriteConfig } from './classes/classes.config'
import { equipmentWriteConfig } from './equipment/equipment.config'
import { ClassPatchModel } from './classes/class-patch.model'
import { resolveClassesForCampaign } from './classes/derive-classes-catalog'
import { HomebrewClassModel } from './classes/homebrew-class.model'
import { skillProficiencyWriteConfig } from './skill-proficiencies/skill-proficiencies.config'
import { spellWriteConfig } from './spells/spells.config'
import { featWriteConfig } from './feats/feats.config'
import { speciesWriteConfig } from './species/species.config'
import { startingWealthWriteConfig } from './starting-wealth/starting-wealth.config'
import { createHomebrewContent, updateContentEntity } from './lib/content-write.service'
import { resolveCatalogForCampaign } from './content.service'
import { HttpError } from '../../lib/http-error'
import { CREATURE_TYPE_SET_ID } from '@rpg/contracts'
import { updateVocabularyEntry } from '../vocabulary'

beforeAll(async () => {
  await startTestDb()
})

afterAll(async () => {
  await stopTestDb()
})

beforeEach(async () => {
  await clearTestDb()
})

async function makeCampaign() {
  const owner = await createUser({
    email: 'dm@example.com',
    passwordHash: 'x',
    displayName: 'DM',
  })
  return createCampaign({ name: 'Catalog', createdBy: owner.id })
}

describe('createHomebrewContent (equipment)', () => {
  const minimalArmorInput = {
    kind: 'armor' as const,
    slug: 'custom-leather',
    name: 'Custom Leather',
    category: 'light' as const,
    cost: { amount: 15, currency: 'gp' as const },
    baseAc: 12,
    addDexModifier: true,
    stealthDisadvantage: false,
  }

  const minimalWeaponInput = {
    kind: 'weapon' as const,
    slug: 'custom-blade',
    name: 'Custom Blade',
    category: 'martial' as const,
    mode: 'melee' as const,
    cost: { amount: 25, currency: 'gp' as const },
    damage: { kind: 'dice' as const, count: 1, faces: 8 },
    damageType: 'slashing' as const,
    properties: [] as const,
    mastery: 'sap' as const,
  }

  const minimalToolInput = {
    kind: 'tool' as const,
    slug: 'custom-lockpicks',
    name: 'Custom Lockpicks',
    toolCategory: 'thieves' as const,
    ability: 'dex' as const,
    cost: { amount: 30, currency: 'gp' as const },
    weight: { value: 1, unit: 'lb' as const },
    utilizes: [
      { description: 'Pick a lock', dc: 15 },
      { description: 'Disarm a trap', dc: 15 },
    ],
    crafts: ['Lock'],
  }

  it('returns the merged system catalog including weapons and armor', async () => {
    const campaign = await makeCampaign()
    const equipment = await resolveCatalogForCampaign(equipmentWriteConfig.readConfig, campaign.id)

    expect(equipment.some((item) => item.kind === 'weapon' && item.slug === 'longsword')).toBe(true)
    expect(equipment.some((item) => item.kind === 'armor' && item.slug === 'leather-armor')).toBe(
      true,
    )
    expect(
      equipment.some((item) => item.kind === 'magic_item' && item.slug === 'bracers-of-defense'),
    ).toBe(true)
  })

  it('creates homebrew armor and returns it in the resolved catalog', async () => {
    const campaign = await makeCampaign()
    const created = await createHomebrewContent(
      equipmentWriteConfig,
      campaign.id,
      minimalArmorInput,
    )

    expect(created.source).toBe('homebrew')
    expect(created.kind).toBe('armor')
    if (!isArmorEquipment(created)) throw new Error('expected armor')
    expect(created.baseAc).toBe(12)

    const equipment = await resolveCatalogForCampaign(equipmentWriteConfig.readConfig, campaign.id)
    expect(equipment.some((item) => item.slug === 'custom-leather')).toBe(true)
  })

  it('creates homebrew weapon with flat storage (no nested body)', async () => {
    const campaign = await makeCampaign()
    const created = await createHomebrewContent(
      equipmentWriteConfig,
      campaign.id,
      minimalWeaponInput,
    )

    expect(created.kind).toBe('weapon')
    expect(created.slug).toBe('custom-blade')
    if (!isWeaponEquipment(created)) throw new Error('expected weapon')
    expect(created.damage).toEqual({ kind: 'dice', count: 1, faces: 8 })
  })

  it('creates homebrew tool with utilizes and crafts', async () => {
    const campaign = await makeCampaign()
    const created = await createHomebrewContent(equipmentWriteConfig, campaign.id, minimalToolInput)

    expect(created.kind).toBe('tool')
    if (created.kind !== 'tool') throw new Error('expected tool')
    expect(created.utilizes).toEqual(minimalToolInput.utilizes)
    expect(created.crafts).toEqual(['Lock'])
    expect(created.ability).toBe('dex')
  })

  it('updates homebrew tool utilizes and crafts', async () => {
    const campaign = await makeCampaign()
    const created = await createHomebrewContent(equipmentWriteConfig, campaign.id, minimalToolInput)

    const updated = await updateContentEntity(equipmentWriteConfig, campaign.id, created.id, {
      kind: 'tool',
      utilizes: [{ description: 'Detect a hidden compartment', dc: 20 }],
      crafts: ['Hidden compartment'],
    })

    if (updated.kind !== 'tool') throw new Error('expected tool')
    expect(updated.utilizes).toEqual([{ description: 'Detect a hidden compartment', dc: 20 }])
    expect(updated.crafts).toEqual(['Hidden compartment'])
  })

  it('patches a system tool record', async () => {
    const campaign = await makeCampaign()
    const thievesTools = (
      await resolveCatalogForCampaign(equipmentWriteConfig.readConfig, campaign.id)
    ).find((item) => item.slug === 'thieves-tools' && item.kind === 'tool')!

    const updated = await updateContentEntity(equipmentWriteConfig, campaign.id, thievesTools.id, {
      kind: 'tool',
      name: "Enhanced Thieves' Tools",
    })

    if (updated.kind !== 'tool') throw new Error('expected tool')
    expect(updated.name).toBe("Enhanced Thieves' Tools")
    expect(updated.utilizes).toHaveLength(2)
    expect(updated.source).toBe('system')
  })

  it('derives slug from name and ignores client-provided slug', async () => {
    const campaign = await makeCampaign()
    const created = await createHomebrewContent(equipmentWriteConfig, campaign.id, {
      ...minimalArmorInput,
      slug: 'wrong-slug',
    })

    expect(created.slug).toBe('custom-leather')
  })

  it('ignores slug changes on homebrew update', async () => {
    const campaign = await makeCampaign()
    const created = await createHomebrewContent(
      equipmentWriteConfig,
      campaign.id,
      minimalArmorInput,
    )

    const updated = await updateContentEntity(equipmentWriteConfig, campaign.id, created.id, {
      kind: 'armor',
      slug: 'renamed-slug',
      name: 'Renamed Leather',
    })

    expect(updated.slug).toBe('custom-leather')
    expect(updated.name).toBe('Renamed Leather')
  })

  it('patches a system armor record', async () => {
    const campaign = await makeCampaign()
    const leather = (
      await resolveCatalogForCampaign(equipmentWriteConfig.readConfig, campaign.id)
    ).find((item) => item.slug === 'leather-armor' && item.kind === 'armor')!

    const updated = await updateContentEntity(equipmentWriteConfig, campaign.id, leather.id, {
      kind: 'armor',
      baseAc: 12,
    })

    if (!isArmorEquipment(updated)) throw new Error('expected armor')
    expect(updated.baseAc).toBe(12)
    expect(updated.source).toBe('system')
  })

  it('patches a system weapon record', async () => {
    const campaign = await makeCampaign()
    const longsword = (
      await resolveCatalogForCampaign(equipmentWriteConfig.readConfig, campaign.id)
    ).find((item) => item.slug === 'longsword' && item.kind === 'weapon')!

    const updated = await updateContentEntity(equipmentWriteConfig, campaign.id, longsword.id, {
      kind: 'weapon',
      name: 'Enhanced Longsword',
    })

    expect(updated.name).toBe('Enhanced Longsword')
    expect(updated.source).toBe('system')
  })

  it('patches a system magic item record', async () => {
    const campaign = await makeCampaign()
    const bracers = (
      await resolveCatalogForCampaign(equipmentWriteConfig.readConfig, campaign.id)
    ).find((item) => item.slug === 'bracers-of-defense' && item.kind === 'magic_item')!

    const updated = await updateContentEntity(equipmentWriteConfig, campaign.id, bracers.id, {
      kind: 'magic_item',
      rarity: 'very_rare',
    })

    if (updated.kind !== 'magic_item') throw new Error('expected magic item')
    expect(updated.rarity).toBe('very_rare')
    expect(updated.source).toBe('system')
  })
})

const minimalClassInput = {
  slug: 'ignored-slug',
  name: 'Berserker',
  primaryAbilities: ['str'],
  hitDie: 12,
  subclassChoiceLevel: 3,
  proficiencies: {
    savingThrows: ['str', 'con'],
    armor: [] as const,
    weapons: { categories: ['simple'] as const },
    skills: { choose: 2, from: ['athletics'] as const },
  },
  features: [{ name: 'Rage', level: 1 }],
}

describe('createHomebrewContent (classes)', () => {
  it('derives slug and feature ids on create', async () => {
    const campaign = await makeCampaign()
    const created = await createHomebrewContent(classWriteConfig, campaign.id, minimalClassInput)

    expect(created.slug).toBe('berserker')
    expect(created.features[0]?.id).toBe('rage')
  })

  it('preserves feature ids when the display name changes', async () => {
    const campaign = await makeCampaign()
    const created = await createHomebrewContent(classWriteConfig, campaign.id, minimalClassInput)

    const updated = await updateContentEntity(classWriteConfig, campaign.id, created.id, {
      features: [{ id: 'rage', name: 'Battle Rage', level: 1 }],
    })

    expect(updated.features[0]?.id).toBe('rage')
    expect(updated.features[0]?.name).toBe('Battle Rage')
  })

  it('rejects nested feature id rename on update', async () => {
    const campaign = await makeCampaign()
    const created = await createHomebrewContent(classWriteConfig, campaign.id, minimalClassInput)

    await expect(
      updateContentEntity(classWriteConfig, campaign.id, created.id, {
        features: [{ id: 'battle-rage', name: 'Rage', level: 1 }],
      }),
    ).rejects.toBeInstanceOf(HttpError)
  })

  it('syncs suggestedClasses when homebrew class skill options are set on create', async () => {
    const campaign = await makeCampaign()
    await createHomebrewContent(classWriteConfig, campaign.id, {
      ...minimalClassInput,
      proficiencies: {
        ...minimalClassInput.proficiencies,
        skills: { choose: 2, from: ['athletics', 'stealth'] },
      },
    })

    const skills = await resolveCatalogForCampaign(
      skillProficiencyWriteConfig.readConfig,
      campaign.id,
    )
    const athletics = skills.find((skill) => skill.slug === 'athletics')!
    const stealth = skills.find((skill) => skill.slug === 'stealth')!

    expect(athletics.suggestedClasses).toContain('berserker')
    expect(stealth.suggestedClasses).toContain('berserker')
  })

  it('syncs suggestedClasses when homebrew class skill options change on update', async () => {
    const campaign = await makeCampaign()
    const created = await createHomebrewContent(classWriteConfig, campaign.id, {
      ...minimalClassInput,
      proficiencies: {
        ...minimalClassInput.proficiencies,
        skills: { choose: 2, from: ['athletics'] },
      },
    })

    await updateContentEntity(classWriteConfig, campaign.id, created.id, {
      proficiencies: {
        ...minimalClassInput.proficiencies,
        skills: { choose: 2, from: ['athletics', 'arcana'] },
      },
    })

    const skills = await resolveCatalogForCampaign(
      skillProficiencyWriteConfig.readConfig,
      campaign.id,
    )
    const arcana = skills.find((skill) => skill.slug === 'arcana')!
    expect(arcana.suggestedClasses).toContain('berserker')
  })

  it('patches system skill suggestedClasses when a system class skill options change', async () => {
    const campaign = await makeCampaign()
    const rogue = (await resolveClassesForCampaign(campaign.id)).find(
      (cls) => cls.slug === 'rogue',
    )!

    await updateContentEntity(classWriteConfig, campaign.id, rogue.id, {
      proficiencies: {
        ...rogue.proficiencies,
        skills: {
          ...rogue.proficiencies.skills,
          from: [...rogue.proficiencies.skills.from, 'medicine'],
        },
      },
    })

    const skills = await resolveCatalogForCampaign(
      skillProficiencyWriteConfig.readConfig,
      campaign.id,
    )
    const medicine = skills.find((skill) => skill.slug === 'medicine')!
    expect(medicine.suggestedClasses).toContain('rogue')
  })

  it('does not persist skills.from on homebrew create', async () => {
    const campaign = await makeCampaign()
    const created = await createHomebrewContent(classWriteConfig, campaign.id, {
      ...minimalClassInput,
      proficiencies: {
        ...minimalClassInput.proficiencies,
        skills: { choose: 2, from: ['athletics', 'stealth'] },
      },
    })

    expect(created.proficiencies.skills.from).toEqual(['athletics', 'stealth'])

    const stored = await HomebrewClassModel.findById(created.id).lean()
    expect(stored?.proficiencies.skills.from).toBeUndefined()
  })
})

describe('createHomebrewContent (spells)', () => {
  const minimalSpellInput = {
    slug: 'custom-bolt',
    name: 'Custom Bolt',
    description: '<p>A custom cantrip.</p>',
    school: 'evocation' as const,
    level: 0,
    classIds: ['wizard'],
    castingTime: { normal: { value: 1, unit: 'action' as const }, canBeCastAsRitual: false },
    range: { kind: 'distance' as const, value: { value: 60, unit: 'ft' as const } },
    duration: { kind: 'instantaneous' as const },
    components: { verbal: true, somatic: true },
  }

  it('creates homebrew spell and returns it in the resolved catalog', async () => {
    const campaign = await makeCampaign()
    const created = await createHomebrewContent(spellWriteConfig, campaign.id, minimalSpellInput)

    expect(created.source).toBe('homebrew')
    expect(created.slug).toBe('custom-bolt')
    expect(created.level).toBe(0)

    const spells = await resolveCatalogForCampaign(spellWriteConfig.readConfig, campaign.id)
    expect(spells.some((s) => s.slug === 'custom-bolt')).toBe(true)
  })

  it('rejects classIds for classes without spellcasting', async () => {
    const campaign = await makeCampaign()

    await expect(
      createHomebrewContent(spellWriteConfig, campaign.id, {
        ...minimalSpellInput,
        slug: 'martial-bolt',
        classIds: ['fighter'],
      }),
    ).rejects.toMatchObject({ status: 400, code: 'validation_error' })
  })

  it('accepts a patched class that gained spellcasting', async () => {
    const campaign = await makeCampaign()
    await ClassPatchModel.create({
      campaignId: campaign.id,
      targetId: 'srd-cc-5.2.1:barbarian',
      patch: {
        spellcasting: {
          level: 1,
          progression: 'full',
          ability: 'wis',
          preparation: 'known',
        },
      },
    })

    const created = await createHomebrewContent(spellWriteConfig, campaign.id, {
      ...minimalSpellInput,
      slug: 'barbarian-bolt',
      classIds: ['barbarian'],
    })

    expect(created.classIds).toEqual(['barbarian'])
  })

  it('rejects update that assigns non-caster classIds', async () => {
    const campaign = await makeCampaign()
    const created = await createHomebrewContent(spellWriteConfig, campaign.id, minimalSpellInput)

    await expect(
      updateContentEntity(spellWriteConfig, campaign.id, created.id, {
        classIds: ['fighter'],
      }),
    ).rejects.toMatchObject({ status: 400, code: 'validation_error' })
  })

  it('patches a system spell record', async () => {
    const campaign = await makeCampaign()
    const fireBolt = (
      await resolveCatalogForCampaign(spellWriteConfig.readConfig, campaign.id)
    ).find((s) => s.slug === 'fire-bolt')!

    const updated = await updateContentEntity(spellWriteConfig, campaign.id, fireBolt.id, {
      name: 'Enhanced Fire Bolt',
    })

    expect(updated.name).toBe('Enhanced Fire Bolt')
    expect(updated.source).toBe('system')
  })
})

describe('createHomebrewContent (feats)', () => {
  const minimalFeatInput = {
    slug: 'custom-feat',
    name: 'Custom Feat',
    description: '<p>A custom origin feat benefit.</p>',
    category: 'origin' as const,
    repeatable: { allowed: false },
  }

  it('creates homebrew feat and returns it in the resolved catalog', async () => {
    const campaign = await makeCampaign()
    const created = await createHomebrewContent(featWriteConfig, campaign.id, minimalFeatInput)

    expect(created.source).toBe('homebrew')
    expect(created.slug).toBe('custom-feat')
    expect(created.category).toBe('origin')

    const feats = await resolveCatalogForCampaign(featWriteConfig.readConfig, campaign.id)
    expect(feats.some((f) => f.slug === 'custom-feat')).toBe(true)
  })

  it('patches a system feat record', async () => {
    const campaign = await makeCampaign()
    const alert = (await resolveCatalogForCampaign(featWriteConfig.readConfig, campaign.id)).find(
      (f) => f.slug === 'alert',
    )!

    const updated = await updateContentEntity(featWriteConfig, campaign.id, alert.id, {
      name: 'Enhanced Alert',
    })

    expect(updated.name).toBe('Enhanced Alert')
    expect(updated.source).toBe('system')
  })
})

describe('updateContentEntity (starting-wealth)', () => {
  it('patches the system starting wealth table tiers', async () => {
    const campaign = await makeCampaign()
    const standard = (
      await resolveCatalogForCampaign(startingWealthWriteConfig.readConfig, campaign.id)
    )[0]!

    const updated = await updateContentEntity(startingWealthWriteConfig, campaign.id, standard.id, {
      tiers: standard.tiers.map((tier) =>
        tier.id === 'level-1'
          ? {
              ...tier,
              includeNormalStartingEquipment: false,
            }
          : tier,
      ),
    })

    expect(updated.source).toBe('system')
    expect(
      updated.tiers.find((tier) => tier.id === 'level-1')?.includeNormalStartingEquipment,
    ).toBe(false)
  })
})

describe('createHomebrewContent (species)', () => {
  const minimalSpeciesInput = {
    slug: 'custom-folk',
    name: 'Custom Folk',
    creatureType: 'humanoid',
    sizes: ['medium'],
    speed: { walk: 30 },
    traits: [],
  }

  it('creates homebrew species with an active creature type', async () => {
    const campaign = await makeCampaign()
    const created = await createHomebrewContent(
      speciesWriteConfig,
      campaign.id,
      minimalSpeciesInput,
    )

    expect(created.source).toBe('homebrew')
    expect(created.creatureType).toBe('humanoid')
  })

  it('rejects a disabled creature type', async () => {
    const campaign = await makeCampaign()
    await updateVocabularyEntry(campaign.id, CREATURE_TYPE_SET_ID, 'humanoid', {
      status: 'disabled',
    })

    await expect(
      createHomebrewContent(speciesWriteConfig, campaign.id, minimalSpeciesInput),
    ).rejects.toMatchObject({
      status: 400,
      code: 'invalid_vocabulary',
    })
  })
})
