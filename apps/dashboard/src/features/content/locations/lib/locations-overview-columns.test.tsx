import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import type { ReactNode } from 'react'

import type { Location } from '@rpg/contracts'

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

  it('sorts Type column by structured summary tuple', () => {
    const columns = locationsColumns(CAMPAIGN_ID, { locations: LOCATIONS_LIST })
    const typeColumn = columns.find((column) => column.id === 'locationType')
    const sortingFn = typeColumn?.sortingFn as (
      left: { original: Location },
      right: { original: Location },
    ) => number

    expect(sortingFn({ original: YAWNING_PORTAL }, { original: HARBORFORD })).toBeLessThan(0)
    expect(sortingFn({ original: HARBORFORD }, { original: YAWNING_PORTAL })).toBeGreaterThan(0)
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
