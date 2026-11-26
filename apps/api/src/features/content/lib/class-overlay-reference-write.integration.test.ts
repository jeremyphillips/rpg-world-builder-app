import { ELDRITCH_BLAST_RESOLUTION, SPELL_CLASS_REFERENCE_ISSUE_CODE } from '@rpg/contracts'
import { loadSeedSpecies } from '@rpg/catalog/species'
import { loadSeedSpells } from '@rpg/catalog/spells'
import { describe, expect, it } from 'vitest'

import { makeTestCampaign } from '../../../test/fixtures/campaigns'
import { overlayUpdateFromBodies } from '../../../test/helpers/system-overlay-write'
import { useIntegrationDb } from '../../../test/setup/integration-db'
import { ClassPatchModel } from '../classes/class-patch.model'
import { resolveCatalogForCampaign } from '../content.service'
import { createHomebrewContent, updateContentEntity } from '../lib/content-write.service'
import { contentEntityBody } from '../lib/resolve-system-overlay.lib'
import { HttpError } from '../../../lib/http-error'
import { SpeciesPatchModel } from '../species/species-patch.model'
import { speciesWriteConfig } from '../species/species.config'
import { SpellPatchModel } from '../spells/spell-patch.model'
import { spellWriteConfig } from '../spells/spells.config'

useIntegrationDb()

const FIGHTER_CLASS_ID = 'srd-cc-5.2.1:fighter'

const speciesBase = {
  slug: 'overlay-folk',
  name: 'Overlay Folk',
  creatureType: 'humanoid' as const,
  sizes: ['medium' as const],
  movement: { walk: 30 },
  traits: [],
}

const spellBase = {
  slug: 'overlay-bolt',
  name: 'Overlay Bolt',
  school: 'evocation',
  level: 0,
  castingTime: { normal: { value: 1, unit: 'action' }, canBeCastAsRitual: false },
  range: { kind: 'distance' as const, value: { value: 60, unit: 'ft' as const } },
  duration: { kind: 'instantaneous' as const },
  components: { verbal: true, somatic: true },
  resolution: ELDRITCH_BLAST_RESOLUTION,
}

async function brokenFighterOverlay(campaignId: string) {
  await ClassPatchModel.create({
    campaignId,
    targetId: FIGHTER_CLASS_ID,
    patch: { name: 'Unversioned overlay' },
  })
}

