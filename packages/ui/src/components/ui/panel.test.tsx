import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Button } from './button.client'
import { Panel } from './panel'

const panelCss = readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'panel.css'), 'utf8')
const copyScaleCss = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), 'copy-scale.css'),
  'utf8',
)

describe('Panel', () => {
  it('renders caller children as direct element children', () => {
    render(
      <Panel>
        <span>First</span>
        <span>Second</span>
      </Panel>,
    )

    const panel = screen.getByText('First').parentElement
    expect(panel?.tagName).toBe('DIV')
    expect(panel?.childElementCount).toBe(2)
    expect(panel).toHaveClass('ui-panel', 'ui-panel--transparent', 'ui-panel--comfortable')
    expect(panel).not.toHaveClass('ui-panel--bleed')
  })

  it('uses the requested element and drops inset when bleed is set', () => {
    render(
      <Panel as="section" tone="subtle" density="compact" bleed>
        Ledger
      </Panel>,
    )

    const panel = screen.getByText('Ledger')
    expect(panel.tagName).toBe('SECTION')
    expect(panel).toHaveClass('ui-panel--subtle', 'ui-panel--compact', 'ui-panel--bleed')
  })

  it('does not add an overflow class that would clip focus or popovers', () => {
    render(
      <Panel tone="subtle" density="compact">
        <Button type="button">Focus me</Button>
      </Panel>,
    )

    const panel = screen.getByRole('button', { name: 'Focus me' }).parentElement
    expect(panel?.className).not.toMatch(/overflow/)
    expect(panelCss).not.toMatch(/overflow\s*:/)
  })
})

describe('panel.css', () => {
  it('keeps a subtle border and md radius on the transparent tone', () => {
    expect(panelCss).toMatch(/\.ui-panel\s*\{[^}]*border-radius:\s*var\(--radius-md\)/)
    expect(panelCss).toMatch(
      /\.ui-panel--transparent\s*\{[^}]*border-color:\s*var\(--border-subtle\)/,
    )
    expect(panelCss).not.toMatch(/--radius-card/)
  })

  it('maps subtle to the subtle surface token', () => {
    expect(panelCss).toMatch(
      /\.ui-panel--subtle\s*\{[^}]*--ui-surface-bg:\s*var\(--surface-subtle\)[^}]*--surface-current:\s*var\(--surface-subtle\)/,
    )
  })

  it('puts inset on the root and zeroes it for bleed', () => {
    expect(panelCss).toMatch(/\.ui-panel\s*\{[^}]*padding-block:\s*var\(--ui-surface-inset-block\)/)
    expect(panelCss).toMatch(/\.ui-panel--bleed\s*\{[^}]*padding-block:\s*0/)
  })

  it('exposes section inset for bleed panel children', () => {
    expect(panelCss).toMatch(
      /\.ui-panel-section-inset\s*\{[^}]*padding-inline:\s*var\(--ui-surface-inset-inline/,
    )
  })

  it('publishes the shared density inset on panel density classes', () => {
    expect(copyScaleCss).toContain('.ui-panel--compact')
    expect(copyScaleCss).toContain('.ui-panel--comfortable')
    expect(copyScaleCss).toContain('.ui-panel--spacious')
  })
})
