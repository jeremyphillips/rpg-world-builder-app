import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import type { ReactNode } from 'react'

import type { Location } from '@rpg/contracts'
import { buildingClassificationSchema } from '@rpg/contracts'

import { STORY_CAMPAIGN_ID } from '@/test/fixtures/constants'
import { makeLocation } from '@/test/fixtures/factories/location'

import { HARBORFORD, LOCATIONS_LIST, YAWNING_PORTAL } from '../fixtures'
import { locationsColumns } from './locations-overview-columns'

function renderContainsCell(location: Location) {
  const columns = locationsColumns(STORY_CAMPAIGN_ID, { locations: LOCATIONS_LIST })
  const containsColumn = columns.find((column) => column.id === 'contains')
  expect(containsColumn).toBeDefined()

  const renderCell = containsColumn?.cell as (ctx: { row: { original: Location } }) => ReactNode

  return render(<>{renderCell({ row: { original: location } })}</>)
}

describe('locationsColumns', () => {
  it('formats Type column from display summary', () => {
    const columns = locationsColumns(STORY_CAMPAIGN_ID, { locations: LOCATIONS_LIST })
    const typeColumn = columns.find((column) => column.id === 'locationType')
    expect(typeColumn).toBeDefined()

    const cell = typeColumn?.cell as (ctx: { row: { original: Location } }) => string

    expect(cell({ row: { original: HARBORFORD } })).toBe('Settlement · City')
    expect(cell({ row: { original: YAWNING_PORTAL } })).toBe('Building · Brewery')
  })

  it('sorts Type column by classification parts with name tie-break', () => {
    const columns = locationsColumns(STORY_CAMPAIGN_ID, { locations: LOCATIONS_LIST })
    const typeColumn = columns.find((column) => column.id === 'locationType')
    const sortingFn = typeColumn?.sortingFn as (
      left: { original: Location },
      right: { original: Location },
    ) => number

    expect(sortingFn({ original: YAWNING_PORTAL }, { original: HARBORFORD })).toBeLessThan(0)
    expect(sortingFn({ original: HARBORFORD }, { original: YAWNING_PORTAL })).toBeGreaterThan(0)
  })

  it('sorts buildings with the same visible classification by name', () => {
    const breweryA = makeLocation({
      kind: 'structure',
      id: 'location-guildhall-a',
      slug: 'guildhall-a',
      name: 'Alpha Guildhall',
      structureType: 'building',
      parentLocationId: YAWNING_PORTAL.parentLocationId,
      classification: buildingClassificationSchema.parse({ facilityType: 'brewery' }),
    })
    const breweryB = makeLocation({
      kind: 'structure',
      id: 'location-guildhall-b',
      slug: 'guildhall-b',
      name: 'Beta Guildhall',
      structureType: 'building',
      parentLocationId: YAWNING_PORTAL.parentLocationId,
      classification: buildingClassificationSchema.parse({ facilityType: 'brewery' }),
    })
    const columns = locationsColumns(STORY_CAMPAIGN_ID, {
      locations: [...LOCATIONS_LIST, breweryA, breweryB],
    })
    const typeColumn = columns.find((column) => column.id === 'locationType')
    const sortingFn = typeColumn?.sortingFn as (
      left: { original: Location },
      right: { original: Location },
    ) => number

    expect(sortingFn({ original: breweryA }, { original: breweryB })).toBeLessThan(0)
    expect(sortingFn({ original: breweryB }, { original: breweryA })).toBeGreaterThan(0)
  })

  it('sorts shorter equal-prefix classifications before longer ones', () => {
    const plainBuilding = makeLocation({
      kind: 'structure',
      id: 'location-plain-building',
      slug: 'plain-building',
      name: 'Plain Building',
      structureType: 'building',
      parentLocationId: YAWNING_PORTAL.parentLocationId,
    })
    delete (plainBuilding as { classification?: unknown }).classification

    const classifiedBuilding = makeLocation({
      kind: 'structure',
      id: 'location-archetyped-building',
      slug: 'archetyped-building',
      name: 'Archetyped Building',
      structureType: 'building',
      parentLocationId: YAWNING_PORTAL.parentLocationId,
      classification: buildingClassificationSchema.parse({ facilityType: 'brewery' }),
    })
    const columns = locationsColumns(STORY_CAMPAIGN_ID, {
      locations: [...LOCATIONS_LIST, plainBuilding, classifiedBuilding],
    })
    const typeColumn = columns.find((column) => column.id === 'locationType')
    const sortingFn = typeColumn?.sortingFn as (
      left: { original: Location },
      right: { original: Location },
    ) => number

    expect(sortingFn({ original: plainBuilding }, { original: classifiedBuilding })).toBeLessThan(0)
    expect(
      sortingFn({ original: classifiedBuilding }, { original: plainBuilding }),
    ).toBeGreaterThan(0)
  })

  it('renders Contains with child location tooltip summaries', async () => {
    const user = userEvent.setup()

    renderContainsCell(HARBORFORD)

    expect(
      screen.getByRole('button', {
        name: /1 location: Dock Ward/i,
      }),
    ).toHaveTextContent('1')

    await user.tab()
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Dock Ward')
  })

  it('renders Contains zero as plain text without a count box', () => {
    renderContainsCell(YAWNING_PORTAL)

    expect(screen.getByText('0')).toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})
