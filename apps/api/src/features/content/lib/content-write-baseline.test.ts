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
import { createHomebrewContent, updateContentEntity } from './content-write.service'
import type { ContentWriteConfig, WriteEntityBase } from './content-write-config'

useIntegrationDb()

type BaselineEntity = WriteEntityBase & { name: string }

type BaselineCase = {
  label: string
  config: ContentWriteConfig<BaselineEntity>
  createInput: Record<string, unknown>
  homebrewUpdate: Record<string, unknown>
  expectedHomebrewName: string
  systemTargetSlug: string
  systemPatch: Record<string, unknown>
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
    systemPatch: { name: 'Patched Fighter' },
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
      baseAc: 11,
      addDexModifier: true,
      stealthDisadvantage: false,
    },
    homebrewUpdate: { kind: 'armor', name: 'Updated Baseline Armor' },
    expectedHomebrewName: 'Updated Baseline Armor',
    systemTargetSlug: 'leather-armor',
    systemPatch: { kind: 'armor', name: 'Patched Leather Armor' },
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
    systemPatch: { name: 'Patched Fire Bolt' },
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
    systemPatch: { name: 'Patched Alert' },
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
    systemPatch: { name: 'Patched Human' },
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
    systemPatch: { name: 'Patched Athletics' },
    expectedPatchedSystemName: 'Patched Athletics',
  },
]

describe.each(baselineCases)('content write baseline — $label', (baselineCase) => {
  it('creates homebrew, updates homebrew, patches system, and round-trips via catalog', async () => {
    const campaign = await makeTestCampaign()

    const created = await createHomebrewContent(
      baselineCase.config,
      campaign.id,
      baselineCase.createInput,
    )
    expect(created.source).toBe('homebrew')
    expect(created.campaignId).toBe(campaign.id)
    expect(created.status).toBe('published')

    const updatedHomebrew = await updateContentEntity(
      baselineCase.config,
      campaign.id,
      created.id,
      baselineCase.homebrewUpdate,
    )
    expect(updatedHomebrew.source).toBe('homebrew')
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
      (record) => record.slug === baselineCase.systemTargetSlug && record.source === 'system',
    )
    expect(systemRecord).toBeDefined()
    if (!systemRecord) throw new Error(`expected system seed ${baselineCase.systemTargetSlug}`)
    expect(systemRecord.status).toBe('published')

    const patchedSystem = await updateContentEntity(
      baselineCase.config,
      campaign.id,
      systemRecord.id,
      baselineCase.systemPatch,
    )
    expect(patchedSystem.source).toBe('system')
    expect(patchedSystem.name).toBe(baselineCase.expectedPatchedSystemName)
    expect(patchedSystem.status).toBe('published')

    const catalogAfterPatch = await resolveCatalogForCampaign(
      baselineCase.config.readConfig,
      campaign.id,
    )
    expect(catalogAfterPatch.find((record) => record.id === systemRecord.id)?.name).toBe(
      baselineCase.expectedPatchedSystemName,
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
      'draft',
    )
    expect(created.status).toBe('draft')
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
