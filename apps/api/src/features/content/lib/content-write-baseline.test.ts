import { describe, expect, it } from 'vitest'

import { ELDRITCH_BLAST_RESOLUTION, isArmorEquipment } from '@rpg/contracts'

import { makeTestCampaign } from '../../../test/fixtures/campaigns'
import { useIntegrationDb } from '../../../test/setup/integration-db'
import { classWriteConfig } from '../classes/classes.config'
import { equipmentWriteConfig } from '../equipment/equipment.config'
import { featWriteConfig } from '../feats/feats.config'
import { resolveCatalogForCampaign } from '../content.service'
import { skillProficiencyWriteConfig } from '../skill-proficiencies/skill-proficiencies.config'
import { speciesWriteConfig } from '../species/species.config'
import { spellWriteConfig } from '../spells/spells.config'
import { monstersWriteConfig } from '../monsters/monsters.config'
import { subclassWriteConfig } from '../subclasses/subclasses.config'
import { resolveSubclassesForCampaign } from '../subclasses/list-subclasses'
import { minimalHomebrewMonsterInput } from '../../../test/fixtures/monsters'
import { expectHttpErrorAsync } from '../../../test/expect-http-error'
import { overlayNameOnlyUpdate } from '../../../test/helpers/system-overlay-write'
import { contentEntityBody } from './resolve-system-overlay.lib'
import { createHomebrewContent, updateContentEntity } from './content-write.service'
import { FeatPatchModel } from '../feats/feat-patch.model'
import type { ContentWriteConfig, WriteEntityBase } from './content-write-config'
import type { SystemOverlayParticipantId } from '@rpg/contracts'

useIntegrationDb()

type BaselineEntity = WriteEntityBase & { name: string }

type BaselineCase = {
  label: string
  config: ContentWriteConfig<BaselineEntity>
  createInput: Record<string, unknown>
  homebrewUpdate: Record<string, unknown>
  expectedHomebrewName: string
  systemTargetSlug: string
  overlayParticipantId: SystemOverlayParticipantId
  expectedPatchedSystemName: string
}

const baselineCases: BaselineCase[] = [
  {
    label: 'classes',
    config: classWriteConfig as ContentWriteConfig<BaselineEntity>,
    createInput: {
      slug: 'baseline-class',
      name: 'Baseline Class',
      primaryAbilities: ['str'],
      hitDie: 10,
      proficiencies: {
        savingThrows: ['str', 'con'],
        armor: { categories: [], items: [] },
        weapons: { categories: ['simple'], items: [] },
        skills: { categories: [], items: [] },
      },
      features: [{ name: 'Baseline Feature', level: 1 }],
    },
    homebrewUpdate: { name: 'Updated Baseline Class' },
    expectedHomebrewName: 'Updated Baseline Class',
    systemTargetSlug: 'fighter',
    overlayParticipantId: 'classes',
    expectedPatchedSystemName: 'Patched Fighter',
  },
  {
    label: 'equipment',
    config: equipmentWriteConfig as ContentWriteConfig<BaselineEntity>,
    createInput: {
      kind: 'armor',
      slug: 'baseline-armor',
      name: 'Baseline Armor',
      category: 'light',
      cost: { amount: 10, currency: 'gp' },
      baseAcOffset: 1,
      stealthDisadvantage: false,
    },
    homebrewUpdate: { kind: 'armor', name: 'Updated Baseline Armor' },
    expectedHomebrewName: 'Updated Baseline Armor',
    systemTargetSlug: 'leather-armor',
    overlayParticipantId: 'equipment',
    expectedPatchedSystemName: 'Patched Leather Armor',
  },
  {
    label: 'spells',
    config: spellWriteConfig as ContentWriteConfig<BaselineEntity>,
    createInput: {
      slug: 'baseline-bolt',
      name: 'Baseline Bolt',
      school: 'evocation',
      level: 0,
      classIds: ['wizard'],
      castingTime: { normal: { value: 1, unit: 'action' }, canBeCastAsRitual: false },
      range: { kind: 'distance', value: { value: 60, unit: 'ft' } },
      duration: { kind: 'instantaneous' },
      components: { verbal: true, somatic: true },
      resolution: ELDRITCH_BLAST_RESOLUTION,
    },
    homebrewUpdate: { name: 'Updated Baseline Bolt' },
    expectedHomebrewName: 'Updated Baseline Bolt',
    systemTargetSlug: 'fire-bolt',
    overlayParticipantId: 'spells',
    expectedPatchedSystemName: 'Patched Fire Bolt',
  },
  {
    label: 'feats',
    config: featWriteConfig as ContentWriteConfig<BaselineEntity>,
    createInput: {
      slug: 'baseline-feat',
      name: 'Baseline Feat',
      category: 'origin',
      repeatable: { allowed: false },
    },
    homebrewUpdate: { name: 'Updated Baseline Feat' },
    expectedHomebrewName: 'Updated Baseline Feat',
    systemTargetSlug: 'alert',
    overlayParticipantId: 'feats',
    expectedPatchedSystemName: 'Patched Alert',
  },
  {
    label: 'species',
    config: speciesWriteConfig as ContentWriteConfig<BaselineEntity>,
    createInput: {
      slug: 'baseline-folk',
      name: 'Baseline Folk',
      creatureType: 'humanoid',
      sizes: ['medium'],
      movement: { walk: 30 },
      traits: [],
    },
    homebrewUpdate: { name: 'Updated Baseline Folk' },
    expectedHomebrewName: 'Updated Baseline Folk',
    systemTargetSlug: 'human',
    overlayParticipantId: 'species',
    expectedPatchedSystemName: 'Patched Human',
  },
  {
    label: 'skill-proficiencies',
    config: skillProficiencyWriteConfig as ContentWriteConfig<BaselineEntity>,
    createInput: {
      slug: 'baseline-skill',
      name: 'Baseline Skill',
      ability: 'dex',
      examples: ['Perform a baseline check'],
    },
    homebrewUpdate: { name: 'Updated Baseline Skill' },
    expectedHomebrewName: 'Updated Baseline Skill',
    systemTargetSlug: 'athletics',
    overlayParticipantId: 'skill-proficiencies',
    expectedPatchedSystemName: 'Patched Athletics',
  },
  {
    label: 'monsters',
    config: monstersWriteConfig as ContentWriteConfig<BaselineEntity>,
    createInput: {
      ...minimalHomebrewMonsterInput,
      slug: 'baseline-monster',
      name: 'Baseline Monster',
    },
    homebrewUpdate: { name: 'Updated Baseline Monster' },
    expectedHomebrewName: 'Updated Baseline Monster',
    systemTargetSlug: 'kobold-warrior',
    overlayParticipantId: 'monsters',
    expectedPatchedSystemName: 'Patched Kobold Warrior',
  },
]

