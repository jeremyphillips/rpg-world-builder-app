import { getVocabularyTermLabel, MAGIC_ITEM_RARITY_TERM } from '@rpg/contracts'
import { describe, expect, it } from 'vitest'

import { pickEquipment } from '../../../lib/fixtures/pick'
import { getEquipmentKindStatRows } from './equipment-detail-stat-rows'

describe('getEquipmentKindStatRows', () => {
  it('returns weapon stat rows for a longsword', () => {
    const longsword = pickEquipment('longsword')
    const rows = getEquipmentKindStatRows(longsword)
    expect(rows.some((row) => row.label === 'Category' && row.value === 'Martial')).toBe(true)
    expect(rows.some((row) => row.label === 'Damage')).toBe(true)
  })

  it('returns armor stat rows for leather', () => {
    const leather = pickEquipment('leather-armor')
    const rows = getEquipmentKindStatRows(leather)
    expect(rows.some((row) => row.label === 'AC')).toBe(true)
  })

  it('returns adventuring gear stat rows for a torch', () => {
    const torch = pickEquipment('torch')
    const rows = getEquipmentKindStatRows(torch)
    expect(rows.some((row) => row.label === 'Gear kind')).toBe(true)
  })

  it('returns vehicle stat rows for a rowboat', () => {
    const rowboat = pickEquipment('rowboat')
    const rows = getEquipmentKindStatRows(rowboat)
    expect(rows.some((row) => row.label === 'Category' && row.value === 'Water')).toBe(true)
  })

  it('returns magic item stat rows for bracers of defense', () => {
    const bracers = pickEquipment('bracers-of-defense')
    const rows = getEquipmentKindStatRows(bracers)
    expect(rows.some((row) => row.label === getVocabularyTermLabel(MAGIC_ITEM_RARITY_TERM))).toBe(
      true,
    )
  })

  it('returns service stat rows for skilled hireling', () => {
    const hireling = pickEquipment('skilled-hireling')
    const rows = getEquipmentKindStatRows(hireling)
    expect(rows.some((row) => row.label === 'Category' && row.value === 'Hireling')).toBe(true)
    expect(rows.some((row) => row.label === 'Duration' && row.value === 'per day')).toBe(true)
  })

  it('returns mount stat rows for a riding horse', () => {
    const horse = pickEquipment('riding-horse')
    const rows = getEquipmentKindStatRows(horse)
    expect(rows.some((row) => row.label === 'Carrying capacity' && row.value === '480 lb')).toBe(
      true,
    )
    expect(rows.some((row) => row.label === 'Speed' && row.value === '60 ft.')).toBe(true)
  })

  it('returns tool stat rows for thieves tools', () => {
    const tools = pickEquipment('thieves-tools')
    const rows = getEquipmentKindStatRows(tools)
    expect(rows.some((row) => row.label === 'Category' && row.value === "Thieves' Tools")).toBe(
      true,
    )
    expect(rows.some((row) => row.label === 'Ability' && row.value === 'Dexterity')).toBe(true)
  })
})
