import { ELDRITCH_BLAST_RESOLUTION } from '@rpg/contracts'
import { describe, expect, it } from 'vitest'

import { makeTestCampaign } from '../../../test/fixtures/campaigns'
import { useIntegrationDb } from '../../../test/setup/integration-db'
import { ClassPatchModel } from '../classes/class-patch.model'
import { createHomebrewContent } from '../lib/content-write.service'
import { HttpError } from '../../../lib/http-error'
import { speciesWriteConfig } from '../species/species.config'
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
      expect((error as HttpError).message).toContain('without spellcasting')
      expect((error as HttpError).message).not.toContain('overlay could not be applied')
    }
  })
})
