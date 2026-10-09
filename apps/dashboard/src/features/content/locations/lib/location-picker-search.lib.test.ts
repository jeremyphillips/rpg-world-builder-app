import { describe, expect, it } from 'vitest'

import { scoreSearchDocument } from '@rpg/search'
import { rankLegacySearchItems } from '@rpg/ui'

import { STORY_CAMPAIGN_ID } from '@/test/fixtures/constants'
import { makeLocation } from '@/test/fixtures/factories/location'

import { buildLocationsById } from './location-display'
import { buildLocationPickerSearchText } from './location-display'
import { assembleLocationPickerSearchDocument } from './location-picker-search.lib'

const CAMPAIGN_ID = STORY_CAMPAIGN_ID

function scoreLocation(
  location: ReturnType<typeof makeLocation>,
  locations: readonly ReturnType<typeof makeLocation>[],
  query: string,
) {
  return scoreSearchDocument(
    assembleLocationPickerSearchDocument(location, {
      locationsById: buildLocationsById(locations),
      campaignId: CAMPAIGN_ID,
    }),
    query,
    { profile: 'forgiving' },
  )
}

/** Same single-label ranking `rankPickerItems` uses for the live location drawer. */
function livePickerIds(
  locations: readonly ReturnType<typeof makeLocation>[],
  query: string,
): string[] {
  const locationsById = buildLocationsById(locations)
  return rankLegacySearchItems(
    locations.map((location) => ({
      location,
      fields: [
        {
          text: buildLocationPickerSearchText(location, {
            locationsById,
            campaignId: CAMPAIGN_ID,
          }),
          weight: 1,
          role: 'label' as const,
        },
      ],
    })),
    query,
    'forgiving',
  ).map((row) => row.location.id)
}

describe('assembleLocationPickerSearchDocument', () => {
  const ancestor = makeLocation({ id: 'loc-amber-reach', name: 'Amber Reach', kind: 'region' })
  const nameHit = makeLocation({
    id: 'loc-amber-hall',
    name: 'Amber Hall',
    kind: 'settlement',
    parentLocationId: ancestor.id,
  })
  const classificationHit = makeLocation({
    id: 'loc-quiet-inn',
    name: 'Quiet Inn',
    kind: 'structure',
    structureType: 'building',
    classification: { facilityType: 'brewery' },
    parentLocationId: ancestor.id,
  })
  const ancestorHit = makeLocation({
    id: 'loc-north-gate',
    name: 'North Gate',
    kind: 'site',
    parentLocationId: ancestor.id,
  })
  const locations = [ancestor, nameHit, classificationHit, ancestorHit]

  it('ranks a name hit above a classification hit above an ancestor hit', () => {
    const nameScore = scoreLocation(nameHit, locations, 'amber')
    const classificationScore = scoreLocation(classificationHit, locations, 'brewery')
    const ancestorScore = scoreLocation(ancestorHit, locations, 'amber reach')

    expect(nameScore).toBeGreaterThan(classificationScore)
    expect(classificationScore).toBeGreaterThan(ancestorScore)
  })

  it('keeps every row the flat location search string would return', () => {
    const queries = ['amber', 'brewery', 'reach', 'north', 'quiet']

    for (const query of queries) {
      const flatIds = new Set(livePickerIds(locations, query))
      const documentIds = new Set(
        locations
          .filter((location) => scoreLocation(location, locations, query) > 0)
          .map((location) => location.id),
      )

      for (const id of flatIds) {
        expect(documentIds.has(id), `${query} dropped ${id}`).toBe(true)
      }
    }
  })
})
