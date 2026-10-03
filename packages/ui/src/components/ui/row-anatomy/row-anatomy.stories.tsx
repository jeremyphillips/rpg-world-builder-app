import type { Meta, StoryObj } from '@storybook/react-vite'
import type { ReactNode } from 'react'
import { expect } from 'storybook/test'

import { cn } from '../../../lib/utils'
import { expectRowAnatomyAligned } from '../../../storybook/row-anatomy-geometry'
import { Badge } from '../badge'
import { RowAnatomyCell } from './row-anatomy-cell'
import type { RowAnatomyBand } from './row-anatomy.types'
import { rowAnatomyRootProps, rowAnatomyTracksVariants } from './row-anatomy.variants'

/** Demo host — owns its own columns and horizontal gap, as real hosts do. */
function DemoHost({ band = 'control', children }: { band?: RowAnatomyBand; children: ReactNode }) {
  return (
    <div className="w-96 rounded-md border border-border p-3">
      <div
        {...rowAnatomyRootProps}
        className={cn(
          rowAnatomyTracksVariants({ band }),
          'grid-cols-[[leading]_auto_[content]_minmax(0,1fr)_[trailing]_auto] gap-x-2',
        )}
      >
        {children}
      </div>
    </div>
  )
}

function Heading() {
  return (
    <RowAnatomyCell cell={{ slot: 'band', column: 'content' }} data-testid="heading">
      <div className="truncate text-sm font-body-emphasis">Longsword</div>
    </RowAnatomyCell>
  )
}

function Stepper() {
  return (
    <RowAnatomyCell cell={{ slot: 'full', column: 'trailing' }} data-testid="utility">
      <div className="h-9 w-24 rounded-md border border-border" aria-hidden />
    </RowAnatomyCell>
  )
}

function compactActionBox(label: string) {
  return (
    <div className="flex h-control-action-compact items-center rounded-sm border border-border px-2 text-xs">
      {label}
    </div>
  )
}

const meta = {
  title: 'UI/RowAnatomy',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Row tracks and cross-column vertical alignment only. Hosts own columns, gaps, and inset. See packages/ui/docs/row-anatomy.md.',
      },
    },
  },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

/** 36px `full` utility beside a heading-only band: slack splits evenly; heading centers on the stepper. */
export const FullUtilityHeadingOnly: Story = {
  render: () => (
    <DemoHost>
      <Heading />
      <Stepper />
    </DemoHost>
  ),
  play: async ({ canvasElement }) => {
    const [report] = await expectRowAnatomyAligned(canvasElement)
    await expect(report!.tracks.band).toBeCloseTo(24, 0)
    await expect(report!.tracks.meta).toBe(0)
    await expect(report!.tracks.status).toBe(0)
    await expect(report!.tracks.slackStart).toBeCloseTo(6, 0)
    await expect(report!.tracks.slackEnd).toBeCloseTo(report!.tracks.slackStart, 0)

    const heading = canvasElement.querySelector('[data-testid="heading"]')!.getBoundingClientRect()
    const utility = canvasElement.querySelector('[data-testid="utility"]')!.getBoundingClientRect()
    await expect(
      Math.abs(heading.top + heading.height / 2 - (utility.top + utility.height / 2)),
    ).toBeLessThanOrEqual(1)
  },
}

/** Same utility beside heading, meta, and status: content rows exceed 36px so gutters are 0. */
export const FullUtilityWithMetaAndStatus: Story = {
  render: () => (
    <DemoHost>
      <Heading />
      <RowAnatomyCell cell={{ slot: 'meta', column: 'content' }}>
        <div className="truncate text-xs text-muted-foreground">Martial weapon · 3 lb</div>
      </RowAnatomyCell>
      <RowAnatomyCell cell={{ slot: 'status', column: 'content' }}>
        <Badge size="sm">Proficient</Badge>
      </RowAnatomyCell>
      <Stepper />
    </DemoHost>
  ),
  play: async ({ canvasElement }) => {
    const [report] = await expectRowAnatomyAligned(canvasElement)
    await expect(report!.tracks.band).toBeCloseTo(24, 0)
    await expect(report!.tracks.slackStart).toBe(0)
    await expect(report!.tracks.slackEnd).toBe(0)
    await expect(report!.tracks.meta).toBeGreaterThan(0)
    await expect(report!.tracks.status).toBeGreaterThan(0)
  },
}

/** Band action plus meta secondary in the trailing column share content-row offsets. */
export const TrailingGroupMetaParity: Story = {
  render: () => (
    <DemoHost>
      <Heading />
      <RowAnatomyCell cell={{ slot: 'meta', column: 'content' }}>
        <div className="truncate text-xs text-muted-foreground">Martial weapon</div>
      </RowAnatomyCell>
      <RowAnatomyCell cell={{ slot: 'band', column: 'trailing' }}>
        {compactActionBox('Add')}
      </RowAnatomyCell>
      <RowAnatomyCell cell={{ slot: 'meta', column: 'trailing' }}>
        <div className="text-xs tabular-nums text-muted-foreground">15 GP</div>
      </RowAnatomyCell>
    </DemoHost>
  ),
  play: async ({ canvasElement }) => {
    await expectRowAnatomyAligned(canvasElement)
  },
}

/** `stretch` trailing covers the full row height without inflating content tracks. */
export const StretchTrailing: Story = {
  render: () => (
    <DemoHost>
      <Heading />
      <RowAnatomyCell cell={{ slot: 'meta', column: 'content' }}>
        <div className="truncate text-xs text-muted-foreground">Martial weapon · 3 lb</div>
      </RowAnatomyCell>
      <RowAnatomyCell cell={{ slot: 'stretch', column: 'trailing' }} data-testid="stretch">
        <div className="h-full w-10 rounded-sm bg-muted" aria-hidden />
      </RowAnatomyCell>
    </DemoHost>
  ),
  play: async ({ canvasElement }) => {
    const [report] = await expectRowAnatomyAligned(canvasElement)
    await expect(report!.tracks.slackStart).toBe(0)
    await expect(report!.tracks.band).toBeCloseTo(24, 0)
  },
}

/** media-xs band: 32px media and a 24px band action share the band center. */
export const MediaXsBand: Story = {
  render: () => (
    <DemoHost band="media-xs">
      <RowAnatomyCell cell={{ slot: 'band', column: 'leading' }}>
        <div className="size-8 rounded-md bg-muted" aria-hidden />
      </RowAnatomyCell>
      <Heading />
      <RowAnatomyCell cell={{ slot: 'meta', column: 'content' }}>
        <div className="truncate text-xs text-muted-foreground">Martial weapon</div>
      </RowAnatomyCell>
      <RowAnatomyCell cell={{ slot: 'band', column: 'trailing' }}>
        {compactActionBox('Select')}
      </RowAnatomyCell>
    </DemoHost>
  ),
  play: async ({ canvasElement }) => {
    const [report] = await expectRowAnatomyAligned(canvasElement)
    await expect(report!.tracks.band).toBeCloseTo(32, 0)
  },
}
