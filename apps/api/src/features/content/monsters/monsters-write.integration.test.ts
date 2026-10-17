import { describe, expect, it } from 'vitest'
import { isApiValidationDetails } from '@rpg/contracts'

import { makeTestCampaign } from '../../../test/fixtures/campaigns'
import { minimalHomebrewMonsterInput } from '../../../test/fixtures/monsters'
import { useIntegrationDb } from '../../../test/setup/integration-db'
import { HttpError } from '../../../lib/http-error'
import { resolveCatalogForCampaign } from '../content.service'
import { promoteContentToPublished } from '../lib/content-status.service'
import { createHomebrewContent, updateContentEntity } from '../lib/content-write.service'
import { locationWriteConfig } from '../locations/locations.config'
import { organizationWriteConfig } from '../organizations/organizations.config'
import { speciesWriteConfig } from '../species/species.config'
import { spellWriteConfig } from '../spells/spells.config'
import { subclassWriteConfig } from '../subclasses/subclasses.config'
import { ELDRITCH_BLAST_RESOLUTION } from '@rpg/contracts'
import { MonsterPatchModel } from './monster-patch.model'
import { monstersWriteConfig } from './monsters.config'
import { monstersValidateBeforeWrite } from './monsters-write-hooks'

useIntegrationDb()

const FIGHTER_CLASS_ID = 'srd-cc-5.2.1:fighter'

