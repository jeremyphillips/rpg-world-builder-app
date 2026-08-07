import { render, screen } from '@testing-library/react'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'
import { describe, expect, it } from 'vitest'

import { CatalogCollapsibleList } from './catalog-collapsible-list.client'

describe('CatalogCollapsibleList', () => {
  it('renders semantic list items', () => {
    render(
      <CatalogCollapsibleList
        items={[{ id: 'alpha' }, { id: 'beta' }]}
        getItemId={(item) => item.id}
        renderItem={(item) => <div>{item.id}</div>}
      />,
    )

    expect(screen.getAllByRole('listitem')).toHaveLength(2)
    expect(screen.getByText('alpha')).toBeInTheDocument()
  })

  itAxe('has no axe accessibility violations', async () => {
    const { container } = render(
      <CatalogCollapsibleList
        items={[{ id: 'alpha' }]}
        getItemId={(item) => item.id}
        renderItem={(item) => <div>{item.id}</div>}
      />,
    )

    await expectNoAxeViolations(container)
  })
})
