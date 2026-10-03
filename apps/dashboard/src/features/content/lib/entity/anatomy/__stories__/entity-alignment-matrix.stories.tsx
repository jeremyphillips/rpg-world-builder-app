import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import { useState, type ReactNode } from 'react'

import {
  ActionIcon,
  iconGhostControlVariants,
  NumberStepper,
  type ContentCardDensity,
} from '@rpg/ui'
import {
  expectRowAnatomyAligned,
  waitForRowAnatomyLayout,
} from '@rpg/ui/storybook/row-anatomy-geometry'

import { ContentEntityCard, DetailRowLeadingMedia, DisclosureEntityCard } from '@/features/content'
import { DetailEntityRow } from '../../../detail/row/entity/detail-entity-row'
import type { EntitySummaryModel } from '../../summary/entity-summary.types'
import type { EntityAnatomyTrailing } from '../entity-anatomy-trailing.types'

const mockDragHandleProps = {
  attributes: {
    role: 'button',
    tabIndex: 0,
    'aria-disabled': false,
    'aria-pressed': false,
    'aria-roledescription': 'draggable',
    'aria-describedby': 'dnd-kit-description',
  },
  listeners: {},
} as const

type LeadingCase = 'none' | 'caret' | 'grip-caret'
type DepthCase = 'heading' | 'description' | 'status'

const LEADING_CASES: readonly LeadingCase[] = ['none', 'caret', 'grip-caret']
const DEPTH_CASES: readonly DepthCase[] = ['heading', 'description', 'status']
const DENSITIES: readonly ContentCardDensity[] = ['compact', 'comfortable']

function RemoveUtility({ label }: { label: string }) {
  return (
    <button
      type="button"
      className={iconGhostControlVariants({ hover: 'accent', layout: 'flex' })}
      aria-label={`Remove ${label}`}
    >
      <ActionIcon action="remove" step="md" />
    </button>
  )
}

function StepperUtility({ label }: { label: string }) {
  const [value, setValue] = useState(2)
  return (
    <NumberStepper aria-label={`${label} quantity`} value={value} onChange={setValue} max={20} />
  )
}

type TrailingCase = {
  id: string
  build: (label: string) => EntityAnatomyTrailing | undefined
}

const TRAILING_CASES: readonly TrailingCase[] = [
  { id: 'none', build: () => undefined },
  {
    id: 'action',
    build: () => ({
      kind: 'action',
      content: (
        <button type="button" className="text-sm text-link">
          Select
        </button>
      ),
    }),
  },
  {
    id: 'utility-remove',
    build: (label) => ({ kind: 'utility', content: <RemoveUtility label={label} /> }),
  },
  {
    id: 'utility-stepper',
    build: (label) => ({ kind: 'utility', content: <StepperUtility label={label} /> }),
  },
  { id: 'indicator-chevron', build: () => ({ kind: 'indicator', variant: 'chevron' }) },
  {
    id: 'indicator-quantity',
    build: () => ({ kind: 'indicator', variant: 'quantity', quantity: 3 }),
  },
  {
    id: 'group',
    build: () => ({
      kind: 'group',
      primary: (
        <button type="button" className="text-sm text-link">
          Add
        </button>
      ),
      secondary: { kind: 'price', label: '15 gp' },
    }),
  },
]

function buildEntity(depth: DepthCase, withMedia: boolean, label: string): EntitySummaryModel {
  return {
    heading: label,
    classification: 'Settlement',
    description: depth === 'heading' ? undefined : 'Located in Grey Coast',
    status: depth === 'status' ? [{ kind: 'badge', label: 'Member', tone: 'success' }] : undefined,
    media: withMedia ? (
      <DetailRowLeadingMedia size="xs">
        <span aria-hidden>HD</span>
      </DetailRowLeadingMedia>
    ) : undefined,
  }
}

function MatrixCard({
  density,
  leading,
  entity,
  trailing,
  label,
}: {
  density: ContentCardDensity
  leading: LeadingCase
  entity: EntitySummaryModel
  trailing: EntityAnatomyTrailing | undefined
  label: string
}) {
  const [collapsed, setCollapsed] = useState(true)

  if (leading === 'none') {
    return <ContentEntityCard entity={entity} density={density} trailing={trailing} />
  }

  return (
    <DisclosureEntityCard
      itemId={label}
      toolbarAriaLabel={label}
      entity={entity}
      density={density}
      trailing={trailing}
      collapsed={collapsed}
      onToggleCollapse={() => setCollapsed((current) => !current)}
      dragHandleProps={leading === 'grip-caret' ? mockDragHandleProps : undefined}
    >
      <p className="text-sm text-muted-foreground">Disclosed body.</p>
    </DisclosureEntityCard>
  )
}

