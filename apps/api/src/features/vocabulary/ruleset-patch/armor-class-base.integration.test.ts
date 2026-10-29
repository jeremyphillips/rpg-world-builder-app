import { describe, expect, it } from 'vitest'

import { getEquipmentBySlug } from '@rpg/catalog/equipment'
import {
  DEFAULT_SYSTEM_RULESET_ID,
  armorClassFromProtection,
  getArmorAcDisplay,
  isArmorEquipment,
} from '@rpg/contracts'

import {
  createHomebrewContent,
  equipmentWriteConfig,
  resolveCatalogForCampaign,
} from '../../content'
import { useIntegrationApp } from '../../../test/setup/integration-app'
import {
  authedCampaignContext,
  getRulesetPatchRoute,
  patchMechanicsRoute,
} from '../../../test/helpers/http'
import { storedRulesetPatchDoc } from '../../../test/helpers/ruleset-patch'

const getApp = useIntegrationApp()

const PLATE_OFFSET = 8
const HOMEBREW_SLUG = 'custom-plate'

describe('unarmored base lifecycle', () => {
  it('shows plate at 17 after a base 9 patch and leaves stored offsets unchanged', async () => {
    const app = getApp()
    const { agent, csrfToken, campaignId } = await authedCampaignContext(app)

    await createHomebrewContent(equipmentWriteConfig, campaignId, {
      kind: 'armor',
      slug: HOMEBREW_SLUG,
      name: 'Custom Plate',
      category: 'heavy',
      cost: { amount: 1500, currency: 'gp' },
      baseAcOffset: PLATE_OFFSET,
      stealthDisadvantage: true,
    })

    await patchMechanicsRoute(agent, csrfToken, campaignId, {
      armorClass: { mode: 'ascending', base: 9 },
    }).expect(200)

    const ruleset = await getRulesetPatchRoute(agent, campaignId).expect(200)
    const rules = ruleset.body.patch.mechanics.armorClass
    expect(rules).toEqual({ mode: 'ascending', base: 9 })
    expect(armorClassFromProtection(rules, PLATE_OFFSET)).toBe(17)

    const systemPlate = getEquipmentBySlug(DEFAULT_SYSTEM_RULESET_ID, 'plate-armor')
    if (!isArmorEquipment(systemPlate)) throw new Error('expected plate armor')
    expect(systemPlate.baseAcOffset).toBe(PLATE_OFFSET)
    expect(getArmorAcDisplay(systemPlate, rules)).toBe('17 (no Dex)')

    const catalog = await resolveCatalogForCampaign(equipmentWriteConfig.readConfig, campaignId)
    const resolvedPlate = catalog.find((item) => item.slug === 'plate-armor')
    const resolvedHomebrew = catalog.find((item) => item.slug === HOMEBREW_SLUG)
    if (
      resolvedPlate === undefined ||
      resolvedHomebrew === undefined ||
      !isArmorEquipment(resolvedPlate) ||
      !isArmorEquipment(resolvedHomebrew)
    ) {
      throw new Error('expected armor rows')
    }
    expect(resolvedPlate.baseAcOffset).toBe(PLATE_OFFSET)
    expect(resolvedHomebrew.baseAcOffset).toBe(PLATE_OFFSET)

    const storedPatch = await storedRulesetPatchDoc(campaignId)
    expect(storedPatch?.mechanics?.armorClass).toEqual({ mode: 'ascending', base: 9 })
    expect(storedPatch?.mechanics?.editionPreset?.modified).toBe(true)

    const search = await agent.get(`/api/campaigns/${campaignId}/search/catalog`).expect(200)
    const documents = search.body.documents as { title: string; secondary?: string }[]
    const plateDocument = documents.find((document) => document.title === 'Plate Armor')
    const homebrewDocument = documents.find((document) => document.title === 'Custom Plate')

    expect(plateDocument?.secondary).toContain('AC 17 (no Dex)')
    expect(homebrewDocument?.secondary).toContain('AC 17 (no Dex)')
  })
})
