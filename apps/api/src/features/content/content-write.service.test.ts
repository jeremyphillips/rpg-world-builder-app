import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'

import { clearTestDb, startTestDb, stopTestDb } from '../../test/db'
import { createUser } from '../user'
import { createCampaign } from '../campaign'
import { armorWriteConfig } from './armor/armor.config'
import { createHomebrewContent, updateContentEntity } from './lib/content-write.service'
import { resolveCatalogForCampaign } from './content.service'

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
