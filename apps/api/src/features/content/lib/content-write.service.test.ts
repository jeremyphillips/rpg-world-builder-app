import { describe, expect, it } from 'vitest'

import { isArmorEquipment, isWeaponEquipment, updateSpellInputSchema } from '@rpg/contracts'

import { makeTestCampaign } from '../../../test/fixtures/campaigns'
import { useIntegrationDb } from '../../../test/setup/integration-db'
import { classWriteConfig } from '../classes/classes.config'
import { equipmentWriteConfig } from '../equipment/equipment.config'
import { ClassPatchModel } from '../classes/class-patch.model'
import { resolveClassesForCampaign } from '../classes/derive-classes-catalog'
import { HomebrewClassModel } from '../classes/homebrew-class.model'
import { spellWriteConfig } from '../spells/spells.config'
import { featWriteConfig } from '../feats/feats.config'
import { speciesWriteConfig } from '../species/species.config'
import { createHomebrewContent, updateContentEntity } from './content-write.service'
import { resolveCatalogForCampaign } from '../content.service'
import { HttpError } from '../../../lib/http-error'
import { CREATURE_TYPE_SET_ID } from '@rpg/contracts'
import { updateVocabularyEntry, vocabularyUsageContextForCampaign } from '../../vocabulary'

useIntegrationDb()

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
    damage: { dice: { count: 1, faces: 8 } },
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
    const campaign = await makeTestCampaign()
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
    const campaign = await makeTestCampaign()
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
    const campaign = await makeTestCampaign()
    const created = await createHomebrewContent(
      equipmentWriteConfig,
      campaign.id,
      minimalWeaponInput,
    )

    expect(created.kind).toBe('weapon')
    expect(created.slug).toBe('custom-blade')
    if (!isWeaponEquipment(created)) throw new Error('expected weapon')
    expect(created.damage).toEqual({ dice: { count: 1, faces: 8 } })
  })

  it('creates homebrew tool with utilizes and crafts', async () => {
    const campaign = await makeTestCampaign()
    const created = await createHomebrewContent(equipmentWriteConfig, campaign.id, minimalToolInput)

    expect(created.kind).toBe('tool')
    if (created.kind !== 'tool') throw new Error('expected tool')
    expect(created.utilizes).toEqual(minimalToolInput.utilizes)
    expect(created.crafts).toEqual(['Lock'])
    expect(created.ability).toBe('dex')
  })

  it('updates homebrew tool utilizes and crafts', async () => {
    const campaign = await makeTestCampaign()
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
    const campaign = await makeTestCampaign()
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
    const campaign = await makeTestCampaign()
    const created = await createHomebrewContent(equipmentWriteConfig, campaign.id, {
      ...minimalArmorInput,
      slug: 'wrong-slug',
    })

    expect(created.slug).toBe('custom-leather')
  })

  it('ignores slug changes on homebrew update', async () => {
    const campaign = await makeTestCampaign()
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
    const campaign = await makeTestCampaign()
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
    const campaign = await makeTestCampaign()
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
    const campaign = await makeTestCampaign()
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
  proficiencies: {
    savingThrows: ['str', 'con'],
    armor: { categories: [], items: [] },
    weapons: { categories: ['simple'], items: [] },
    skills: { categories: [], items: [] },
  },
  characterCreation: {
    proficiencies: {
      skills: {
        choices: [{ id: 'class-skills', choose: 2, from: ['athletics'] }],
      },
    },
  },
  features: [{ name: 'Rage', level: 1 }],
}

describe('createHomebrewContent (classes)', () => {
  it('derives slug and feature ids on create', async () => {
    const campaign = await makeTestCampaign()
    const created = await createHomebrewContent(classWriteConfig, campaign.id, minimalClassInput)

    expect(created.slug).toBe('berserker')
    expect(created.features[0]?.id).toBe('rage')
  })

  it('preserves feature ids when the display name changes', async () => {
    const campaign = await makeTestCampaign()
    const created = await createHomebrewContent(classWriteConfig, campaign.id, minimalClassInput)

    const updated = await updateContentEntity(classWriteConfig, campaign.id, created.id, {
      features: [{ id: 'rage', name: 'Battle Rage', level: 1 }],
    })

    expect(updated.features[0]?.id).toBe('rage')
    expect(updated.features[0]?.name).toBe('Battle Rage')
  })

  it('rejects nested feature id rename on update', async () => {
    const campaign = await makeTestCampaign()
    const created = await createHomebrewContent(classWriteConfig, campaign.id, minimalClassInput)

    await expect(
      updateContentEntity(classWriteConfig, campaign.id, created.id, {
        features: [{ id: 'battle-rage', name: 'Rage', level: 1 }],
      }),
    ).rejects.toBeInstanceOf(HttpError)
  })

  it('persists characterCreation skill choices on homebrew create', async () => {
    const campaign = await makeTestCampaign()
    const created = await createHomebrewContent(classWriteConfig, campaign.id, {
      ...minimalClassInput,
      characterCreation: {
        proficiencies: {
          skills: {
            choices: [{ id: 'class-skills', choose: 2, from: ['athletics', 'stealth'] }],
          },
        },
      },
    })

    expect(created.characterCreation?.proficiencies?.skills?.choices?.[0]?.from).toEqual([
      'athletics',
      'stealth',
    ])

    const stored = await HomebrewClassModel.findById(created.id).lean()
    expect(stored?.characterCreation?.proficiencies?.skills?.choices?.[0]?.from).toEqual([
      'athletics',
      'stealth',
    ])
  })

  it('updates characterCreation skill choices on homebrew update', async () => {
    const campaign = await makeTestCampaign()
    const created = await createHomebrewContent(classWriteConfig, campaign.id, minimalClassInput)

    const updated = await updateContentEntity(classWriteConfig, campaign.id, created.id, {
      characterCreation: {
        proficiencies: {
          skills: {
            choices: [{ id: 'class-skills', choose: 2, from: ['athletics', 'arcana'] }],
          },
        },
      },
    })

    expect(updated.characterCreation?.proficiencies?.skills?.choices?.[0]?.from).toEqual([
      'athletics',
      'arcana',
    ])
  })

  it('patches system class skill choices when a system class is updated', async () => {
    const campaign = await makeTestCampaign()
    const rogue = (await resolveClassesForCampaign(campaign.id)).find(
      (cls) => cls.slug === 'rogue',
    )!
    const rogueChoice = rogue.characterCreation?.proficiencies?.skills?.choices?.[0]
    expect(rogueChoice).toBeDefined()
    if (!rogueChoice) throw new Error('expected rogue skill choice')

    await updateContentEntity(classWriteConfig, campaign.id, rogue.id, {
      characterCreation: {
        ...rogue.characterCreation,
        proficiencies: {
          skills: {
            choices: [
              {
                ...rogueChoice,
                from: [...rogueChoice.from, 'medicine'],
              },
            ],
          },
        },
      },
    })

    const classes = await resolveClassesForCampaign(campaign.id)
    const patchedRogue = classes.find((cls) => cls.slug === 'rogue')!
    expect(patchedRogue.characterCreation?.proficiencies?.skills?.choices?.[0]?.from).toContain(
      'medicine',
    )
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
    const campaign = await makeTestCampaign()
    const created = await createHomebrewContent(spellWriteConfig, campaign.id, minimalSpellInput)

    expect(created.source).toBe('homebrew')
    expect(created.slug).toBe('custom-bolt')
    expect(created.level).toBe(0)

    const spells = await resolveCatalogForCampaign(spellWriteConfig.readConfig, campaign.id)
    expect(spells.some((s) => s.slug === 'custom-bolt')).toBe(true)
  })

  it('rejects classIds for classes without spellcasting', async () => {
    const campaign = await makeTestCampaign()

    await expect(
      createHomebrewContent(spellWriteConfig, campaign.id, {
        ...minimalSpellInput,
        slug: 'martial-bolt',
        classIds: ['fighter'],
      }),
    ).rejects.toMatchObject({ status: 400, code: 'validation_error' })
  })

  it('accepts a patched class that gained spellcasting', async () => {
    const campaign = await makeTestCampaign()
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
    const campaign = await makeTestCampaign()
    const created = await createHomebrewContent(spellWriteConfig, campaign.id, minimalSpellInput)

    await expect(
      updateContentEntity(spellWriteConfig, campaign.id, created.id, {
        classIds: ['fighter'],
      }),
    ).rejects.toMatchObject({ status: 400, code: 'validation_error' })
  })

  it('patches a system spell record', async () => {
    const campaign = await makeTestCampaign()
    const fireBolt = (
      await resolveCatalogForCampaign(spellWriteConfig.readConfig, campaign.id)
    ).find((s) => s.slug === 'fire-bolt')!

    const updated = await updateContentEntity(spellWriteConfig, campaign.id, fireBolt.id, {
      name: 'Enhanced Fire Bolt',
    })

    expect(updated.name).toBe('Enhanced Fire Bolt')
    expect(updated.source).toBe('system')
  })

  it('replaces resolution on a system spell via overlay patch', async () => {
    const campaign = await makeTestCampaign()
    const eldritchBlast = (
      await resolveCatalogForCampaign(spellWriteConfig.readConfig, campaign.id)
    ).find((spell) => spell.slug === 'eldritch-blast')!

    expect(eldritchBlast.resolution).toBeDefined()
    expect(eldritchBlast.resolution?.origin).toBeUndefined()
    expect(eldritchBlast.resolution?.areaOfEffect).toBeUndefined()

    const patchedResolution = {
      ...eldritchBlast.resolution!,
      effects: [
        {
          ...eldritchBlast.resolution!.effects[0]!,
          roll: { dice: { count: 2, faces: 10 } },
        },
      ],
    }

    const parsedUpdate = updateSpellInputSchema.parse({ resolution: patchedResolution })
    expect(parsedUpdate.resolution?.origin).toBeUndefined()
    expect(parsedUpdate.resolution?.areaOfEffect).toBeUndefined()

    const updated = await updateContentEntity(spellWriteConfig, campaign.id, eldritchBlast.id, {
      resolution: patchedResolution,
    })

    expect(updated.resolution).toEqual(patchedResolution)
    expect(updated.source).toBe('system')

    const reloaded = (
      await resolveCatalogForCampaign(spellWriteConfig.readConfig, campaign.id)
    ).find((spell) => spell.id === eldritchBlast.id)!
    expect(reloaded.resolution).toEqual(patchedResolution)
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
    const campaign = await makeTestCampaign()
    const created = await createHomebrewContent(featWriteConfig, campaign.id, minimalFeatInput)

    expect(created.source).toBe('homebrew')
    expect(created.slug).toBe('custom-feat')
    expect(created.category).toBe('origin')

    const feats = await resolveCatalogForCampaign(featWriteConfig.readConfig, campaign.id)
    expect(feats.some((f) => f.slug === 'custom-feat')).toBe(true)
  })

  it('patches a system feat record', async () => {
    const campaign = await makeTestCampaign()
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

describe('createHomebrewContent (species)', () => {
  const minimalSpeciesInput = {
    slug: 'custom-folk',
    name: 'Custom Folk',
    creatureType: 'humanoid',
    sizes: ['medium'],
    movement: { walk: 30 },
    traits: [],
  }

  it('creates homebrew species with an active creature type', async () => {
    const campaign = await makeTestCampaign()
    const created = await createHomebrewContent(
      speciesWriteConfig,
      campaign.id,
      minimalSpeciesInput,
    )

    expect(created.source).toBe('homebrew')
    expect(created.creatureType).toBe('humanoid')
  })

  it('rejects a disabled creature type', async () => {
    const campaign = await makeTestCampaign()
    await updateVocabularyEntry(
      vocabularyUsageContextForCampaign(campaign.id),
      CREATURE_TYPE_SET_ID,
      'beast',
      {
        status: 'disabled',
      },
    )

    await expect(
      createHomebrewContent(speciesWriteConfig, campaign.id, {
        ...minimalSpeciesInput,
        creatureType: 'beast',
      }),
    ).rejects.toMatchObject({
      status: 400,
      code: 'invalid_vocabulary',
    })
  })

  it('creates homebrew species with characterCreation multiclass data', async () => {
    const campaign = await makeTestCampaign()
    const created = await createHomebrewContent(speciesWriteConfig, campaign.id, {
      ...minimalSpeciesInput,
      characterCreation: {
        multiclassing: {
          policy: 'restricted',
          classPolicy: { mode: 'only', classIds: ['fighter'] },
        },
        levelLimits: {
          maxCharacterLevel: 10,
          classLevelCaps: [{ classId: 'wizard', maxLevel: 5 }],
        },
      },
    })

    expect(created.characterCreation?.multiclassing?.classPolicy.classIds).toEqual(['fighter'])
    expect(created.characterCreation?.levelLimits?.maxCharacterLevel).toBe(10)
  })

  it('rejects unknown class slugs in characterCreation', async () => {
    const campaign = await makeTestCampaign()

    await expect(
      createHomebrewContent(speciesWriteConfig, campaign.id, {
        ...minimalSpeciesInput,
        characterCreation: {
          multiclassing: {
            policy: 'restricted',
            classPolicy: { mode: 'only', classIds: ['not-a-class'] },
          },
        },
      }),
    ).rejects.toMatchObject({
      status: 400,
      code: 'validation_error',
    })
  })

  it('updates homebrew species characterCreation and round-trips via catalog', async () => {
    const campaign = await makeTestCampaign()
    const created = await createHomebrewContent(
      speciesWriteConfig,
      campaign.id,
      minimalSpeciesInput,
    )

    const updated = await updateContentEntity(speciesWriteConfig, campaign.id, created.id, {
      characterCreation: {
        multiclassing: {
          policy: 'restricted',
          classPolicy: { mode: 'only', classIds: ['fighter'] },
        },
        levelLimits: {
          maxCharacterLevel: 10,
          classLevelCaps: [{ classId: 'wizard', maxLevel: 5 }],
        },
      },
    })

    expect(updated.characterCreation?.multiclassing?.classPolicy.classIds).toEqual(['fighter'])
    expect(updated.characterCreation?.levelLimits?.maxCharacterLevel).toBe(10)

    const species = await resolveCatalogForCampaign(speciesWriteConfig.readConfig, campaign.id)
    const fromCatalog = species.find((record) => record.slug === 'custom-folk')
    expect(fromCatalog?.characterCreation).toEqual(updated.characterCreation)
  })

  it('rejects unknown class slugs on species update', async () => {
    const campaign = await makeTestCampaign()
    const created = await createHomebrewContent(
      speciesWriteConfig,
      campaign.id,
      minimalSpeciesInput,
    )

    await expect(
      updateContentEntity(speciesWriteConfig, campaign.id, created.id, {
        characterCreation: {
          multiclassing: {
            policy: 'restricted',
            classPolicy: { mode: 'only', classIds: ['not-a-class'] },
          },
        },
      }),
    ).rejects.toMatchObject({
      status: 400,
      code: 'validation_error',
    })
  })
})