const FIGHTER_CLASS_ID = 'srd-cc-5.2.1:fighter'

describe.each(baselineCases)('content write baseline — $label', (baselineCase) => {
  it('creates homebrew, updates homebrew, patches system, and round-trips via catalog', async () => {
    const campaign = await makeTestCampaign()

    const created = await createHomebrewContent(
      baselineCase.config,
      campaign.id,
      baselineCase.createInput,
    )
    expect(created.catalogLayer).toBe('homebrew')
    expect(created.campaignId).toBe(campaign.id)
    expect(created.status).toBe('published')

    const updatedHomebrew = await updateContentEntity(
      baselineCase.config,
      campaign.id,
      created.id,
      baselineCase.homebrewUpdate,
    )
    expect(updatedHomebrew.catalogLayer).toBe('homebrew')
    expect(updatedHomebrew.name).toBe(baselineCase.expectedHomebrewName)

    const catalogAfterHomebrew = await resolveCatalogForCampaign(
      baselineCase.config.readConfig,
      campaign.id,
    )
    expect(catalogAfterHomebrew.some((record) => record.id === created.id)).toBe(true)
    expect(catalogAfterHomebrew.find((record) => record.id === created.id)?.name).toBe(
      baselineCase.expectedHomebrewName,
    )

    const systemRecord = catalogAfterHomebrew.find(
      (record) => record.slug === baselineCase.systemTargetSlug && record.catalogLayer === 'system',
    )
    expect(systemRecord).toBeDefined()
    if (!systemRecord) throw new Error(`expected system seed ${baselineCase.systemTargetSlug}`)
    expect(systemRecord.status).toBe('published')

    const catalogSeed = contentEntityBody(systemRecord as unknown as Record<string, unknown>)
    const patchedSystem = await updateContentEntity(
      baselineCase.config,
      campaign.id,
      systemRecord.id,
      overlayNameOnlyUpdate({
        participantId: baselineCase.overlayParticipantId,
        catalogSeed,
        baseline: catalogSeed,
        name: baselineCase.expectedPatchedSystemName,
      }),
    )
    expect(patchedSystem.catalogLayer).toBe('system')
    expect(patchedSystem.name).toBe(baselineCase.expectedPatchedSystemName)
    expect(patchedSystem.status).toBe('published')

    const catalogAfterPatch = await resolveCatalogForCampaign(
      baselineCase.config.readConfig,
      campaign.id,
    )
    const reread = catalogAfterPatch.find((record) => record.id === systemRecord.id)
    expect(reread?.name).toBe(baselineCase.expectedPatchedSystemName)
    expect(contentEntityBody(reread as unknown as Record<string, unknown>)).toEqual(
      contentEntityBody(patchedSystem as unknown as Record<string, unknown>),
    )
  })
})

