'use client'

import type { Meta, StoryObj } from '@storybook/react-vite'

import { cn } from '../../lib/utils'
import { Card } from '../../components/ui/card'
import { Heading } from '../../components/ui/heading'
import { Text } from '../../components/ui/text'
import { cardSurfaceClasses } from '../../components/ui/card.variants'
import { resolveSurfaceClasses } from '../../components/ui/surface.variants'
import { establishSurfaceCurrent } from '../../components/ui/surface-current.lib'
import {
  colorPaletteGroupHeaderClasses,
  colorPaletteGroupSectionClasses,
  colorPaletteHeaderClasses,
  colorPalettePageClasses,
} from './color-palette.variants'

const CHROME_SAMPLES = [
  { label: 'foreground', className: 'text-foreground' },
  { label: 'foreground-subtle', className: 'text-foreground-subtle' },
  { label: 'muted-foreground', className: 'text-muted-foreground' },
  { label: 'foreground-disabled', className: 'text-foreground-disabled' },
  { label: 'border-subtle', className: 'border border-border-subtle' },
  { label: 'border', className: 'border border-border' },
] as const

const OWNERSHIP_ROWS = [
  { shell: 'Card / raised resolveSurfaceClasses', ownership: 'establishes', plane: '--card' },
  { shell: 'InsetPanel sunken', ownership: 'establishes', plane: '--sunken' },
  {
    shell: 'Select / Combobox / DropdownMenu content',
    ownership: 'establishes',
    plane: '--popover',
  },
  { shell: 'Modal / Sheet / Toast', ownership: 'establishes', plane: '--card' },
  { shell: 'Sidebar shell', ownership: 'establishes', plane: '--sidebar' },
  {
    shell: 'Elevation wash (subtle/muted/strong)',
    ownership: 'establishes',
    plane: 'matching wash',
  },
  { shell: 'Avatar bg-muted glyph chip', ownership: 'inherits', plane: '—' },
  { shell: 'Segmented selected pill', ownership: 'inherits', plane: '—' },
  { shell: 'Field input chrome', ownership: 'field plane', plane: '--palette-surface-field' },
] as const

function ChromeSampleGrid({ title }: { title?: string }) {
  return (
    <div className="space-y-3">
      {title ? (
        <Text variant="muted" className="text-sm">
          {title}
        </Text>
      ) : null}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {CHROME_SAMPLES.map((sample) => (
          <div key={sample.label} className={cn('rounded-md px-3 py-2 text-sm', sample.className)}>
            {sample.label}
          </div>
        ))}
      </div>
    </div>
  )
}

function SurfaceChromeMatrix() {
  return (
    <div className={colorPalettePageClasses}>
      <header className={colorPaletteHeaderClasses}>
        <Heading variant="page" as="h1">
          Surface-relative chrome
        </Heading>
        <Text variant="muted" className="text-base leading-relaxed">
          Neutral muted ink and quiet borders mix toward inherited{' '}
          <code className="font-mono text-sm">--surface-current</code>. Establishing shells rebind
          the plane; decorative fills intentionally inherit.
        </Text>
      </header>

      <section className={colorPaletteGroupSectionClasses} aria-labelledby="nested-cases">
        <div className={colorPaletteGroupHeaderClasses}>
          <Heading variant="section" as="h2" id="nested-cases">
            Nested acceptance cases
          </Heading>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <Card className="space-y-4 p-6">
            <Heading variant="subsection" as="h3">
              Card in card
            </Heading>
            <ChromeSampleGrid title="Outer card plane" />
            <div className={cn(cardSurfaceClasses, 'space-y-3 p-4')}>
              <Text variant="muted">Inner card plane</Text>
              <ChromeSampleGrid />
            </div>
          </Card>

          <div
            className={cn(
              resolveSurfaceClasses({ emphasis: 'default' }),
              'space-y-4 rounded-xl p-6',
            )}
          >
            <Heading variant="subsection" as="h3">
              Card in muted wash
            </Heading>
            <ChromeSampleGrid title="Outer muted wash keeps its plane" />
            <div className={cn(cardSurfaceClasses, 'space-y-3 p-4')}>
              <Text variant="muted">Inner card re-establishes card plane</Text>
              <ChromeSampleGrid />
            </div>
          </div>

          <Card className="space-y-4 p-6">
            <Heading variant="subsection" as="h3">
              Sunken inside card
            </Heading>
            <div className={cn(resolveSurfaceClasses({ elevation: 'sunken' }), 'space-y-3 p-4')}>
              <Text variant="muted">Sunken establishes --sunken</Text>
              <ChromeSampleGrid />
            </div>
          </Card>

          <Card className="space-y-4 p-6">
            <Heading variant="subsection" as="h3">
              Decorative avatar inherits card plane
            </Heading>
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-muted text-sm font-medium">
                AV
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">Nearby label</p>
                <p className="text-sm text-muted-foreground">
                  Muted copy stays on card plane — avatar fill does not rebind.
                </p>
              </div>
            </div>
          </Card>

          <div
            className={cn(
              cardSurfaceClasses,
              establishSurfaceCurrent('popover'),
              'space-y-4 p-6 lg:col-span-2',
            )}
          >
            <Heading variant="subsection" as="h3">
              Popover plane (portaled content pattern)
            </Heading>
            <Text variant="muted">
              Select / Combobox / DropdownMenu content roots establish{' '}
              <code className="font-mono text-sm">--popover</code> for muted option and separator
              text.
            </Text>
            <div className="rounded-md border border-border-subtle p-3">
              <p className="text-sm text-muted-foreground">Muted option label</p>
              <p className="text-sm text-foreground-subtle">Subtle helper copy</p>
            </div>
          </div>
        </div>
      </section>

      <section className={colorPaletteGroupSectionClasses} aria-labelledby="ownership-table">
        <div className={colorPaletteGroupHeaderClasses}>
          <Heading variant="section" as="h2" id="ownership-table">
            Establish vs inherit ownership
          </Heading>
          <Text variant="muted">
            Call sites compose <code className="font-mono text-sm">establishSurfaceCurrent</code>{' '}
            when they paint a containing plane; decorative fills omit it.
          </Text>
        </div>
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-border bg-surface-subtle">
              <tr>
                <th className="px-4 py-3 font-medium text-foreground">Surface / shell</th>
                <th className="px-4 py-3 font-medium text-foreground">Ownership</th>
                <th className="px-4 py-3 font-medium text-foreground">Plane var</th>
              </tr>
            </thead>
            <tbody>
              {OWNERSHIP_ROWS.map((row) => (
                <tr key={row.shell} className="border-b border-border-subtle last:border-b-0">
                  <td className="px-4 py-3 text-foreground">{row.shell}</td>
                  <td className="px-4 py-3 text-muted-foreground">{row.ownership}</td>
                  <td className="px-4 py-3 font-mono text-xs text-foreground-subtle">
                    {row.plane}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

const meta = {
  title: 'Design Tokens/Surface Chrome',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Surface-relative neutral chrome matrix, nested acceptance cases, and establish vs inherit ownership table.',
      },
    },
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Matrix: Story = {
  render: () => <SurfaceChromeMatrix />,
}