describe('class overlay reference writes', () => {
  it('publishes a species and spell that do not reference a malformed class overlay', async () => {
    const campaign = await makeTestCampaign()
    await brokenFighterOverlay(campaign.id)

    const species = await createHomebrewContent(speciesWriteConfig, campaign.id, {
      ...speciesBase,
      slug: 'healthy-folk',
      name: 'Healthy Folk',
    })
    expect(species.name).toBe('Healthy Folk')

    const spell = await createHomebrewContent(spellWriteConfig, campaign.id, {
      ...spellBase,
      slug: 'healthy-bolt',
      classIds: ['wizard'],
    })
    expect(spell.classIds).toEqual(['wizard'])
  })

  it('rejects a species class slug whose overlay failed without calling it unknown', async () => {
    const campaign = await makeTestCampaign()
    await brokenFighterOverlay(campaign.id)

    try {
      await createHomebrewContent(speciesWriteConfig, campaign.id, {
        ...speciesBase,
        slug: 'unresolved-folk',
        characterCreation: {
          multiclassing: {
            policy: 'restricted',
            classPolicy: { mode: 'only', classIds: ['fighter'] },
          },
        },
      })
      throw new Error('expected validation_error')
    } catch (error) {
      expect(error).toBeInstanceOf(HttpError)
      const httpError = error as HttpError
      expect(httpError.code).toBe('validation_error')
      expect(httpError.message).not.toContain('Unknown')
      expect(httpError.details).toEqual({
        issues: [expect.objectContaining({ code: 'unresolved_overlay_class' })],
      })
    }
  })

  it('rejects a spell class slug that does not exist', async () => {
    const campaign = await makeTestCampaign()
    await brokenFighterOverlay(campaign.id)

    try {
      await createHomebrewContent(spellWriteConfig, campaign.id, {
        ...spellBase,
        slug: 'missing-class-bolt',
        classIds: ['not-a-class'],
      })
      throw new Error('expected validation_error')
    } catch (error) {
      expect(error).toBeInstanceOf(HttpError)
      const httpError = error as HttpError
      expect(httpError.message).toContain('Unknown')
      expect(httpError.details).toEqual({
        issues: [expect.objectContaining({ code: 'unknown_class', path: 'classIds.0' })],
      })
      expect(JSON.stringify(httpError.details)).not.toContain('unresolved_overlay_class')
    }
  })

  it('rejects a spell class slug whose overlay failed without calling it unknown', async () => {
    const campaign = await makeTestCampaign()
    await brokenFighterOverlay(campaign.id)

    try {
      await createHomebrewContent(spellWriteConfig, campaign.id, {
        ...spellBase,
        slug: 'unresolved-class-bolt',
        classIds: ['fighter'],
      })
      throw new Error('expected validation_error')
    } catch (error) {
      expect(error).toBeInstanceOf(HttpError)
      const httpError = error as HttpError
      expect(httpError.code).toBe('validation_error')
      expect(httpError.message).not.toContain('Unknown')
      expect(httpError.message).not.toContain('without spellcasting')
      expect(httpError.details).toEqual({
        issues: [expect.objectContaining({ code: 'unresolved_overlay_class' })],
      })
    }
  })

  it('rejects a spell reference to a resolved non-caster without an overlay error', async () => {
    const campaign = await makeTestCampaign()

    try {
      await createHomebrewContent(spellWriteConfig, campaign.id, {
        ...spellBase,
        slug: 'fighter-bolt',
        classIds: ['fighter'],
      })
      throw new Error('expected validation_error')
    } catch (error) {
      expect(error).toBeInstanceOf(HttpError)
      expect((error as HttpError).message).toMatch(/spellcasting/i)
      expect((error as HttpError).message).not.toContain('overlay could not be applied')
    }
  })

  it('rejects a system spell overlay that adds a non-caster through intent-only input', async () => {
    const campaign = await makeTestCampaign()
    const fireBolt = loadSeedSpells(campaign.rulesetId).find((row) => row.slug === 'fire-bolt')
    expect(fireBolt).toBeDefined()
    if (!fireBolt) return

    const catalog = await resolveCatalogForCampaign(spellWriteConfig.readConfig, campaign.id)
    const spell = catalog.find((row) => row.id === fireBolt.id)
    expect(spell).toBeDefined()
    if (!spell) return

    const seed = contentEntityBody(spell as unknown as Record<string, unknown>)
    const classIds = [...((seed.classIds as string[]) ?? []), 'fighter']

    try {
      await updateContentEntity(
        spellWriteConfig,
        campaign.id,
        fireBolt.id,
        overlayUpdateFromBodies({
          participantId: 'spells',
          catalogSeed: seed,
          baseline: seed,
          draft: { ...seed, classIds },
        }),
      )
      throw new Error('expected validation_error')
    } catch (error) {
      expect(error).toBeInstanceOf(HttpError)
      const httpError = error as HttpError
      expect(httpError.status).toBe(400)
      expect(httpError.code).toBe('validation_error')
      expect(httpError.details).toEqual({
        issues: [
          expect.objectContaining({
            code: SPELL_CLASS_REFERENCE_ISSUE_CODE.classWithoutSpellcasting,
          }),
        ],
      })
    }

    const patch = await SpellPatchModel.findOne({
      campaignId: campaign.id,
      targetId: fireBolt.id,
    }).lean()
    expect(patch).toBeNull()
  })

  it('accepts a valid system spell overlay after a rejected invalid class list', async () => {
    const campaign = await makeTestCampaign()
    const fireBolt = loadSeedSpells(campaign.rulesetId).find((row) => row.slug === 'fire-bolt')
    expect(fireBolt).toBeDefined()
    if (!fireBolt) return

    const catalog = await resolveCatalogForCampaign(spellWriteConfig.readConfig, campaign.id)
    const spell = catalog.find((row) => row.id === fireBolt.id)
    expect(spell).toBeDefined()
    if (!spell) return

    const seed = contentEntityBody(spell as unknown as Record<string, unknown>)
    const updated = await updateContentEntity(
      spellWriteConfig,
      campaign.id,
      fireBolt.id,
      overlayUpdateFromBodies({
        participantId: 'spells',
        catalogSeed: seed,
        baseline: seed,
        draft: { ...seed, name: 'Validated Spark' },
      }),
    )
    expect(updated.name).toBe('Validated Spark')
  })

  it('rejects a system species overlay with an unknown multiclass slug through intent-only input', async () => {
    const campaign = await makeTestCampaign()
    const human = loadSeedSpecies(campaign.rulesetId).find((row) => row.slug === 'human')
    expect(human).toBeDefined()
    if (!human) return

    const catalog = await resolveCatalogForCampaign(speciesWriteConfig.readConfig, campaign.id)
    const species = catalog.find((row) => row.id === human.id)
    expect(species).toBeDefined()
    if (!species) return

    const seed = contentEntityBody(species as unknown as Record<string, unknown>)
    const draft = {
      ...seed,
      characterCreation: {
        multiclassing: {
          policy: 'restricted',
          classPolicy: { mode: 'only', classIds: ['not-a-class'] },
        },
      },
    }

    try {
      await updateContentEntity(
        speciesWriteConfig,
        campaign.id,
        human.id,
        overlayUpdateFromBodies({
          participantId: 'species',
          catalogSeed: seed,
          baseline: seed,
          draft,
        }),
      )
      throw new Error('expected validation_error')
    } catch (error) {
      expect(error).toBeInstanceOf(HttpError)
      const httpError = error as HttpError
      expect(httpError.status).toBe(400)
      expect(httpError.code).toBe('validation_error')
      expect(httpError.details).toEqual({
        issues: [expect.objectContaining({ code: 'unknown_class' })],
      })
    }

    const patch = await SpeciesPatchModel.findOne({
      campaignId: campaign.id,
      targetId: human.id,
    }).lean()
    expect(patch).toBeNull()
  })
})
