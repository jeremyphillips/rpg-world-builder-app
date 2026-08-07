import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import { DrawerContext } from './drawer-context.client'

describe('DrawerContext', () => {
  it('renders one entity with suffix and supporting text', () => {
    render(
      <DrawerContext
        entities={[
          {
            heading: 'Yawning Portal',
            headingSuffix: ' · Building · Tavern',
            supportingText: 'Located in Dock Ward',
          },
        ]}
      />,
    )

    expect(screen.getByText('Yawning Portal')).toBeInTheDocument()
    expect(screen.getByText('Building · Tavern')).toBeInTheDocument()
    expect(screen.getByText('Located in Dock Ward')).toBeInTheDocument()
  })

  it('renders two entities without card chrome', () => {
    const { container } = render(
      <DrawerContext
        entities={[
          { heading: 'Port City', headingSuffix: ' · Settlement' },
          { heading: 'City Council', headingSuffix: ' · Organization' },
        ]}
      />,
    )

    expect(screen.getByText('Port City')).toBeInTheDocument()
    expect(screen.getByText('City Council')).toBeInTheDocument()
    expect(container.querySelector('.bg-sunken')).not.toBeInTheDocument()
    expect(container.querySelector('.border')).not.toBeInTheDocument()
  })

  it('links the entity name when href is provided', () => {
    render(
      <MemoryRouter>
        <DrawerContext
          entities={[
            {
              heading: 'Yawning Portal',
              href: '/campaigns/demo/locations/yawning-portal',
            },
          ]}
        />
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: 'Yawning Portal' })).toHaveAttribute(
      'href',
      '/campaigns/demo/locations/yawning-portal',
    )
  })

  it('omits supporting text for root locations', () => {
    render(
      <DrawerContext
        entities={[
          {
            heading: 'Aldermere',
            headingSuffix: ' · World',
          },
        ]}
      />,
    )

    expect(screen.queryByText(/^Located in /)).not.toBeInTheDocument()
  })

  itAxe('has no axe accessibility violations', async () => {
    const { container } = render(
      <DrawerContext
        entities={[
          {
            heading: 'Yawning Portal',
            headingSuffix: ' · Building · Tavern',
            supportingText: 'Located in Dock Ward',
          },
        ]}
      />,
    )
    await expectNoAxeViolations(container)
  })
})