describe('content write baseline — draft status', () => {
  it('creates homebrew with explicit draft status', async () => {
    const campaign = await makeTestCampaign()
    const created = await createHomebrewContent(
      classWriteConfig,
      campaign.id,
      baselineCases.find((entry) => entry.label === 'classes')!.createInput,
      { status: 'draft' },
    )
    expect(created.status).toBe('draft')
  })

  it('creates an incomplete skill proficiency draft and round-trips via catalog', async () => {
    const campaign = await makeTestCampaign()
    const created = await createHomebrewContent(
      skillProficiencyWriteConfig,
      campaign.id,
      { slug: 'draft-skill', name: '' },
      { status: 'draft' },
    )

    expect(created.status).toBe('draft')
    expect(created.name).toBe('Untitled Skill Proficiency')

    const catalog = await resolveCatalogForCampaign(
      skillProficiencyWriteConfig.readConfig,
      campaign.id,
    )
    expect(catalog.find((record) => record.id === created.id)?.name).toBe(
      'Untitled Skill Proficiency',
    )
  })

  it('creates an incomplete feat draft and round-trips via catalog', async () => {
    const campaign = await makeTestCampaign()
    const created = await createHomebrewContent(
      featWriteConfig,
      campaign.id,
      { slug: 'draft-feat', name: '', repeatable: { allowed: false } },
      { status: 'draft' },
    )

    expect(created.status).toBe('draft')
    expect(created.name).toBe('Untitled Feat')

    const catalog = await resolveCatalogForCampaign(featWriteConfig.readConfig, campaign.id)
    expect(catalog.find((record) => record.id === created.id)?.name).toBe('Untitled Feat')
  })

  it('creates an incomplete armor draft and round-trips via catalog', async () => {
    const campaign = await makeTestCampaign()
    const created = await createHomebrewContent(
      equipmentWriteConfig,
      campaign.id,
      { slug: 'draft-armor', kind: 'armor', name: '' },
      { status: 'draft' },
    )

    expect(created.status).toBe('draft')
    expect(created.name).toBe('Untitled Equipment')
    expect(created.kind).toBe('armor')

    const catalog = await resolveCatalogForCampaign(equipmentWriteConfig.readConfig, campaign.id)
    expect(catalog.find((record) => record.id === created.id)?.name).toBe('Untitled Equipment')
  })

  it('creates an incomplete species draft and round-trips via catalog', async () => {
    const campaign = await makeTestCampaign()
    const created = await createHomebrewContent(
      speciesWriteConfig,
      campaign.id,
      { slug: 'draft-species', name: '', creatureType: 'humanoid' },
      { status: 'draft' },
    )

    expect(created.status).toBe('draft')
    expect(created.name).toBe('Untitled Species')
    expect(created.creatureType).toBe('humanoid')

    const catalog = await resolveCatalogForCampaign(speciesWriteConfig.readConfig, campaign.id)
    expect(catalog.find((record) => record.id === created.id)?.name).toBe('Untitled Species')
  })

  it('creates an incomplete class draft and round-trips via catalog', async () => {
    const campaign = await makeTestCampaign()
    const created = await createHomebrewContent(
      classWriteConfig,
      campaign.id,
      { slug: 'draft-class', name: '', hitDie: 8 },
      { status: 'draft' },
    )

    expect(created.status).toBe('draft')
    expect(created.name).toBe('Untitled Class')
    expect(created.hitDie).toBe(8)

    const catalog = await resolveCatalogForCampaign(classWriteConfig.readConfig, campaign.id)
    expect(catalog.find((record) => record.id === created.id)?.name).toBe('Untitled Class')
  })

  it('creates an incomplete spell draft and round-trips via catalog', async () => {
    const campaign = await makeTestCampaign()
    const created = await createHomebrewContent(
      spellWriteConfig,
      campaign.id,
      { slug: 'draft-spell', name: '', school: 'evocation' },
      { status: 'draft' },
    )

    expect(created.status).toBe('draft')
    expect(created.name).toBe('Untitled Spell')
    expect(created.school).toBe('evocation')

    const catalog = await resolveCatalogForCampaign(spellWriteConfig.readConfig, campaign.id)
    expect(catalog.find((record) => record.id === created.id)?.name).toBe('Untitled Spell')
  })
})

