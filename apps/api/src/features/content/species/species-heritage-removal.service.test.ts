import { describe, expect, it } from 'vitest'

import { makeTestCampaign } from '../../../test/fixtures/campaigns'
import { minimalNpcRequestInput } from '../../../test/fixtures/npcs'
import { useIntegrationDb } from '../../../test/setup/integration-db'
import { createCampaignNpc } from '../../campaign'
import { createHomebrewContent } from '../lib/content-write.service'
import { speciesWriteConfig } from './species.config'
import { getSpeciesHeritageRemovalAvailability } from './species-heritage-removal.service'

useIntegrationDb()

const minimalSpeciesWithHeritageInput = {
  slug: 'heritage-folk',
  name: 'Heritage Folk',
  creatureType: 'humanoid',
  sizes: ['medium'],
  movement: { walk: 30 },
  traits: [],
  heritage: {
    name: 'Lineage',
    choose: 1,
    options: [
      {
        kind: 'custom',
        id: 'heritage-option-a',
        name: 'Option A',
      },
    ],
  },
}

describe('getSpeciesHeritageRemovalAvailability', () => {
  it('returns allowed when no characters reference heritage options', async () => {
    const campaign = await makeTestCampaign()
    const created = await createHomebrewContent(
      speciesWriteConfig,
      campaign.id,
      minimalSpeciesWithHeritageInput,
    )

    const availability = await getSpeciesHeritageRemovalAvailability(campaign.id, created.id)

    expect(availability).toEqual({ status: 'allowed' })
  })

  it('blocks removal when a campaign character uses a heritage option', async () => {
    const campaign = await makeTestCampaign()
    const created = await createHomebrewContent(
      speciesWriteConfig,
      campaign.id,
      minimalSpeciesWithHeritageInput,
    )
    const heritageOptionId = created.heritage?.options[0]?.id
    expect(heritageOptionId).toBeDefined()

    await createCampaignNpc(campaign.id, {
      ...minimalNpcRequestInput,
      name: 'Heritage NPC',
      species: { id: created.id, heritageId: heritageOptionId! },
    })

    const availability = await getSpeciesHeritageRemovalAvailability(campaign.id, created.id)

    expect(availability.status).toBe('blocked')
    if (availability.status !== 'blocked') throw new Error('expected blocked')
    expect(availability.blockers).toHaveLength(1)
    expect(availability.blockers[0]?.kind).toBe('usage')
  })

  it('rejects heritage removal on system species', async () => {
    const campaign = await makeTestCampaign()

    await expect(
      getSpeciesHeritageRemovalAvailability(campaign.id, 'srd-cc-5.2.1:elf'),
    ).rejects.toMatchObject({ status: 403 })
  })
})