function MatrixColumn({ density }: { density: ContentCardDensity }) {
  const cards: ReactNode[] = []
  let index = 0

  for (const trailingCase of TRAILING_CASES) {
    for (const depth of DEPTH_CASES) {
      const leading = LEADING_CASES[index % LEADING_CASES.length]!
      const withMedia = index % 2 === 1
      const label = `${density} ${trailingCase.id} ${depth} ${leading}${withMedia ? ' media' : ''}`
      cards.push(
        <div key={label} data-recipe-name={label}>
          <MatrixCard
            density={density}
            leading={leading}
            entity={buildEntity(depth, withMedia, label)}
            trailing={trailingCase.build(label)}
            label={label}
          />
        </div>,
      )
      index += 1
    }
  }

  return (
    <section aria-label={`${density} density`} className="flex min-w-0 flex-col gap-2">
      {cards}
    </section>
  )
}

const MATRIX_GRID_COUNT = TRAILING_CASES.length * DEPTH_CASES.length * DENSITIES.length

const meta = {
  title: 'Content/Entity/Alignment matrix',
  parameters: { layout: 'padded' },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

/**
 * Every leading × trailing × content-depth × media combination on the row-track grid.
 * The play function measures real layout — band centers, meta/status tops, and full-cell
 * centering — so a consumer offset or self-alignment override fails here.
 */
export const Matrix: Story = {
  render: () => (
    <div className="grid max-w-5xl grid-cols-2 gap-6">
      {DENSITIES.map((density) => (
        <MatrixColumn key={density} density={density} />
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    await waitForRowAnatomyLayout()
    await expectRowAnatomyAligned(canvasElement, { minGrids: MATRIX_GRID_COUNT })
  },
}

function measureGlyphInsets(scope: HTMLElement, glyphSelector: string) {
  const frame = scope.querySelector<HTMLElement>('[data-entity-surface-start]')
  const glyph = scope.querySelector<SVGElement>(glyphSelector)
  if (!frame || !glyph) throw new Error(`Missing frame or glyph for ${glyphSelector}`)

  const frameRect = frame.getBoundingClientRect()
  const style = getComputedStyle(frame)
  const glyphRect = glyph.getBoundingClientRect()
  return {
    start: glyphRect.left - (frameRect.left + Number.parseFloat(style.borderLeftWidth)),
    end: frameRect.right - Number.parseFloat(style.borderRightWidth) - glyphRect.right,
  }
}

function EdgeGeometryPair({ density }: { density: ContentCardDensity }) {
  const [collapsed, setCollapsed] = useState(true)
  return (
    <div className="flex flex-col gap-2">
      <div data-edge-case={`${density}-trailing-remove`}>
        <ContentEntityCard
          entity={{ heading: 'Longsword', classification: 'Martial weapon' }}
          density={density}
          trailing={{ kind: 'utility', content: <RemoveUtility label="Longsword" /> }}
        />
      </div>
      {density === 'compact' ? (
        <div data-edge-case="compact-detail-trailing-remove">
          <DetailEntityRow
            heading="The Silver Eel"
            classification="Building · Tavern"
            trailing={{ kind: 'utility', content: <RemoveUtility label="The Silver Eel" /> }}
          />
        </div>
      ) : null}
      <div data-edge-case={`${density}-leading-caret`}>
        <DisclosureEntityCard
          itemId={`${density}-caret`}
          toolbarAriaLabel="Harbor District"
          entity={{ heading: 'Harbor District', classification: 'Settlement' }}
          density={density}
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed((current) => !current)}
        >
          <p className="text-sm text-muted-foreground">Disclosed body.</p>
        </DisclosureEntityCard>
      </div>
    </div>
  )
}

/**
 * Edge contract: a trailing ghost utility sits as far from the end edge as a leading caret
 * sits from the start edge — the surface tightens whichever edge carries utility chrome.
 */
export const UtilityEdgeParity: Story = {
  render: () => (
    <div className="flex max-w-md flex-col gap-6">
      {DENSITIES.map((density) => (
        <EdgeGeometryPair key={density} density={density} />
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    await waitForRowAnatomyLayout()
    for (const density of DENSITIES) {
      const remove = canvasElement.querySelector<HTMLElement>(
        `[data-edge-case="${density}-trailing-remove"]`,
      )!
      const caret = canvasElement.querySelector<HTMLElement>(
        `[data-edge-case="${density}-leading-caret"]`,
      )!
      const removeInsets = measureGlyphInsets(remove, '[data-entity-item-slot="trailing"] svg')
      const caretInsets = measureGlyphInsets(caret, '[aria-expanded] svg')
      await expect(Math.abs(removeInsets.end - caretInsets.start)).toBeLessThanOrEqual(1)
    }

    const detailRemove = canvasElement.querySelector<HTMLElement>(
      '[data-edge-case="compact-detail-trailing-remove"]',
    )!
    const compactCaret = canvasElement.querySelector<HTMLElement>(
      '[data-edge-case="compact-leading-caret"]',
    )!
    const detailInsets = measureGlyphInsets(detailRemove, '[data-entity-item-slot="trailing"] svg')
    const caretInsets = measureGlyphInsets(compactCaret, '[aria-expanded] svg')
    await expect(Math.abs(detailInsets.end - caretInsets.start)).toBeLessThanOrEqual(1)

    await expectRowAnatomyAligned(canvasElement, { minGrids: DENSITIES.length * 2 + 1 })
  },
}
