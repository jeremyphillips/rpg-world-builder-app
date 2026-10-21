import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import { RadioGroup } from './radio-group.client'
import { RadioOptionCard } from './radio-option-card.client'
import {
  SelectionOptionCard,
  SelectionOptionCardHeaderAction,
} from './selection-option-card.client'
import {
  SelectionOptionCardEmbeddedPanel,
  SelectionOptionCardEmbeddedPanelHeader,
} from './selection-option-card-embedded-panel.client'
import {
  UI_OPTION_CARD_EMBEDDED_IN_FLOW_CLASS,
  UI_OPTION_CARD_EMBEDDED_PANEL_CLASS,
  UI_OPTION_CARD_PRIMARY_CLASS,
} from './selection-option-card.lib'

const uiDir = dirname(fileURLToPath(import.meta.url))

function stripLayer(css: string): string {
  return css.replace('@layer components {', '').replace(/\n}\s*$/, '')
}

const optionCardMeasureCss = [
  `:root { --text-xs: 12px; --text-sm: 14px; --text-base: 16px; --text-xs--line-height: --text-sm--line-height: 20px; --spacing: 4px; --font-weight-heading: 600; --tracking-heading: 0; --border: #ccc; --radius-card: 8px; --control-choice-indicator-size-sm: --control-choice-indicator-size-lg: }`,
  stripLayer(readFileSync(join(uiDir, 'copy-scale.css'), 'utf8')),
  stripLayer(readFileSync(join(uiDir, 'ui-radio-card.css'), 'utf8')),
].join('\n')

function installOptionCardMeasureCss(): void {
  const style = document.createElement('style')
  style.setAttribute('data-test', 'option-card-measure')
  style.textContent = optionCardMeasureCss
  document.head.appendChild(style)
}

const TOKEN_PX: Record<string, string> = {
  '--text-xs': '12px',
  '--text-sm': '14px',
  '--text-base': '16px',
}

/** jsdom reports calc(var()) as specified. Substitute the installed token lengths. */
function resolvedCalcPx(specified: string): number {
  const expr = specified
    .replaceAll('var(--control-choice-indicator-size-sm)', '16')
    .replaceAll('var(--control-choice-indicator-size-lg)', '20')
    .replaceAll('var(--spacing)', '4')
    .replaceAll('px', '')
    .replace(/^calc\(/, '(')
    .replace(/\s+/g, '')
  if (!/^[0-9+*/().-]+$/.test(expr)) {
    throw new Error(`Unresolved length: ${specified}`)
  }
  return Function(`"use strict"; return (${expr})`)() as number
}

function resolvedCustomPx(element: Element, property: string, fallback: string): string {
  let node: Element | null = element
  while (node) {
    const specified = getComputedStyle(node).getPropertyValue(property).trim()
    const token = specified.match(/^var\((--[^)]+)\)$/)?.[1]
    if (token && TOKEN_PX[token]) return TOKEN_PX[token]
    if (specified.endsWith('px')) return specified
    node = node.parentElement
  }
  return fallback
}

