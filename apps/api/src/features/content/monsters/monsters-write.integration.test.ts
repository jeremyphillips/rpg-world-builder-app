import { describe, expect, it } from 'vitest'
import {
  FORM_RESTRICTION_EMPTY_MESSAGE,
  FORM_RESTRICTION_REQUIRES_FORMS_MESSAGE,
  isApiValidationDetails,
} from '@rpg/contracts'

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
import { loadSeedMonsters } from '@rpg/catalog/monsters'
import { MonsterPatchModel } from './monster-patch.model'
import { monstersWriteConfig } from './monsters.config'
import { monstersValidateBeforeWrite } from './monsters-write-hooks'

useIntegrationDb()

const FIGHTER_CLASS_ID = 'srd-cc-5.2.1:fighter'

describe('monster write validation', () => {
  it('rejects a draft that owns two body armors', async () => {
    const campaign = await makeTestCampaign()
    const chainId = 'srd-cc-5.2.1:chain-shirt'
    const leatherId = 'srd-cc-5.2.1:leather-armor'
    try {
      await createHomebrewContent(
        monstersWriteConfig,
        campaign.id,
        {
          ...minimalHomebrewMonsterInput,
          slug: 'two-armors',
          armorClass: { naturalArmorBonus: 1 },
          equipment: [
            { entryId: 'leather', equipmentId: leatherId, quantity: 1, equipped: true },
            { entryId: 'chain', equipmentId: chainId, quantity: 1, equipped: false },
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
      throw new Error('expected draft write to fail')
    } catch (error) {
      expect(error).toBeInstanceOf(HttpError)
      const httpError = error as HttpError
      expect(httpError.status).toBe(400)
      expect(httpError.code).toBe('validation_error')
      expect(isApiValidationDetails(httpError.details)).toBe(true)
      if (!isApiValidationDetails(httpError.details)) return
      expect(httpError.details.issues).toEqual([
        expect.objectContaining({ path: 'equipment.1', code: expect.any(String) }),
      ])
    }
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
        reactions: [],
        actions: [{ id: 'parry', kind: 'weapon', equipmentEntryId: 'chain' }],
        path: 'actions.0.equipmentEntryId',
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
        armorClass: { naturalArmorBonus: 1 },
        equipment: [
          { entryId: 'leather', equipmentId: leatherId, quantity: 1, equipped: true },
          { entryId: 'chain', equipmentId: chainId, quantity: 1, equipped: true },
        ],
        actions: [],
        path: 'equipment.1',
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
          armorClass: {},
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
    const kobold = catalog.find(
      (row) => row.slug === 'kobold-warrior' && row.catalogLayer === 'system',
    )
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
    expect(stored?.patch.experiencePointsOverride).toBeUndefined()

    const afterOmit = await updateContentEntity(monstersWriteConfig, campaign.id, kobold.id, {
      name: kobold.name,
    })
    expect(afterOmit.experiencePointsOverride).toBeUndefined()
    const stillTombstoned = await MonsterPatchModel.findOne({
      campaignId: campaign.id,
      targetId: kobold.id,
    }).lean()
    expect(stillTombstoned?.patch.experiencePointsOverride).toBeUndefined()

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
    const kobold = catalog.find(
      (row) => row.slug === 'kobold-warrior' && row.catalogLayer === 'system',
    )
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

const monsterAuthoringForms = {
  profileFormId: 'profile',
  trueForm: { kind: 'defined' as const, formId: 'humanoid' },
  definedForms: [
    { id: 'humanoid', name: 'Humanoid' },
    { id: 'bear', name: 'Bear', overrides: { sizes: ['large'] } },
  ],
}

const monsterRestrictionBite = {
  id: 'bite',
  kind: 'natural-weapon' as const,
  name: 'Bite',
  mode: 'melee' as const,
  reach: 5,
  damage: { dice: { count: 1, faces: 6 } },
  damageType: 'piercing' as const,
}

describe('monster forms write validation', () => {
  it('rejects publish with an empty form restriction list', async () => {
    const campaign = await makeTestCampaign()
    const draft = await createHomebrewContent(
      monstersWriteConfig,
      campaign.id,
      {
        ...minimalHomebrewMonsterInput,
        slug: 'empty-restriction',
        forms: monsterAuthoringForms,
        actions: [{ ...monsterRestrictionBite, onlyInFormIds: [] }],
        equipment: [],
        proficiencies: {
          savingThrows: [],
          skills: [],
          languages: [],
          weapons: [],
        },
      },
      { status: 'draft' },
    )
    await expect(
      promoteContentToPublished(monstersWriteConfig, campaign.id, draft.id),
    ).rejects.toMatchObject({
      status: 400,
      code: 'validation_error',
      details: {
        issues: expect.arrayContaining([
          expect.objectContaining({
            path: 'actions.0.onlyInFormIds',
            message: FORM_RESTRICTION_EMPTY_MESSAGE,
          }),
        ]),
      },
    })
  })

  it('rejects publish when shape-shift is present without forms', async () => {
    const campaign = await makeTestCampaign()
    const draft = await createHomebrewContent(
      monstersWriteConfig,
      campaign.id,
      {
        ...minimalHomebrewMonsterInput,
        slug: 'shift-without-forms',
        actions: [
          { id: 'shift', kind: 'shape-shift', name: 'Shape-Shift', equipment: 'unchanged' },
        ],
        equipment: [],
        proficiencies: {
          savingThrows: [],
          skills: [],
          languages: [],
          weapons: [],
        },
      },
      { status: 'draft' },
    )
    await expect(
      promoteContentToPublished(monstersWriteConfig, campaign.id, draft.id),
    ).rejects.toMatchObject({
      status: 400,
      code: 'validation_error',
      details: {
        issues: expect.arrayContaining([
          expect.objectContaining({
            path: 'actions.0.kind',
            message: 'Add forms before adding Shape-Shift.',
          }),
        ]),
      },
    })
  })

  it('rejects publish when restricting actions without a forms block', async () => {
    const campaign = await makeTestCampaign()
    const draft = await createHomebrewContent(
      monstersWriteConfig,
      campaign.id,
      {
        ...minimalHomebrewMonsterInput,
        slug: 'restriction-without-forms',
        actions: [{ ...monsterRestrictionBite, onlyInFormIds: ['bear'] }],
        equipment: [],
        proficiencies: {
          savingThrows: [],
          skills: [],
          languages: [],
          weapons: [],
        },
      },
      { status: 'draft' },
    )
    await expect(
      promoteContentToPublished(monstersWriteConfig, campaign.id, draft.id),
    ).rejects.toMatchObject({
      status: 400,
      code: 'validation_error',
      details: {
        issues: expect.arrayContaining([
          expect.objectContaining({
            path: 'actions.0.onlyInFormIds',
            message: FORM_RESTRICTION_REQUIRES_FORMS_MESSAGE,
          }),
        ]),
      },
    })
  })

  it('round-trips form restrictions and shape-shift on publish', async () => {
    const campaign = await makeTestCampaign()
    const created = await createHomebrewContent(
      monstersWriteConfig,
      campaign.id,
      {
        ...minimalHomebrewMonsterInput,
        slug: 'forms-restrictions-shift',
        forms: monsterAuthoringForms,
        equipment: [],
        proficiencies: {
          savingThrows: [],
          skills: [],
          languages: [],
          weapons: [],
        },
        actions: [
          { id: 'shift', kind: 'shape-shift', name: 'Shape-Shift', equipment: 'unchanged' },
          { ...monsterRestrictionBite, onlyInFormIds: ['bear'] },
        ],
      },
      { status: 'published' },
    )
    expect(created.actions?.[1]).toMatchObject({
      id: 'bite',
      onlyInFormIds: ['bear'],
    })
    expect(created.actions?.[0]).toMatchObject({ kind: 'shape-shift', name: 'Shape-Shift' })
  })
})

describe('monster classification persistence', () => {
  it('persists, reads, and explicitly clears family and class classifications', async () => {
    const campaign = await makeTestCampaign()
    const created = await createHomebrewContent(monstersWriteConfig, campaign.id, {
      ...minimalHomebrewMonsterInput,
      slug: 'classified-monster',
      creatureType: 'monstrosity',
      creatureFamilyIds: ['titan', 'lycanthrope'],
      classIds: ['srd-cc-5.2.1:wizard'],
    })
    expect(created).toMatchObject({
      creatureFamilyIds: ['titan', 'lycanthrope'],
      classIds: ['srd-cc-5.2.1:wizard'],
    })
    const catalog = await resolveCatalogForCampaign(monstersWriteConfig.readConfig, campaign.id)
    expect(catalog.find((row) => row.id === created.id)).toMatchObject({
      creatureFamilyIds: ['titan', 'lycanthrope'],
      classIds: ['srd-cc-5.2.1:wizard'],
    })
    const cleared = await updateContentEntity(monstersWriteConfig, campaign.id, created.id, {
      creatureFamilyIds: null,
      classIds: null,
    })
    expect(cleared.creatureFamilyIds).toBeUndefined()
    expect(cleared.classIds).toBeUndefined()
  })
  it('clears a seeded class classification with a system patch tombstone', async () => {
    const campaign = await makeTestCampaign()
    const id = 'srd-cc-5.2.1:mage'
    await updateContentEntity(monstersWriteConfig, campaign.id, id, { classIds: null })
    const catalog = await resolveCatalogForCampaign(monstersWriteConfig.readConfig, campaign.id)
    expect(catalog.find((row) => row.id === id)?.classIds).toBeUndefined()
  })

  it('round-trips defined forms', async () => {
    const campaign = await makeTestCampaign()
    const created = await createHomebrewContent(monstersWriteConfig, campaign.id, {
      ...minimalHomebrewMonsterInput,
      slug: 'forms-round-trip',
      forms: {
        profileFormId: 'profile',
        trueForm: { kind: 'defined', formId: 'humanoid' },
        definedForms: [
          { id: 'humanoid', name: 'Humanoid' },
          { id: 'bear', name: 'Bear', overrides: { sizes: ['large'] } },
        ],
      },
    })
    expect(created.forms?.trueForm).toEqual({ kind: 'defined', formId: 'humanoid' })
    expect(created.forms?.definedForms[1]?.overrides?.sizes).toEqual(['large'])
  })

  it('rejects an incompatible family at its field path on publish', async () => {
    const campaign = await makeTestCampaign()
    await expect(
      createHomebrewContent(monstersWriteConfig, campaign.id, {
        ...minimalHomebrewMonsterInput,
        slug: 'bad-classification',
        creatureType: 'dragon',
        creatureFamilyIds: ['titan'],
      }),
    ).rejects.toMatchObject({
      status: 400,
      details: {
        issues: expect.arrayContaining([expect.objectContaining({ path: 'creatureFamilyIds.0' })]),
      },
    })
  })
})

describe('monster system patch seed rows', () => {
  const swarmId = 'srd-cc-5.2.1:swarm-of-insects'

  function swarmSeed() {
    const swarm = loadSeedMonsters('srd-cc-5.2.1').find((row) => row.id === swarmId)
    expect(swarm).toBeDefined()
    return swarm!
  }

  it('keeps seeded traits when a movement-only save does not send traits', async () => {
    const campaign = await makeTestCampaign()
    const seed = swarmSeed()
    const saved = await updateContentEntity(monstersWriteConfig, campaign.id, swarmId, {
      movement: { walk: 30 },
    })
    expect(saved.traits.map((trait) => trait.id)).toEqual(['swarm', 'spider-climb'])
    expect(saved.actions).toEqual([])
    const stored = await MonsterPatchModel.findOne({
      campaignId: campaign.id,
      targetId: swarmId,
    }).lean()
    expect(stored?.patch.traits).toBeUndefined()
    expect(stored?.patch.movement).toEqual({ walk: 30 })

    const restored = await updateContentEntity(monstersWriteConfig, campaign.id, swarmId, {
      movement: seed.movement,
    })
    expect(restored.movement).toEqual(seed.movement)
    const cleared = await MonsterPatchModel.findOne({
      campaignId: campaign.id,
      targetId: swarmId,
    }).lean()
    expect(cleared?.patch.movement).toBeUndefined()
    expect(cleared?.patch.traits).toBeUndefined()
  })

  it('keeps an omitted homebrew trait and drops it on an explicit empty replacement', async () => {
    const campaign = await makeTestCampaign()
    const seed = swarmSeed()
    const homebrew = {
      id: 'homebrew-stinger',
      kind: 'custom' as const,
      name: 'Stinger',
      description: 'The swarm stings.',
    }
    const withHomebrew = await updateContentEntity(monstersWriteConfig, campaign.id, swarmId, {
      traits: [...seed.traits, homebrew],
    })
    expect(withHomebrew.traits.map((trait) => trait.id)).toEqual([
      'swarm',
      'spider-climb',
      'stinger',
    ])

    const movementOnly = await updateContentEntity(monstersWriteConfig, campaign.id, swarmId, {
      movement: { walk: 25 },
    })
    expect(movementOnly.traits.map((trait) => trait.id)).toEqual([
      'swarm',
      'spider-climb',
      'stinger',
    ])

    const cleared = await updateContentEntity(monstersWriteConfig, campaign.id, swarmId, {
      traits: [],
    })
    expect(cleared.traits.map((trait) => trait.id)).toEqual(['swarm', 'spider-climb'])
    const stored = await MonsterPatchModel.findOne({
      campaignId: campaign.id,
      targetId: swarmId,
    }).lean()
    expect(stored?.patch.traits).toBeUndefined()
    expect(stored?.patch.movement).toEqual({ walk: 25 })
  })

  it('pins the whole traits array when one seed row is edited, then drops it when restored', async () => {
    const campaign = await makeTestCampaign()
    const seed = swarmSeed()
    const edited = seed.traits.map((trait) =>
      trait.id === 'swarm' && trait.preset === 'swarm' ? { ...trait, noun: 'beetle' } : trait,
    )
    const saved = await updateContentEntity(monstersWriteConfig, campaign.id, swarmId, {
      traits: edited,
    })
    expect(saved.traits.find((trait) => trait.id === 'swarm')).toMatchObject({ noun: 'beetle' })
    expect(saved.traits.map((trait) => trait.id)).toEqual(['swarm', 'spider-climb'])
    const stored = await MonsterPatchModel.findOne({
      campaignId: campaign.id,
      targetId: swarmId,
    }).lean()
    const patchedTraits = stored?.patch.traits as { id: string; noun?: string }[]
    expect(patchedTraits.map((trait) => trait.id)).toEqual(['swarm', 'spider-climb'])
    expect(patchedTraits[0]).toMatchObject({ noun: 'beetle' })
    expect(patchedTraits[1]).toMatchObject({ id: 'spider-climb', preset: 'spider-climb' })

    await updateContentEntity(monstersWriteConfig, campaign.id, swarmId, { traits: seed.traits })
    const restored = await MonsterPatchModel.findOne({
      campaignId: campaign.id,
      targetId: swarmId,
    }).lean()
    expect(restored?.patch.traits).toBeUndefined()
  })

  it('resolves a poisoned traits patch without writing, then a save removes the override', async () => {
    const campaign = await makeTestCampaign()
    await MonsterPatchModel.create({
      campaignId: campaign.id,
      targetId: swarmId,
      patch: { traits: [] },
    })
    const catalog = await resolveCatalogForCampaign(monstersWriteConfig.readConfig, campaign.id)
    expect(catalog.find((row) => row.id === swarmId)?.traits.map((trait) => trait.id)).toEqual([
      'swarm',
      'spider-climb',
    ])
    const untouched = await MonsterPatchModel.findOne({
      campaignId: campaign.id,
      targetId: swarmId,
    }).lean()
    expect(untouched?.patch.traits).toEqual([])

    await updateContentEntity(monstersWriteConfig, campaign.id, swarmId, { traits: [] })
    const cleaned = await MonsterPatchModel.findOne({
      campaignId: campaign.id,
      targetId: swarmId,
    }).lean()
    expect(cleaned?.patch.traits).toBeUndefined()
    const reread = await resolveCatalogForCampaign(monstersWriteConfig.readConfig, campaign.id)
    expect(reread.find((row) => row.id === swarmId)?.traits.map((trait) => trait.id)).toEqual([
      'swarm',
      'spider-climb',
    ])
  })

  it('keeps a cleared seeded movement alternative across an unrelated save', async () => {
    const campaign = await makeTestCampaign()
    const seed = swarmSeed()
    const cleared = await updateContentEntity(monstersWriteConfig, campaign.id, swarmId, {
      movementAlternative: null,
    })
    expect(cleared.movementAlternative).toBeUndefined()
    const stored = await MonsterPatchModel.findOne({
      campaignId: campaign.id,
      targetId: swarmId,
    }).lean()
    expect(stored?.patch.movementAlternative).toBeNull()

    await updateContentEntity(monstersWriteConfig, campaign.id, swarmId, {
      movement: { walk: 30 },
    })
    const kept = await MonsterPatchModel.findOne({
      campaignId: campaign.id,
      targetId: swarmId,
    }).lean()
    expect(kept?.patch.movementAlternative).toBeNull()
    const catalog = await resolveCatalogForCampaign(monstersWriteConfig.readConfig, campaign.id)
    expect(catalog.find((row) => row.id === swarmId)?.movementAlternative).toBeUndefined()

    const restored = await updateContentEntity(monstersWriteConfig, campaign.id, swarmId, {
      movementAlternative: seed.movementAlternative,
    })
    expect(restored.movementAlternative).toEqual(seed.movementAlternative)
    const after = await MonsterPatchModel.findOne({
      campaignId: campaign.id,
      targetId: swarmId,
    }).lean()
    expect(after?.patch.movementAlternative).toBeUndefined()
  })
})
