import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import type { ReactNode } from 'react'

import type { Location } from '@rpg/contracts'
import { buildingClassificationSchema } from '@rpg/contracts'

import { HARBORFORD, LOCATIONS_LIST, YAWNING_PORTAL } from '../fixtures'
import { locationsColumns } from './locations-overview-columns'

const CAMPAIGN_ID = 'camp_1'

function renderContainsCell(location: Location) {
  const columns = locationsColumns(CAMPAIGN_ID, { locations: LOCATIONS_LIST })
  const containsColumn = columns.find((column) => column.id === 'contains')
  expect(containsColumn).toBeDefined()

  const renderCell = containsColumn?.cell as (ctx: { row: { original: Location } }) => ReactNode

  return render(<>{renderCell({ row: { original: location } })}</>)
}

describe('locationsColumns', () => {
  it('formats Type column from display summary', () => {
    const columns = locationsColumns(CAMPAIGN_ID, { locations: LOCATIONS_LIST })
    const typeColumn = columns.find((column) => column.id === 'locationType')
    expect(typeColumn).toBeDefined()

    const cell = typeColumn?.cell as (ctx: { row: { original: Location } }) => string

    expect(cell({ row: { original: HARBORFORD } })).toBe('Settlement · City')
    expect(cell({ row: { original: YAWNING_PORTAL } })).toBe('Building · Tavern')
  })

  it('sorts Type column by classification parts with name tie-break', () => {
    const columns = locationsColumns(CAMPAIGN_ID, { locations: LOCATIONS_LIST })
    const typeColumn = columns.find((column) => column.id === 'locationType')
    const sortingFn = typeColumn?.sortingFn as (
      left: { original: Location },
      right: { original: Location },
    ) => number

    expect(sortingFn({ original: YAWNING_PORTAL }, { original: HARBORFORD })).toBeLessThan(0)
    expect(sortingFn({ original: HARBORFORD }, { original: YAWNING_PORTAL })).toBeGreaterThan(0)
  })

  it('sorts buildings with the same visible type by name when specialization differs', () => {
    const guildhallA = {
      ...YAWNING_PORTAL,
      id: 'location-guildhall-a',
      slug: 'guildhall-a',
      name: 'Alpha Guildhall',
      classification: buildingClassificationSchema.parse({
        archetype: 'guildhall',
        specialization: 'Thieves',
      }),
    } as Location
    const guildhallB = {
      ...YAWNING_PORTAL,
      id: 'location-guildhall-b',
      slug: 'guildhall-b',
      name: 'Beta Guildhall',
      classification: buildingClassificationSchema.parse({
        archetype: 'guildhall',
        specialization: 'Merchants',
      }),
    } as Location
    const columns = locationsColumns(CAMPAIGN_ID, {
      locations: [...LOCATIONS_LIST, guildhallA, guildhallB],
    })
    const typeColumn = columns.find((column) => column.id === 'locationType')
    const sortingFn = typeColumn?.sortingFn as (
      left: { original: Location },
      right: { original: Location },
    ) => number

    expect(sortingFn({ original: guildhallA }, { original: guildhallB })).toBeLessThan(0)
    expect(sortingFn({ original: guildhallB }, { original: guildhallA })).toBeGreaterThan(0)
  })

  it('sorts shorter equal-prefix classifications before longer ones', () => {
    const plainBuilding = {
      ...YAWNING_PORTAL,
      id: 'location-plain-building',
      slug: 'plain-building',
      name: 'Plain Building',
    } as Location
    delete (plainBuilding as { classification?: unknown }).classification

    const archetypedBuilding = {
      ...YAWNING_PORTAL,
      id: 'location-archetyped-building',
      slug: 'archetyped-building',
      name: 'Archetyped Building',
      classification: buildingClassificationSchema.parse({ archetype: 'tavern' }),
    } as Location
    const columns = locationsColumns(CAMPAIGN_ID, {
      locations: [...LOCATIONS_LIST, plainBuilding, archetypedBuilding],
    })
    const typeColumn = columns.find((column) => column.id === 'locationType')
    const sortingFn = typeColumn?.sortingFn as (
      left: { original: Location },
      right: { original: Location },
    ) => number

    expect(sortingFn({ original: plainBuilding }, { original: archetypedBuilding })).toBeLessThan(0)
    expect(
      sortingFn({ original: archetypedBuilding }, { original: plainBuilding }),
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