describe('SelectionOptionCard', () => {
  it('renders title adornment and embedded content only when provided', () => {
    const { rerender } = render(
      <SelectionOptionCard selected label="Heavy Armor" description="Chain Mail." />,
    )

    expect(screen.queryByText('Customized')).not.toBeInTheDocument()
    expect(screen.queryByText('Customize Heavy Armor')).not.toBeInTheDocument()

    rerender(
      <SelectionOptionCard
        selected
        label="Heavy Armor"
        description="Chain Mail."
        titleAdornment={<span>Customized</span>}
        embedded={<p>Customize Heavy Armor</p>}
      />,
    )

    expect(screen.getByText('Customized')).toBeInTheDocument()
    expect(screen.getByText('Customize Heavy Armor')).toBeInTheDocument()
  })

  it('renders header slots, label, description, and summary lines', () => {
    render(
      <SelectionOptionCard
        selected
        headerStartSlot={<span>Eyebrow</span>}
        headerEndSlot={<SelectionOptionCardHeaderAction label="Change" onClick={() => undefined} />}
        label="Equipment package A"
        description="Includes shield and sword."
        summaryLines={['Gold: 10 gp', 'Items: 3']}
      />,
    )

    expect(screen.getByText('Eyebrow')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Change' })).toBeInTheDocument()
    expect(screen.getByText('Equipment package A')).toBeInTheDocument()
    expect(screen.getByText('Includes shield and sword.')).toBeInTheDocument()
    expect(screen.getByText('Gold: 10 gp')).toBeInTheDocument()
  })

  it('renders comfortable-density header actions at sm compact control size', () => {
    render(
      <SelectionOptionCard
        selected
        headerEndSlot={
          <SelectionOptionCardHeaderAction label="Change package" onClick={() => undefined} />
        }
        label="Selected package"
      />,
    )

    const action = screen.getByRole('button', { name: 'Change package' })
    expect(action.className).toContain('shrink-0')
    expect(action.className).toContain('ui-button__text--sm-compact')
    expect(action.className).toContain('text-action-standalone')
    expect(action.className).not.toContain('text-control-action-xs')
    expect(action.className).not.toContain('h-auto')
  })

  it('renders compact-density header actions at xs control-action typography', () => {
    render(
      <SelectionOptionCard
        selected
        density="compact"
        headerEndSlot={
          <SelectionOptionCardHeaderAction
            label="Change package"
            density="compact"
            onClick={() => undefined}
          />
        }
        label="Selected package"
      />,
    )

    const action = screen.getByRole('button', { name: 'Change package' })
    expect(action.className).toContain('text-control-action-xs')
    expect(action.className).toContain('ui-button__text--xs-compact')
    expect(action.className).not.toMatch(/\btext-sm\b/)
    expect(action.className).not.toMatch(/\btext-xs\b/)
  })

  it('resolves compact and comfortable copy from the card shell', () => {
    installOptionCardMeasureCss()
    const { rerender } = render(
      <SelectionOptionCard
        selected
        density="compact"
        headerEyebrow="Selected package"
        label="Equipment package A"
        description="Includes shield and sword."
        summaryLines={['Gold: 10 gp']}
      />,
    )

    const title = screen.getByRole('heading', { name: 'Equipment package A' })
    const description = screen.getByText('Includes shield and sword.')
    expect(title).toHaveClass('ui-copy-title')
    expect(title).not.toHaveClass('font-bold')
    expect(description).toHaveClass('ui-copy-supporting')
    expect(resolvedCustomPx(title, '--ui-copy-title-size', '16px')).toBe('14px')
    expect(resolvedCustomPx(description, '--ui-copy-supporting-size', '14px')).toBe('12px')
    expect(title.closest(`.${UI_OPTION_CARD_PRIMARY_CLASS}`)).toBeTruthy()
    expect(screen.getByText('Selected package').className).toContain('eyebrow-style-xs')

    rerender(
      <SelectionOptionCard
        selected
        density="comfortable"
        label="Equipment package A"
        description="Includes shield and sword."
      />,
    )

    const comfortableTitle = screen.getByRole('heading', { name: 'Equipment package A' })
    const comfortableDescription = screen.getByText('Includes shield and sword.')
    expect(resolvedCustomPx(comfortableTitle, '--ui-copy-title-size', '16px')).toBe('16px')
    expect(resolvedCustomPx(comfortableDescription, '--ui-copy-supporting-size', '14px')).toBe(
      '14px',
    )
  })

  it('keeps embedded panel titles on the compact copy step inside a comfortable card', () => {
    installOptionCardMeasureCss()
    render(
      <SelectionOptionCard
        selected
        density="comfortable"
        label="Heavy Armor"
        embedded={
          <SelectionOptionCardEmbeddedPanel>
            <SelectionOptionCardEmbeddedPanelHeader
              title="Customize Heavy Armor"
              description="Adjust the package."
            />
          </SelectionOptionCardEmbeddedPanel>
        }
        embeddedTone="panel"
      />,
    )

    const panelTitle = screen.getByRole('heading', { name: 'Customize Heavy Armor' })
    expect(panelTitle.closest('.ui-option-card-embedded-panel')).toBeTruthy()
    expect(resolvedCustomPx(panelTitle, '--ui-copy-title-size', '16px')).toBe('14px')
    expect(
      resolvedCustomPx(
        screen.getByText('Adjust the package.'),
        '--ui-copy-supporting-size',
        '14px',
      ),
    ).toBe('12px')
    const slot = panelTitle.closest(`.${UI_OPTION_CARD_EMBEDDED_PANEL_CLASS}`)
    expect(slot).toBeTruthy()
    expect(slot).not.toHaveClass(UI_OPTION_CARD_EMBEDDED_IN_FLOW_CLASS)
  })

  it('indents in-flow embedded content to the control column', () => {
    installOptionCardMeasureCss()
    const { rerender } = render(
      <SelectionOptionCard
        selected
        density="compact"
        label="Heavy Armor"
        embedded={<p>Customize Heavy Armor</p>}
      />,
    )

    const slot = screen.getByText('Customize Heavy Armor').parentElement
    expect(slot).toHaveClass(UI_OPTION_CARD_EMBEDDED_IN_FLOW_CLASS)
    expect(resolvedCalcPx(getComputedStyle(slot!).paddingInlineStart)).toBe(28)
    expect(slot?.closest('.ui-card')).toHaveClass('ui-card--compact')
    expect(slot?.closest('.ui-card')).not.toHaveClass('ui-radio-card--row-compact')

    rerender(
      <SelectionOptionCard
        selected
        density="comfortable"
        label="Heavy Armor"
        embedded={<p>Customize Heavy Armor</p>}
      />,
    )
    const comfortableSlot = screen.getByText('Customize Heavy Armor').parentElement
    expect(resolvedCalcPx(getComputedStyle(comfortableSlot!).paddingInlineStart)).toBe(36)
  })

  it('publishes radio-row copy scale on the row shell, not ui-card density', () => {
    installOptionCardMeasureCss()
    render(
      <RadioGroup aria-label="Species" value="dwarf" onValueChange={() => undefined}>
        <RadioOptionCard
          variant="row"
          density="compact"
          value="dwarf"
          label="Dwarf"
          description="Humanoid"
        />
        <RadioOptionCard
          variant="card"
          density="compact"
          value="elf"
          label="Elf"
          description="Humanoid"
        />
      </RadioGroup>,
    )

    const row = screen.getByRole('radio', { name: /Dwarf/i }).closest('.ui-radio-card--row')
    const card = screen.getByRole('radio', { name: /Elf/i }).closest('.ui-card')
    expect(row).toHaveClass('ui-radio-card--row-compact')
    expect(row).not.toHaveClass('ui-card--compact')
    expect(card).toHaveClass('ui-card--compact')
    expect(card).not.toHaveClass('ui-radio-card--row-compact')

    const rowTitle = screen.getByText('Dwarf')
    const cardTitle = screen.getByText('Elf')
    const rowDescription = row?.querySelector('.ui-copy-supporting')
    expect(resolvedCustomPx(rowTitle, '--ui-copy-title-size', '16px')).toBe('14px')
    expect(resolvedCustomPx(cardTitle, '--ui-copy-title-size', '16px')).toBe('14px')
    expect(rowDescription).toBeTruthy()
    expect(resolvedCustomPx(rowDescription!, '--ui-copy-supporting-size', '14px')).toBe('12px')
  })

  it('applies strong selected card surface when selected', () => {
    const { container } = render(
      <SelectionOptionCard selected label="Selected package" summaryLines={['Line one']} />,
    )

    const shell = container.firstElementChild
    expect(shell).toHaveClass('ui-card--strong', 'ui-card--selected', 'ui-card--elevation-raised')
  })

  itAxe('has no axe accessibility violations', async () => {
    const { container } = render(
      <SelectionOptionCard
        selected
        label="Equipment package A"
        description="Includes shield and sword."
        summaryLines={['Gold: 10 gp']}
      />,
    )
    await expectNoAxeViolations(container)
  })
})
