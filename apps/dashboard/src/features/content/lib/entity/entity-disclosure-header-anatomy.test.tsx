import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { MemoryRouter } from 'react-router-dom'

import { CollapsibleListItem } from '@rpg/ui'

import { EntityDisclosureHeaderAnatomy } from './entity-disclosure-header-anatomy.client'
import { HARBOR_DISTRICT_ENTITY } from './entity.fixture'

function renderInCollapsibleContext(ui: React.ReactNode) {
  return render(
    <CollapsibleListItem
      itemId="test-item"
      toolbarAriaLabel="Test item"
      collapsible
      rowLayout="entity-card"
      toolbarLeadingChrome="none"
      header={ui}
      body={<p>Body content</p>}
    />,
  )
}

describe('EntityDisclosureHeaderAnatomy', () => {
  it('places disclosure trigger in leading rail with heading', () => {
    renderInCollapsibleContext(
      <EntityDisclosureHeaderAnatomy entity={HARBOR_DISTRICT_ENTITY} density="compact" />,
    )

    const leading = document.querySelector('[data-entity-item-slot="leading"]')
    const content = document.querySelector('[data-entity-item-slot="content"]')

    expect(leading).toBeTruthy()
    expect(content).toBeTruthy()
    expect(leading?.querySelector('button[aria-expanded]')).toBeTruthy()
    expect(screen.getByText('Harbor District')).toBeInTheDocument()
    expect(document.querySelector('[data-entity-item-slot="trailing"]')).toBeNull()
  })

  it('renders caret + heading + description', () => {
    renderInCollapsibleContext(
      <EntityDisclosureHeaderAnatomy entity={HARBOR_DISTRICT_ENTITY} density="compact" />,
    )

    expect(screen.getByText('Located in Grey Coast')).toBeInTheDocument()
  })

  it('renders caret + trailing action', () => {
    renderInCollapsibleContext(
      <EntityDisclosureHeaderAnatomy
        entity={HARBOR_DISTRICT_ENTITY}
        density="compact"
        trailing={{ kind: 'action', content: <button type="button">Add</button> }}
      />,
    )

    expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument()
    expect(document.querySelector('[data-entity-item-slot="trailing"]')).toBeTruthy()
  })

  it('renders caret + trailing group', () => {
    renderInCollapsibleContext(
      <EntityDisclosureHeaderAnatomy
        entity={HARBOR_DISTRICT_ENTITY}
        density="compact"
        trailing={{
          kind: 'group',
          primary: <button type="button">Add</button>,
          secondary: '12 gp',
        }}
      />,
    )

    expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument()
    expect(screen.getByText('12 gp')).toBeInTheDocument()
  })

  it('links heading when headingHref is provided', () => {
    render(
      <MemoryRouter>
        <CollapsibleListItem
          itemId="test-item"
          toolbarAriaLabel="Test item"
          collapsible
          rowLayout="entity-card"
          toolbarLeadingChrome="none"
          header={
            <EntityDisclosureHeaderAnatomy
              entity={HARBOR_DISTRICT_ENTITY}
              headingHref="/locations/harbor"
              density="compact"
            />
          }
          body={<p>Body content</p>}
        />
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: 'Harbor District' })).toHaveAttribute(
      'href',
      '/locations/harbor',
    )
  })
})
