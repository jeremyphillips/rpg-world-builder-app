import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs.client'

describe('Tabs', () => {
  it('applies semantic list and trigger classes for line variant', () => {
    render(
      <Tabs variant="line" defaultValue="a">
        <TabsList aria-label="Sections">
          <TabsTrigger value="a">A</TabsTrigger>
        </TabsList>
      </Tabs>,
    )

    const tablist = screen.getByRole('tablist', { name: 'Sections' })
    expect(tablist).toHaveClass('ui-tabs__list', 'ui-tabs__list--line', 'ui-border--default')

    const tab = screen.getByRole('tab', { name: 'A' })
    expect(tab).toHaveClass('ui-tabs__trigger', 'ui-tabs__trigger--line', 'ui-focus-ring')
  })

  it('omits appearance modifiers for none variant', () => {
    render(
      <Tabs variant="none" defaultValue="a">
        <TabsList aria-label="Custom">
          <TabsTrigger value="a">A</TabsTrigger>
        </TabsList>
      </Tabs>,
    )

    const tablist = screen.getByRole('tablist', { name: 'Custom' })
    expect(tablist).toHaveClass('ui-tabs__list')
    expect(tablist).not.toHaveClass('ui-tabs__list--line', 'ui-tabs__list--pill')

    const tab = screen.getByRole('tab', { name: 'A' })
    expect(tab).toHaveClass('ui-tabs__trigger', 'ui-focus-ring')
    expect(tab).not.toHaveClass('ui-tabs__trigger--line', 'ui-tabs__trigger--pill')
  })

  it('marks disabled tabs and hides inactive panel content', () => {
    render(
      <Tabs variant="line" defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="other" disabled>
            Other
          </TabsTrigger>
        </TabsList>
        <TabsContent value="active">Visible</TabsContent>
        <TabsContent value="other">Hidden</TabsContent>
      </Tabs>,
    )

    expect(screen.getByRole('tab', { name: 'Other' })).toBeDisabled()

    const panels = screen.getAllByRole('tabpanel', { hidden: true })
    expect(panels).toHaveLength(2)

    const visiblePanel = panels.find((panel) => panel.getAttribute('data-state') === 'active')
    expect(visiblePanel).toHaveTextContent('Visible')

    const inactivePanel = panels.find((panel) => panel.getAttribute('data-state') === 'inactive')
    expect(inactivePanel).toHaveAttribute('hidden', '')
  })

  it('applies content spacing class', () => {
    render(
      <Tabs variant="line" defaultValue="a">
        <TabsList>
          <TabsTrigger value="a">A</TabsTrigger>
        </TabsList>
        <TabsContent value="a">Body</TabsContent>
      </Tabs>,
    )

    expect(screen.getByText('Body')).toHaveClass('ui-tabs__content')
  })
})