describe('content write baseline — overlay revision', () => {
  it('increments overlay revision and rejects stale expected revision', async () => {
    const campaign = await makeTestCampaign()
    const catalog = await resolveCatalogForCampaign(featWriteConfig.readConfig, campaign.id)
    const systemRecord = catalog.find(
      (record) => record.slug === 'alert' && record.catalogLayer === 'system',
    )
    expect(systemRecord).toBeDefined()
    if (!systemRecord) throw new Error('expected alert feat')

    const catalogSeed = contentEntityBody(systemRecord as unknown as Record<string, unknown>)
    await updateContentEntity(
      featWriteConfig,
      campaign.id,
      systemRecord.id,
      overlayNameOnlyUpdate({
        participantId: 'feats',
        catalogSeed,
        baseline: catalogSeed,
        name: 'Revision One',
        expectedOverlayRevision: 0,
      }),
    )

    const patchAfterFirst = await FeatPatchModel.findOne({
      campaignId: campaign.id,
      targetId: systemRecord.id,
    }).lean<{ patch: { revision: number } }>()
    expect(patchAfterFirst?.patch.revision).toBe(1)

    await updateContentEntity(
      featWriteConfig,
      campaign.id,
      systemRecord.id,
      overlayNameOnlyUpdate({
        participantId: 'feats',
        catalogSeed: { ...catalogSeed, name: 'Revision One' },
        baseline: { ...catalogSeed, name: 'Revision One' },
        name: 'Revision Two',
        expectedOverlayRevision: 1,
      }),
    )

    const patchAfterSecond = await FeatPatchModel.findOne({
      campaignId: campaign.id,
      targetId: systemRecord.id,
    }).lean<{ patch: { revision: number } }>()
    expect(patchAfterSecond?.patch.revision).toBe(2)

    await expectHttpErrorAsync(
      () =>
        updateContentEntity(
          featWriteConfig,
          campaign.id,
          systemRecord.id,
          overlayNameOnlyUpdate({
            participantId: 'feats',
            catalogSeed: { ...catalogSeed, name: 'Revision Two' },
            baseline: { ...catalogSeed, name: 'Revision Two' },
            name: 'Stale Revision',
            expectedOverlayRevision: 1,
          }),
        ),
      { status: 409, code: 'stale_revision' },
    )
  })
})

describe('content write baseline — subclasses', () => {
  it('creates homebrew, updates homebrew, patches system, and round-trips via catalog', async () => {
    const campaign = await makeTestCampaign()

    const created = await createHomebrewContent(subclassWriteConfig, campaign.id, {
      slug: 'baseline-subclass',
      name: 'Baseline Subclass',
      classId: FIGHTER_CLASS_ID,
      tagline: 'Baseline tagline',
      features: [{ kind: 'custom', id: 'baseline-f1', name: 'Baseline Feature', level: 3 }],
    })
    expect(created.catalogLayer).toBe('homebrew')
    expect(created.classId).toBe(FIGHTER_CLASS_ID)

    const updatedHomebrew = await updateContentEntity(
      subclassWriteConfig,
      campaign.id,
      created.id,
      {
        name: 'Updated Baseline Subclass',
      },
    )
    expect(updatedHomebrew.name).toBe('Updated Baseline Subclass')

    const catalogAfterHomebrew = await resolveSubclassesForCampaign(campaign.id, FIGHTER_CLASS_ID)
    expect(catalogAfterHomebrew.some((record) => record.id === created.id)).toBe(true)

    const systemRecord = catalogAfterHomebrew.find(
      (record) => record.slug === 'champion' && record.catalogLayer === 'system',
    )
    expect(systemRecord).toBeDefined()
    if (!systemRecord) throw new Error('expected champion subclass')

    const catalogSeed = contentEntityBody(systemRecord as unknown as Record<string, unknown>)
    const patchedSystem = await updateContentEntity(
      subclassWriteConfig,
      campaign.id,
      systemRecord.id,
      overlayNameOnlyUpdate({
        participantId: 'subclasses',
        catalogSeed,
        baseline: catalogSeed,
        name: 'Patched Champion',
      }),
    )
    expect(patchedSystem.name).toBe('Patched Champion')

    const catalogAfterPatch = await resolveSubclassesForCampaign(campaign.id, FIGHTER_CLASS_ID)
    const reread = catalogAfterPatch.find((record) => record.id === systemRecord.id)
    expect(reread?.name).toBe('Patched Champion')
    expect(contentEntityBody(reread as unknown as Record<string, unknown>)).toEqual(
      contentEntityBody(patchedSystem as unknown as Record<string, unknown>),
    )
  })
})

describe('content write baseline — equipment kind guard', () => {
  it('requires armor kind on homebrew armor updates', async () => {
    const campaign = await makeTestCampaign()
    const created = await createHomebrewContent(
      equipmentWriteConfig,
      campaign.id,
      baselineCases.find((entry) => entry.label === 'equipment')!.createInput,
    )

    const updated = await updateContentEntity(equipmentWriteConfig, campaign.id, created.id, {
      kind: 'armor',
      name: 'Kind-checked Armor',
    })

    if (!isArmorEquipment(updated)) throw new Error('expected armor')
    expect(updated.name).toBe('Kind-checked Armor')
  })
})