describe('monster write validation', () => {
  it('promotes only when equipment Armor Class has equipped body armor', async () => {
    const campaign = await makeTestCampaign()
    const created = await createHomebrewContent(
      monstersWriteConfig,
      campaign.id,
      {
        ...minimalHomebrewMonsterInput,
        slug: 'equipment-ac-draft',
        armorClass: { kind: 'equipment' },
        equipment: [],
        actions: [],
        proficiencies: {
          savingThrows: [],
          skills: [],
          languages: [],
          weapons: [],
        },
      },
      { status: 'draft' },
    )
    expect(created.status).toBe('draft')

    try {
      await promoteContentToPublished(monstersWriteConfig, campaign.id, created.id)
      throw new Error('expected promotion to fail')
    } catch (error) {
      expect(error).toBeInstanceOf(HttpError)
      const httpError = error as HttpError
      expect(httpError.status).toBe(400)
      expect(httpError.code).toBe('validation_error')
      expect(isApiValidationDetails(httpError.details)).toBe(true)
      if (!isApiValidationDetails(httpError.details)) return
      expect(httpError.details.issues).toEqual([
        expect.objectContaining({ path: 'armorClass.kind', code: expect.any(String) }),
      ])
    }

    const catalog = await resolveCatalogForCampaign(monstersWriteConfig.readConfig, campaign.id)
    expect(catalog.find((row) => row.id === created.id)?.status).toBe('draft')
  })

  it('returns 400 for unknown equipment, a non-weapon reaction, a bad modifier, and two body armors', async () => {
    const campaign = await makeTestCampaign()
    const chainId = 'srd-cc-5.2.1:chain-shirt'
    const leatherId = 'srd-cc-5.2.1:leather-armor'
    const daggerId = 'srd-cc-5.2.1:dagger'

    const cases = [
      {
        equipment: [{ entryId: 'missing', equipmentId: 'missing-item', quantity: 1 }],
        actions: [],
        path: 'equipment.0.equipmentId',
      },
      {
        equipment: [{ entryId: 'chain', equipmentId: chainId, quantity: 1, equipped: true }],
        reactions: [{ id: 'parry', kind: 'weapon', equipmentEntryId: 'chain' }],
        actions: [],
        path: 'reactions.0.equipmentEntryId',
      },
      {
        equipment: [
          {
            entryId: 'dagger',
            equipmentId: daggerId,
            quantity: 1,
            modifiers: [{ kind: 'armor_class', bonus: 1 }],
          },
        ],
        actions: [],
        path: 'equipment.0.adjustments',
      },
      {
        armorClass: { kind: 'natural', bonus: 1 },
        equipment: [
          { entryId: 'leather', equipmentId: leatherId, quantity: 1, equipped: true },
          { entryId: 'chain', equipmentId: chainId, quantity: 1, equipped: true },
        ],
        actions: [],
        path: 'equipment.1.equipped',
      },
    ] as const

    for (const [index, entry] of cases.entries()) {
      await expect(
        createHomebrewContent(
          monstersWriteConfig,
          campaign.id,
          {
            ...minimalHomebrewMonsterInput,
            slug: `invalid-monster-${index}`,
            proficiencies: {
              savingThrows: [],
              skills: [],
              languages: [],
              weapons: [],
            },
            ...entry,
          },
          { status: 'draft' },
        ),
      ).rejects.toMatchObject({ status: 400, code: 'validation_error' })
    }
  })

  it('preserves equipment magic fields on draft write and catalog read', async () => {
    const campaign = await makeTestCampaign()
    const longswordId = 'srd-cc-5.2.1:longsword'
    const equipment = [
      {
        entryId: 'e1',
        equipmentId: longswordId,
        quantity: 2,
        equipped: true,
        magical: true,
        magicProperties: [
          { kind: 'preset' as const, propertyId: 'srd-cc-5.2.1:weapon-enhancement-1' },
        ],
        adjustments: [{ effectId: 'fx1', target: 'attack_roll' as const, bonus: 1 }],
      },
      {
        entryId: 'custom-stack',
        equipmentId: longswordId,
        quantity: 1,
        equipped: true,
        magical: true,
        magicProperties: [
          {
            kind: 'custom' as const,
            customId: 'c1',
            name: 'Glow',
            description: 'Shines',
          },
        ],
      },
    ]
    const created = await createHomebrewContent(
      monstersWriteConfig,
      campaign.id,
      {
        ...minimalHomebrewMonsterInput,
        slug: 'equipment-magic-roundtrip',
        equipment,
        actions: [{ id: 'slash', kind: 'weapon', equipmentEntryId: 'e1' }],
        proficiencies: {
          savingThrows: [],
          skills: [],
          languages: [],
          weapons: [],
        },
      },
      { status: 'draft' },
    )
    expect(created.equipment).toEqual(equipment)

    const catalog = await resolveCatalogForCampaign(monstersWriteConfig.readConfig, campaign.id)
    const stored = catalog.find((row) => row.id === created.id)
    expect(stored?.equipment).toEqual(equipment)
  })

  it('preserves post-split stack shapes on draft write and catalog read', async () => {
    const campaign = await makeTestCampaign()
    const longswordId = 'srd-cc-5.2.1:longsword'
    const equipment = [
      {
        entryId: 'plain-stack',
        equipmentId: longswordId,
        quantity: 1,
        equipped: true,
      },
      {
        entryId: 'split-copy',
        equipmentId: longswordId,
        quantity: 1,
        equipped: true,
        magical: true,
        magicProperties: [
          { kind: 'preset' as const, propertyId: 'srd-cc-5.2.1:weapon-enhancement-1' },
        ],
      },
    ]
    const created = await createHomebrewContent(
      monstersWriteConfig,
      campaign.id,
      {
        ...minimalHomebrewMonsterInput,
        slug: 'equipment-split-stacks',
        equipment,
        actions: [{ id: 'slash', kind: 'weapon', equipmentEntryId: 'plain-stack' }],
        proficiencies: {
          savingThrows: [],
          skills: [],
          languages: [],
          weapons: [],
        },
      },
      { status: 'draft' },
    )
    expect(created.equipment).toEqual(equipment)

    const updated = await updateContentEntity(monstersWriteConfig, campaign.id, created.id, {
      equipment,
    })
    expect(updated.equipment).toEqual(equipment)

    const catalog = await resolveCatalogForCampaign(monstersWriteConfig.readConfig, campaign.id)
    const storedEquipment = catalog.find((row) => row.id === created.id)?.equipment
    expect(storedEquipment).toHaveLength(2)
    expect(storedEquipment?.[0]).toMatchObject({
      entryId: 'plain-stack',
      equipmentId: longswordId,
      quantity: 1,
      equipped: true,
    })
    expect(storedEquipment?.[1]).toMatchObject({
      entryId: 'split-copy',
      equipmentId: longswordId,
      quantity: 1,
      equipped: true,
      magical: true,
      magicProperties: [{ kind: 'preset', propertyId: 'srd-cc-5.2.1:weapon-enhancement-1' }],
    })
  })

  it('allows draft save with an unresolved magic preset id', async () => {
    const campaign = await makeTestCampaign()
    const longswordId = 'srd-cc-5.2.1:longsword'
    const created = await createHomebrewContent(
      monstersWriteConfig,
      campaign.id,
      {
        ...minimalHomebrewMonsterInput,
        slug: 'unresolved-preset-draft',
        equipment: [
          {
            entryId: 'sword',
            equipmentId: longswordId,
            quantity: 1,
            magical: true,
            magicProperties: [{ kind: 'preset', propertyId: 'removed-preset-id' }],
          },
        ],
        actions: [],
        proficiencies: {
          savingThrows: [],
          skills: [],
          languages: [],
          weapons: [],
        },
      },
      { status: 'draft' },
    )
    expect(created.equipment[0]?.magicProperties?.[0]).toEqual({
      kind: 'preset',
      propertyId: 'removed-preset-id',
    })
  })

  it('rejects unknown or duplicate magic property presets on publish', async () => {
    const campaign = await makeTestCampaign()
    const longswordId = 'srd-cc-5.2.1:longsword'

    await expect(
      createHomebrewContent(
        monstersWriteConfig,
        campaign.id,
        {
          ...minimalHomebrewMonsterInput,
          slug: 'bad-magic-preset',
          equipment: [
            {
              entryId: 'sword',
              equipmentId: longswordId,
              quantity: 1,
              magical: true,
              magicProperties: [{ kind: 'preset', propertyId: 'missing-preset' }],
            },
          ],
          actions: [],
          proficiencies: {
            savingThrows: [],
            skills: [],
            languages: [],
            weapons: [],
          },
        },
        { status: 'published' },
      ),
    ).rejects.toMatchObject({ status: 400, code: 'validation_error' })

    await expect(
      createHomebrewContent(
        monstersWriteConfig,
        campaign.id,
        {
          ...minimalHomebrewMonsterInput,
          slug: 'double-enhancement',
          equipment: [
            {
              entryId: 'sword',
              equipmentId: longswordId,
              quantity: 1,
              magical: true,
              magicProperties: [
                { kind: 'preset', propertyId: 'srd-cc-5.2.1:weapon-enhancement-1' },
                { kind: 'preset', propertyId: 'srd-cc-5.2.1:weapon-enhancement-2' },
              ],
            },
          ],
          actions: [],
          proficiencies: {
            savingThrows: [],
            skills: [],
            languages: [],
            weapons: [],
          },
        },
        { status: 'published' },
      ),
    ).rejects.toMatchObject({ status: 400, code: 'validation_error' })
  })

  it('allows draft saves with an unresolved skill and rejects publish', async () => {
    const campaign = await makeTestCampaign()
    const draft = await createHomebrewContent(
      monstersWriteConfig,
      campaign.id,
      {
        ...minimalHomebrewMonsterInput,
        slug: 'draft-unknown-skill',
        proficiencies: {
          savingThrows: [],
          skills: [{ skill: 'not-a-real-skill', rank: 'proficient' }],
          languages: [],
          weapons: [],
        },
      },
      { status: 'draft' },
    )
    expect(draft.proficiencies.skills[0]?.skill).toBe('not-a-real-skill')

    await expect(
      createHomebrewContent(
        monstersWriteConfig,
        campaign.id,
        {
          ...minimalHomebrewMonsterInput,
          slug: 'publish-unknown-skill',
          proficiencies: {
            savingThrows: [],
            skills: [{ skill: 'not-a-real-skill', rank: 'proficient' }],
            languages: [],
            weapons: [],
          },
        },
        { status: 'published' },
      ),
    ).rejects.toMatchObject({
      status: 400,
      code: 'validation_error',
    })

    await expect(
      promoteContentToPublished(monstersWriteConfig, campaign.id, draft.id),
    ).rejects.toMatchObject({ status: 400, code: 'validation_error' })
  })

  it('validates effectiveBody instead of merging existing and input', async () => {
    const campaign = await makeTestCampaign()
    await expect(
      monstersValidateBeforeWrite({
        campaignId: campaign.id,
        rulesetId: campaign.rulesetId,
        mode: 'update',
        validationIntent: 'draft',
        input: {
          equipment: [{ entryId: 'missing', equipmentId: 'missing-item', quantity: 1 }],
        },
        normalized: {},
        effectiveBody: {
          armorClass: { kind: 'unarmored' },
          equipment: [],
          actions: [],
          bonusActions: [],
          reactions: [],
        },
      }),
    ).resolves.toBeUndefined()
  })

  it('clears homebrew nulls and stores system-patch tombstones', async () => {
    const campaign = await makeTestCampaign()
    const created = await createHomebrewContent(monstersWriteConfig, campaign.id, {
      ...minimalHomebrewMonsterInput,
      slug: 'clear-me',
      hover: true,
      experiencePointsOverride: 0,
    })

    const cleared = await updateContentEntity(monstersWriteConfig, campaign.id, created.id, {
      hover: null,
      experiencePointsOverride: null,
      challengeRating: '1/8',
    })
    expect(cleared.hover).toBeUndefined()
    expect(cleared.experiencePointsOverride).toBeUndefined()

    const catalog = await resolveCatalogForCampaign(monstersWriteConfig.readConfig, campaign.id)
    const kobold = catalog.find((row) => row.slug === 'kobold-warrior' && row.source === 'system')
    expect(kobold).toBeDefined()
    if (!kobold) return

    await updateContentEntity(monstersWriteConfig, campaign.id, kobold.id, {
      challengeRating: '0',
      experiencePointsOverride: 0,
    })
    await updateContentEntity(monstersWriteConfig, campaign.id, kobold.id, {
      challengeRating: '1/8',
      experiencePointsOverride: null,
    })

    const stored = await MonsterPatchModel.findOne({
      campaignId: campaign.id,
      targetId: kobold.id,
    }).lean()
    expect(stored?.patch.experiencePointsOverride).toBeNull()

    const afterOmit = await updateContentEntity(monstersWriteConfig, campaign.id, kobold.id, {
      name: kobold.name,
    })
    expect(afterOmit.experiencePointsOverride).toBeUndefined()
    const stillTombstoned = await MonsterPatchModel.findOne({
      campaignId: campaign.id,
      targetId: kobold.id,
    }).lean()
    expect(stillTombstoned?.patch.experiencePointsOverride).toBeNull()

    const restored = await updateContentEntity(monstersWriteConfig, campaign.id, kobold.id, {
      challengeRating: '0',
      experiencePointsOverride: 0,
    })
    expect(restored.experiencePointsOverride).toBe(0)
  })

  it('publishes a weapon action that references unequipped equipment', async () => {
    const campaign = await makeTestCampaign()
    const created = await createHomebrewContent(
      monstersWriteConfig,
      campaign.id,
      {
        ...minimalHomebrewMonsterInput,
        slug: 'unequipped-weapon',
        equipment: [
          {
            entryId: 'dagger',
            equipmentId: 'srd-cc-5.2.1:dagger',
            quantity: 1,
            equipped: false,
          },
        ],
      },
      { status: 'draft' },
    )
    const published = await promoteContentToPublished(monstersWriteConfig, campaign.id, created.id)
    expect(published.status).toBe('published')
  })

  it('preserves untouched action rows on a system patch and a no-op resave', async () => {
    const campaign = await makeTestCampaign()
    const catalog = await resolveCatalogForCampaign(monstersWriteConfig.readConfig, campaign.id)
    const kobold = catalog.find((row) => row.slug === 'kobold-warrior' && row.source === 'system')
    expect(kobold).toBeDefined()
    if (!kobold) return

    const actions = kobold.actions.map((action, index) =>
      index === 0 ? { ...action, name: 'Renamed strike' } : action,
    )
    const patch = {
      senses: kobold.senses,
      equipment: kobold.equipment,
      traits: kobold.traits,
      actions,
      bonusActions: kobold.bonusActions,
      reactions: kobold.reactions,
    }
    const saved = await updateContentEntity(monstersWriteConfig, campaign.id, kobold.id, patch)
    expect(saved.actions[0]?.name).toBe('Renamed strike')
    expect(saved.actions.slice(1)).toEqual(kobold.actions.slice(1))
    expect(saved.bonusActions).toEqual(kobold.bonusActions)
    expect(saved.reactions).toEqual(kobold.reactions)

    const stored = await MonsterPatchModel.findOne({
      campaignId: campaign.id,
      targetId: kobold.id,
    }).lean()
    await updateContentEntity(monstersWriteConfig, campaign.id, kobold.id, patch)
    const again = await MonsterPatchModel.findOne({
      campaignId: campaign.id,
      targetId: kobold.id,
    }).lean()
    expect(again?.patch.actions).toEqual(stored?.patch.actions)
    expect(again?.patch.bonusActions).toEqual(stored?.patch.bonusActions)
    expect(again?.patch.reactions).toEqual(stored?.patch.reactions)
  })
})

