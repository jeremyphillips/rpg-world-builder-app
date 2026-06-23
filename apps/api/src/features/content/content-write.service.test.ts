import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'

import { clearTestDb, startTestDb, stopTestDb } from '../../test/db'
import { createUser } from '../user'
import { createCampaign } from '../campaign'
import { armorWriteConfig } from './armor/armor.config'
import { classWriteConfig } from './classes/classes.config'
import { ClassPatchModel } from './classes/class-patch.model'
import { resolveClassesForCampaign } from './classes/derive-classes-catalog'
import { HomebrewClassModel } from './classes/homebrew-class.model'
import { skillProficiencyWriteConfig } from './skill-proficiencies/skill-proficiencies.config'
import { spellWriteConfig } from './spells/spells.config'
import { createHomebrewContent, updateContentEntity } from './lib/content-write.service'
import { resolveCatalogForCampaign } from './content.service'
import { HttpError } from '../../lib/http-error'

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

describe('createHomebrewContent (armor)', () => {
  it('creates homebrew armor and returns it in the resolved catalog', async () => {
    const campaign = await makeCampaign()
    const created = await createHomebrewContent(armorWriteConfig, campaign.id, {
      slug: 'custom-leather',
      name: 'Custom Leather',
      category: 'light',
      cost: { amount: 15, currency: 'gp' },
      baseAc: 12,
      addDexModifier: true,
      stealthDisadvantage: false,
    })

    expect(created.source).toBe('homebrew')
    expect(created.slug).toBe('custom-leather')
    expect(created.baseAc).toBe(12)

    const armor = await resolveCatalogForCampaign(armorWriteConfig.readConfig, campaign.id)
    expect(armor.some((a) => a.slug === 'custom-leather')).toBe(true)
  })

  it('derives slug from name and ignores client-provided slug', async () => {
    const campaign = await makeCampaign()
    const created = await createHomebrewContent(armorWriteConfig, campaign.id, {
      slug: 'wrong-slug',
      name: 'Custom Leather',
      category: 'light',
      cost: { amount: 15, currency: 'gp' },
      baseAc: 12,
      addDexModifier: true,
      stealthDisadvantage: false,
    })

    expect(created.slug).toBe('custom-leather')
  })

  it('ignores slug changes on homebrew update', async () => {
    const campaign = await makeCampaign()
    const created = await createHomebrewContent(armorWriteConfig, campaign.id, {
      slug: 'custom-leather',
      name: 'Custom Leather',
      category: 'light',
      cost: { amount: 15, currency: 'gp' },
      baseAc: 12,
      addDexModifier: true,
      stealthDisadvantage: false,
    })

    const updated = await updateContentEntity(armorWriteConfig, campaign.id, created.id, {
      slug: 'renamed-slug',
      name: 'Renamed Leather',
    })

    expect(updated.slug).toBe('custom-leather')
    expect(updated.name).toBe('Renamed Leather')
  })

  it('patches a system armor record', async () => {
    const campaign = await makeCampaign()
    const fighter = (
      await resolveCatalogForCampaign(armorWriteConfig.readConfig, campaign.id)
    ).find((a) => a.slug === 'leather')!

    const updated = await updateContentEntity(armorWriteConfig, campaign.id, fighter.id, {
      baseAc: 12,
    })

    expect(updated.baseAc).toBe(12)
    expect(updated.source).toBe('system')
  })
})

const minimalClassInput = {
  slug: 'ignored-slug',
  name: 'Berserker',
  primaryAbilities: ['str'],
  hitDie: 12,
  asiLevels: [4],
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