describe('promotion smoke', () => {
  it('promotes a valid draft of species, spells, subclasses, organizations, and locations', async () => {
    const campaign = await makeTestCampaign()

    const species = await createHomebrewContent(
      speciesWriteConfig,
      campaign.id,
      {
        slug: 'promo-folk',
        name: 'Promo Folk',
        creatureType: 'humanoid',
        sizes: ['medium'],
        movement: { walk: 30 },
        traits: [],
      },
      { status: 'draft' },
    )
    expect(
      (await promoteContentToPublished(speciesWriteConfig, campaign.id, species.id)).status,
    ).toBe('published')

    const spell = await createHomebrewContent(
      spellWriteConfig,
      campaign.id,
      {
        slug: 'promo-bolt',
        name: 'Promo Bolt',
        school: 'evocation',
        level: 0,
        classIds: ['wizard'],
        castingTime: { normal: { value: 1, unit: 'action' }, canBeCastAsRitual: false },
        range: { kind: 'distance', value: { value: 60, unit: 'ft' } },
        duration: { kind: 'instantaneous' },
        components: { verbal: true, somatic: true },
        resolution: ELDRITCH_BLAST_RESOLUTION,
      },
      { status: 'draft' },
    )
    expect((await promoteContentToPublished(spellWriteConfig, campaign.id, spell.id)).status).toBe(
      'published',
    )

    const subclass = await createHomebrewContent(
      subclassWriteConfig,
      campaign.id,
      {
        slug: 'promo-subclass',
        name: 'Promo Subclass',
        classId: FIGHTER_CLASS_ID,
        tagline: 'A test subclass',
        features: [{ kind: 'custom', id: 'feature-1', name: 'Test Feature', level: 3 }],
      },
      { status: 'draft' },
    )
    expect(
      (await promoteContentToPublished(subclassWriteConfig, campaign.id, subclass.id)).status,
    ).toBe('published')

    const organization = await createHomebrewContent(
      organizationWriteConfig,
      campaign.id,
      { slug: 'promo-order', name: 'Promo Order', organizationDomain: 'military' },
      { status: 'draft' },
    )
    expect(
      (await promoteContentToPublished(organizationWriteConfig, campaign.id, organization.id))
        .status,
    ).toBe('published')

    const location = await createHomebrewContent(
      locationWriteConfig,
      campaign.id,
      { slug: 'promo-world', kind: 'world', name: 'Promo World' },
      { status: 'draft' },
    )
    expect(
      (await promoteContentToPublished(locationWriteConfig, campaign.id, location.id)).status,
    ).toBe('published')
  })
})
